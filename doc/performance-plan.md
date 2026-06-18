# 기획안 — 페이지 반응속도 개선 (네비게이션 체감 속도)

> 작성일: 2026-06-18
> 증상: 홈서버(www.kingduck.xyz)에서 페이지를 "왔다 갔다" 할 때 느림.
> 범위: **우리 repo(프론트/백엔드)에서 할 수 있는 앱 레벨 최적화**. (배포 인프라/터널은 별도)
> 방법: 실측 → 병목 우선순위 → 개선. 아래 수치는 로컬 백엔드(3100) 실측.

---

## 0. 실측된 병목 (근거)

### ① 캐릭터 list 응답이 너무 크다 — **최우선**
list API가 **캐릭터마다 `metadata`(JSON) 전체를 내려준다.** 카드는 이름·아이콘·등급만 쓰는데
스킬·음성대사·스탯·스토리까지 다 받는다.

| 게임 | `/character/{game}/list` 응답 크기 |
|---|---|
| 명조(wutheringwaves) | **7.7 MB** (1캐릭 ≈ 107KB × 54명, metadata 91키) |
| 스타레일 | 6.5 MB |
| 원신 | 5.8 MB |
| 니케 | 234 KB (metadata 가벼움) |
| zzz | 291 KB |

→ 원신/스타레일/명조 리스트 진입·뒤로가기마다 **6~8MB 전송**. 홈서버+Cloudflare Tunnel 경유면 이게 체감 지연의 핵심.

원인: `src/routes/character/service.ts`의 `getList`가 `select` 없이 `findMany({ include: {game,element,path} })`
→ `metadata`/`description` 등 모든 컬럼 반환.

### ② 정적 이미지가 매번 재검증된다
`/assets/...` 응답 헤더가 **`Cache-Control: public, max-age=0`** → 브라우저가 네비마다 조건부 요청(304 왕복).
이미지 수십 개 × 왕복 = 터널 경유 시 누적 지연.

원인: `src/index.ts`의 `express.static('/assets', ...)`에 `maxAge` 미설정(기본 0).

### ③ 재방문 시 재요청 (클라 캐시 없음)
리스트 데이터를 클라이언트에 캐시하지 않아, 같은 게임 리스트를 다시 열 때마다 위 ①을 재전송.

---

## 1. 개선안 (우선순위 · 예상 효과)

### P0 — list 페이로드 슬림화 (효과 최대, ~99%↓)
- **백엔드** `getList`에 `select` 추가: 카드에 필요한 필드만 반환하고 **`metadata`·`description` 제외**.
  - 포함: `id, gameId, elementId, pathId, name, rarity, weaponType, role, originalId, imageUrl` + `element/path`(필요 필드만 select), `game.slug`.
  - 7.7MB → **~50KB** 예상.
- **선행 확인**: 리스트 카드가 `metadata`의 어떤 값도 안 쓰는지 점검(현재 카드는 name/rarity/imageUrl/element relation 사용 → 안전). 쓰면 그 키만 별도 포함.
- (선택) 상세 진입 시에만 `metadata` 포함된 단건(`getCharacter`)을 부르므로 상세는 영향 없음.

### P0 — 정적 이미지 장기 캐시
- `express.static(..., { maxAge: '30d', immutable: true })` (또는 `setHeaders`로 `Cache-Control: public, max-age=2592000, immutable`).
- 아이콘은 이미 `?v=timestamp` 캐시버스팅이 있어 안전(교체 시 URL 바뀜). 캐릭터 이미지는 사실상 불변.
- 효과: 재방문/뒤로가기 시 이미지 네트워크 요청 0.

### P1 — 클라이언트 리스트 캐시 (재요청 제거)
- 게임별 리스트를 서비스 스토어/메모리에 캐시 → 같은 게임 재진입 시 재fetch 생략(또는 stale-while-revalidate).
- SvelteKit: `+page.ts` load 결과를 모듈 캐시/스토어에 보관하거나 `depends`+조건부 fetch. 슬림화(P0) 후엔 캐시 비용도 작아짐.

### P1 — 링크 프리페치
- SvelteKit `data-sveltekit-preload-data="hover"`(또는 레이아웃 기본값)로 캐릭터 카드 hover 시 상세 load 선fetch → 클릭 시 즉시 전환.

### P2 — API 응답 압축
- JSON 응답 gzip/brotli. 프록시(Caddy `encode gzip`)가 일부 처리하나, 백엔드 `compression` 미들웨어를 두면 직접 보장. (P0 슬림화 후엔 효과 작아지지만 detail/기타 JSON에 유효.)

### P2 — 이미지 지연로딩/사이징
- 리스트 카드 `<img loading="lazy">` + 적정 `width`(아이콘은 작게). 큰 splash는 상세에서만 로드.

### P2 — 상세 페이지 큰 metadata 분할(선택)
- `voiceLines`(스타레일 67개) 등 큰 배열은 필요 시 지연/접이식 로드 고려. (현재도 단건이라 치명적이진 않음)

---

## 2. 측정/검증

- **before/after**: 각 게임 list 응답 KB, 페이지 전환 시간(DevTools Network/Performance), Lighthouse 점수.
- 목표: list 응답 6~8MB → 수십 KB, 이미지 재방문 요청 0, 카드↔상세 전환 체감 즉시.

## 3. 작업 분해 (우리 repo)

**백엔드 (`kingduck-server`)**
1. `routes/character/service.ts` `getList` → `select`로 카드 필드만(메타 제외). 카드 미사용 확인 후 확정.
2. `index.ts` `express.static` `maxAge`/`immutable` 캐시 헤더.
3. (P2) `compression` 미들웨어.

**프론트 (`kingduck`)**
4. 리스트 클라 캐시(서비스 스토어) + 재진입 시 재fetch 생략.
5. `data-sveltekit-preload-data="hover"` 적용.
6. 리스트 카드 `loading="lazy"` + 사이즈.

---

### 요약 (가장 큰 두 방)

> **① list API에서 `metadata` 빼기**(7.7MB→~50KB) + **② 정적 이미지 장기 캐시**(max-age=0→30d immutable).
> 이 둘만으로 "왔다 갔다" 체감 지연 대부분이 사라진다. 나머지(클라 캐시·프리페치·압축)는 마감 다듬기.
