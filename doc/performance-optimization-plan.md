# 기획안 — kingduck.xyz 속도 개선 (홈서버 부하 완화)

> 작성일: 2026-06-19
> 요청: 홈서버 처리가 느림. https://www.kingduck.xyz 더 빠르게.

---

## 0. 측정 결과 (실측)
- **페이지 HTML** `www.kingduck.xyz`: TTFB ~0.95s, Cloudflare 경유하나 **`cf-cache-status: DYNAMIC`(캐시 안 됨)** → 매 요청 홈서버 origin.
- **API 리스트** `api.kingduck.xyz/api/v0/character/genshin/list`: **TTFB 1.5s / total 1.8s / 132KB / DYNAMIC**.
  - 페이로드는 이미 슬림(129항목 × ~1KB, 무거운 skills/stats/metadata 없음 — 카드 필드만). **→ 문제는 페이로드가 아니라 느린 쿼리/origin + CDN 미캐시.**
- **이미지** `api.kingduck.xyz/assets/image/...webp`: `cache-control: immutable` + **`cf-cache-status: HIT`** → **이미 CDN 캐시·오프로드됨(양호)**.

### 핵심 진단
> 이미지는 이미 캐시되지만, **읽기 API와 HTML이 CDN 캐시가 안 돼(DYNAMIC) 매 요청 홈서버가 직접 처리**한다. 게다가 리스트 **쿼리 자체가 1.5s로 느림**(가정용 서버 + 인덱스/metadata 투영 부담). 캐릭터 데이터는 **크롤 때만 바뀌고 평소 정적**인데도 매번 DB를 친다.

## 1. 개선안 (효과 큰 순)

### A. 읽기 API를 CDN/캐시로 (가장 큰 효과) — 홈서버를 거의 안 거치게
캐릭터/게임/리스트 등 **읽기 GET은 크롤 때만 바뀌므로 캐시 적합.**
1. **응답에 캐시 헤더**: 읽기 GET에 `Cache-Control: public, s-maxage=600, stale-while-revalidate=86400`(예) 부여 → Cloudflare가 엣지 캐시. 대부분 요청이 **엣지에서 즉시** 응답, origin은 캐시 미스 때만.
2. **Cloudflare Cache Rule**: `api.kingduck.xyz/api/v0/character/*/list`, `/game/*` 등 읽기 경로를 **Cache Everything**(현재 DYNAMIC) + Edge TTL 지정.
3. **크롤 후 캐시 퍼지**: 크롤(또는 어드민 덮어쓰기) 완료 시 Cloudflare API로 해당 경로 purge(또는 짧은 s-maxage로 자연 만료). 데이터 신선도 유지.
4. (대안/보완) **서버 인메모리 캐시**: API 레이어에 게임별 리스트 응답을 메모리 캐시(TTL 수 분) → CDN 미스여도 DB 안 침. 크롤 시 무효화.

### B. 느린 쿼리 최적화 (origin = 캐시 미스 시 빠르게)
- 리스트 TTFB 1.5s → **DB 인덱스 점검**: `characters(game_id)`, `(game_id, original_id)`, element/path FK 조인 인덱스.
- **metadata JSON-path 투영**(`metadata->>'class'/'corp'/'burst'/'school'`)이 행마다 비싸면: 자주 쓰는 필터 값은 **컬럼/생성열(generated column)+인덱스**로 승격하거나, 리스트에서 빼고 클라 필터를 줄임.
- `prisma`/raw 쿼리 EXPLAIN으로 병목 확인. N+1 여부 점검.

### C. HTML/정적 자산
- **SPA 셸 HTML 캐시**: adapter-static 결과물이라 사실상 정적 → Cloudflare가 `index.html`/`/`도 캐시(현재 DYNAMIC)하도록 룰. `_app/immutable/*`는 이미 해시 파일이라 장기 캐시 가능(확인).
- **압축**: API 응답 br/gzip(Cloudflare 압축 또는 Express `compression`) 적용 확인(132KB→수십KB).

### D. 프론트엔드 체감 속도
- **이미지 lazy-load**(`loading="lazy"`)·뷰포트 밖 카드 지연(리스트가 길면). 이미 immutable 캐시라 2회차는 빠름.
- **데이터 프리페치/스켈레톤**: 리스트 진입 시 스켈레톤 + 캐시된 직전 데이터 즉시 표시.
- 라우트 **코드 스플릿**(SvelteKit 기본) 점검 — 초기 번들 과대 여부.

### E. 홈서버 인프라 (코드 외)
- Node 프로세스 **클러스터/PM2**(코어 활용), DB **connection pool** 적정값.
- 가정용 **업링크가 병목**이면 CDN 캐시(A)가 사실상 유일한 큰 레버 — origin 트래픽 최소화가 핵심.

## 2. 우선순위 / 기대효과
1. **A. 읽기 API CDN 캐시 + 캐시 헤더 + 크롤 시 퍼지** — 대부분 사용자 요청을 엣지로, 홈서버 부하·지연 급감(1.5s→엣지 ms). **최우선.**
2. **B. 리스트 쿼리 인덱스/투영 최적화** — 캐시 미스(크롤 직후) 시 origin 1.5s→수십~수백ms.
3. **C. HTML/압축 캐시** — 초기 로드 단축.
4. **D. 프론트 lazy/스켈레톤** — 체감 개선.

## 3. 검증
- 적용 후 `curl -w`로 TTFB/`cf-cache-status` 재측정(API list가 HIT 되는지, TTFB↓).
- 크롤 후 퍼지 → 신선도 확인. EXPLAIN으로 쿼리 시간 확인.

---

### 요약
> 이미지는 이미 CDN 캐시(양호). 병목은 **읽기 API·HTML이 캐시 안 돼(DYNAMIC) 매번 느린 홈서버(쿼리 1.5s)를 친다**는 것.
> 최우선은 **읽기 API를 Cloudflare 캐시**(캐시 헤더 + Cache Rule + 크롤 시 퍼지, 또는 서버 인메모리 캐시) → origin 거의 안 거침.
> 보조로 **리스트 쿼리 인덱스/투영 최적화**, HTML·압축 캐시, 프론트 lazy. 가정용 업링크가 한계라 **CDN 오프로드가 핵심 레버.**
