# 기획안 — 게임별 필터(속성/등급) 아이콘 + DB 관리

> 작성일: 2026-06-18
> 요청: 각 게임 필터(속성/등급 등)에 아이콘을 넣고, 게임 셋(필터 설정)을 **DB 기반**으로 관리.
> 참조: 스타레일의 속성/운명의 길 필터.

---

## 0. 현황 (이미 절반은 DB 기반이다)

- **속성/운명의길(특성) 필터는 이미 DB의 `Element.iconUrl`로 아이콘을 렌더한다.**
  - `ListFilterMenu.svelte`: 옵션을 `data.info.elements[]`(DB Element 레코드)에서 가져와
    `<img src="{currentUrl}/{item.iconUrl}">` + 라벨(`gameInit.type[key].list`)로 그린다.
  - 즉 **스타레일이 아이콘이 나오는 이유 = starrail Element 레코드에 `icon_url`이 채워져 있어서**다.
- 필터 **라벨 텍스트**(한글명)는 `*Init.ts`의 `type[key].list`(코드)에 있음. 아이콘은 DB, 라벨은 코드.

### 게임별 Element 아이콘 보유 현황 (실측)

| 게임 | DamageType(속성) | Path(특성/무기) | 필터 아이콘 |
|---|---|---|---|
| starrail | 7/7 | 9/9 | ✅ 나옴 |
| endfield | 5/5 | 5/5 | ✅ |
| wutheringwaves | 6/6 | 5/5 | ✅ |
| **genshin** | **0/7** | **0/5** | ❌ 빈 아이콘 |
| **nikke** | **0/5** | **0/6** | ❌ |
| **zzz** | **0/7** | **0/6** | ❌ |
| **reverse1999** | **0/6** | 0/1 | ❌ |

→ **문제 = genshin·nikke·zzz·reverse1999의 Element `icon_url`이 비어 있어 필터 아이콘이 안 나온다.**
(스타레일은 스크래퍼가 icon_url을 채웠고, 니케/zzz는 내 스크래퍼가 속성 아이콘을 안 받았다.)

## 1. 목표

1. 빠진 4개 게임의 속성/특성 **필터 아이콘을 채운다**(DB `Element.icon_url`).
2. 그 아이콘을 **어드민에서 업로드/교체**할 수 있게 한다(게임 셋 = DB 기반 관리). 게임 아이콘 업로드와 동일 패턴.
3. (2차) **등급(rarity) 필터 아이콘** — Element가 아니라 별도 처리 필요(아래 §4).

## 2. 핵심 설계 — Element 아이콘을 어드민에서 관리 (게임 아이콘 업로드와 동형)

이미 만든 **게임 아이콘 업로드**(`POST /admin/game/:slug/icon` → multer+sharp→webp→`static/logo`→`icon_url`)와
똑같은 패턴을 Element에 적용한다.

### 백엔드 (`kingduck-server`)
- **업로드 엔드포인트**: `POST /api/v0/admin/element/:id/icon` (multipart, 관리자 가드)
  - multer 메모리 수신 → sharp webp 변환 → `static/image/{gameSlug}/elements/{type}_{name}.webp` 저장
  - `elements.icon_url` 갱신(상대경로 + `?v=timestamp` 캐시버스팅)
- **Element 목록 조회**(어드민): 게임별 Element(속성/특성) + icon_url. (기존 `/admin/type/list` 있으면 재사용,
  없으면 추가) — `/admin/type` 화면용.

### 프론트 (`kingduck`)
- 어드민 **"타입 관리"**(`/admin/type`, 사이드바에 이미 있음) 화면에서:
  - 게임 선택 → 속성/특성 목록(이름 + 현재 아이콘 미리보기)
  - 각 항목 **아이콘 업로드**(파일 선택 → FormData POST → 즉시 반영). 게임 아이콘 업로드 UI 재사용.
- 사용자 측 필터는 코드 변경 없음 — `ListFilterMenu`가 이미 `Element.icon_url`을 읽으므로 업로드 즉시 필터에 반영.

> **이게 "게임 셋을 DB 기반으로 변경"의 실체다**: 필터 아이콘은 `Element` 테이블(DB)에 있고, 어드민 업로드로 채운다.

## 3. 아이콘 소스 (초기 채우기)

업로드 UI로 수동 채우는 것 외에, 초기 일괄 채우기 옵션:
- **스크래퍼 보강**: 각 게임 스크래퍼가 캐릭터의 속성/무기 아이콘 URL을 알고 있으면 Element 동기화 시 icon_url도 세팅.
  (니케: fandom에 속성/무기 아이콘 있음. zzz: zzz.gg 속성 아이콘. genshin: Ambr 속성 아이콘.)
- 단, 게임마다 소스가 달라 일괄 자동화는 게임별 작업. **1차는 어드민 업로드(수동)로 빠르게 채우고**, 자동화는 후속.

## 4. 등급(rarity) 색상 — 카드 뒷배경, DB + 어드민 편집

현재 등급별 카드 색상은 `*Init.ts`의 `list.card.rarityColors`(코드)에 있다:
```js
rarityColors: { '5': { border, background, text, gradient: { from, to, stop } }, '4': {...} }
```
`ListCardView`가 이걸로 카드 테두리/배경 그라데이션(`getCardBgStyle`)을 칠한다. 이걸 **DB화 + 어드민 색상 편집**으로.

### 저장 (DB)
- **`games` 테이블에 `rarity_colors Json?` 컬럼 추가**(가장 단순). 값 형식은 Init의 rarityColors 그대로:
  `{ "5": { border, background, text, gradient: { from, to, stop } }, "4": {...}, ... }`.
- (대안: 별도 `GameRarityColor` 테이블 — 정규화되지만 과함. JSON 컬럼이 적절.)

### 백엔드
- `GET /api/v0/game/:slug` 응답에 `rarityColors`(DB) 포함.
- 어드민 편집: `PUT /api/v0/admin/game/:slug/rarity-colors` (body = rarityColors JSON, 관리자 가드).

### 프론트
- 게임 로드(`loadGameContext`/`gameInit`)에서 **DB rarityColors가 있으면 `gameInit.list.card.rarityColors`에 머지**(없으면 Init.ts 기본값 유지) → `ListCardView`는 코드 변경 없이 DB 색상 사용.
- 어드민 화면: 게임별 등급 색상 편집기 — 각 등급(5/4/3…)별 테두리/배경/텍스트/그라데이션(from·to·stop) **컬러 피커** + 실시간 카드 미리보기 → 저장(PUT).

### 등급 아이콘(별/뱃지) (선택)
- 색상과 별개. 필요 시 `rarity.list` 항목에 아이콘 경로 추가 + 정적 서빙(후속).

> 색상은 단일 JSON 컬럼이라 도입이 가볍고, 프론트는 머지만 하면 됨 → **속성 아이콘과 함께 1차 범위에 포함**.

## 5. (검토) 필터 설정 전체를 DB로 이전?

요청의 "게임 셋에서 변경 = DB 저장 토대로"를 **끝까지** 가면, `*Init.ts`의 `type`/`rarity`/`layout` 전체를
DB(게임별 설정 JSON)로 옮기는 큰 리팩터다. 하지만:
- 아이콘은 **이미 DB**(Element.icon_url)라 목표(필터 아이콘)는 코드 이전 없이 달성된다.
- 라벨/필터 구조까지 DB화는 범위가 크고(스키마+어드민 에디터+로더 변경) 위험. **별도 기획으로 분리** 권장.
- 따라서 **1차 범위 = Element 아이콘 DB 관리(어드민 업로드)** 로 한정한다.

## 6. 작업 분해 (1차)

**백엔드**
1. `POST /admin/element/:id/icon` (multer+sharp→webp→`static/image/{slug}/elements/...`→`icon_url` + `?v=`).
2. `GET /admin/element/list?gameId=` (게임별 속성/특성 + icon_url) — 없으면 추가.
3. **`games.rarity_colors Json?` 컬럼 추가**(prisma 마이그레이션) + `GET /game/:slug` 응답에 포함 +
   `PUT /admin/game/:slug/rarity-colors`(관리자 가드).

**프론트**
4. `/admin/type` 화면: 게임별 속성/특성 목록 + 아이콘 업로드(게임 아이콘 업로드 컴포넌트 재사용).
5. 어드민 등급 색상 편집기: 게임별 등급 컬러 피커(테두리/배경/텍스트/그라데이션) + 카드 미리보기 → PUT 저장.
6. `loadGameContext`/`gameInit`에서 DB `rarityColors` 머지(없으면 Init 기본값).

**검증**
7. 속성 아이콘 업로드 → 리스트 필터 즉시 반영(ListFilterMenu가 DB icon_url 사용).
8. 등급 색상 편집·저장 → 리스트 카드 배경 즉시 반영(ListCardView가 머지된 rarityColors 사용).

## 7. 주의점

- ListFilterMenu의 `<img src="{currentUrl}/{item.iconUrl}">`는 icon_url 빈 경우 깨진 이미지가 뜬다 →
  **빈 아이콘 시 fallback**(텍스트만/플레이스홀더) 처리도 같이 넣으면 좋다(아이콘 없는 게임 임시 대비).
- 경로 일관성: 게임 아이콘은 `static/logo`, Element 아이콘은 `static/image/{slug}/elements/` 권장(게임별 폴더).
- 캐시버스팅(`?v=`) 필수(같은 파일명 덮어쓰기).
- 권한: 관리자만(백엔드 가드).

---

### 요약

> **필터 아이콘은 이미 DB(`Element.icon_url`) 기반이고 ListFilterMenu가 렌더한다** — 스타레일이 그 증거.
> 빠진 건 genshin·nikke·zzz·reverse1999의 icon_url뿐. 그래서 **게임 아이콘 업로드와 동일한 어드민 Element
> 아이콘 업로드**(`POST /admin/element/:id/icon`)를 만들어 DB로 채우면, 코드 변경 없이 전 게임 필터에 아이콘이 나온다.
> 등급 아이콘·필터설정 전체 DB화는 2차/별도.
