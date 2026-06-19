# 기획안 — 구글 애드센스 + SEO

> 작성일: 2026-06-19
> 요청: kingduck.xyz 애드센스 + SEO. (현재 SvelteKit adapter-static, CSR/SPA)

---

## 0. 현황(실측)
- **adapter-static + `fallback: index.html` = 순수 CSR/SPA.** 크롤러가 받는 초기 HTML은 빈 셸(2KB) → JS 렌더 후에야 콘텐츠. 구글은 JS 렌더하지만 느리고, **네이버/다음은 JS 렌더가 약함**(한국 시장 치명적).
- `app.html` **`lang="en"`** (한국 사이트인데 영어), AdSense/GA 스크립트 없음.
- `svelte:head`는 **일부 라우트만**(layout/home/content/item/list). calendar/coupon/tier-list 등 누락.
- **robots.txt · sitemap.xml · ads.txt 전부 없음.**
- **개인정보처리방침/이용약관 페이지 없음** → **애드센스 승인 불가**(필수).

핵심 난점: **CSR/SPA라 검색엔진 크롤이 빈약**하다. SEO·애드센스 둘 다 이걸 먼저 풀어야 한다.

---

## 1. SEO

### 1-A. 즉시(저비용) — 메타/사이트맵/로봇
1. **`app.html` `lang="ko"`** + 기본 메타(og:site_name, theme-color, 기본 description).
2. **페이지별 메타 일원화**: `svelte:head`를 **모든 라우트**(list/item/content/calendar/coupon/tier-list/home)에 + load의 `meta`(이미 일부 반환)로 title/description/**og:title·og:description·og:image**/twitter/**canonical** 채움. 캐릭터 상세는 캐릭명+게임명+속성으로 풍부하게. 재사용 `<SeoHead>` 컴포넌트 1개로.
3. **`static/robots.txt`**: 허용 + `Sitemap: https://www.kingduck.xyz/sitemap.xml`.
4. **`sitemap.xml`**: 전 게임 list/item/calendar/coupon/tier + **전 캐릭터 상세 URL**. 빌드 시 생성(스크립트) 또는 백엔드 엔드포인트(`api`가 캐릭터 목록을 알므로 동적 생성 가능). 크롤 후 갱신.
5. **검색엔진 등록**: 구글 Search Console + **네이버 서치어드바이저(웹마스터)** + 빙. 소유확인 메타태그 app.html에.
6. **구조화 데이터(JSON-LD)**: 캐릭터 상세에 `VideoGame`/`Article` 스키마(리치결과). 사이트 `Organization`/`WebSite`(sitelinks search).

### 1-B. 근본 — 크롤 가능성(CSR 한계 해소)
빈 셸 문제를 풀어야 네이버까지 잡힌다. 택1:
- **(권장 절충) 정적 프리렌더 + 메타**: 자주 안 바뀌는 페이지(홈, 게임 list 랜딩)를 SvelteKit `prerender`로 빌드 시 HTML 생성 + 위 메타. 구글은 JS 렌더로 상세까지 인덱싱. 비용 낮음. **단 네이버는 상세까지 약함.**
- **(SEO 최상) SSR 도입**: 크롤러용 SSR(adapter-node 또는 별도 프리렌더/snapshot). 콘텐츠가 초기 HTML에 들어가 네이버·구글 모두 강함. 단 "정적 CSR 유지" 결정과 상충 + 홈서버 부하↑. → **SEO를 진지하게 원하면 핵심 콘텐츠(캐릭터/리스트)만 SSR/프리렌더 하이브리드** 검토.
- 트래픽·우선순위에 따라 1-A만으로 시작 → 효과 보고 1-B 결정.

### 1-C. 기본기
- 시맨틱 마크업/h1 1개/이미지 alt(대부분 됨), 모바일 친화(됨), 속도(캐시 적용됨 — 별도 기획), 내부 링크(모바일 nav 추가됨).

---

## 2. 구글 애드센스

### 2-A. 승인 선결(반드시 먼저)
1. **개인정보처리방침 페이지**(`/privacy`) — 애드센스 쿠키/제3자 광고/데이터 수집 고지 포함. **승인 필수.**
2. **이용약관/문의** 페이지(`/terms`, 연락처) — 신뢰성.
3. **충분한 오리지널 콘텐츠 + 내비게이션** — 게임/캐릭터/캘린더 다수 있음(양호). 단 **저작권 자산(게임 이미지) 위주가 아닌 우리 정리/데이터 가치**가 보여야 정책 리스크↓(비공식 팬 정보 사이트는 보통 가능하나, 단순 이미지 재배포로 비치면 거절 위험).
4. 도메인·SSL·트래픽 일정 수준(있음).

### 2-B. 적용(승인 후)
1. **AdSense 스크립트** `app.html` `<head>`에 1회(`adsbygoogle.js` + 퍼블리셔 ID).
2. **`static/ads.txt`**: `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`.
3. **광고 슬롯 배치**(반응형 디스플레이 유닛): 리스트(카드 사이/하단), 캐릭터 상세(섹션 사이), 캘린더 등. 콘텐츠 과밀/정책 위반 주의(클릭 유도 금지, 콘텐츠보다 광고 많지 않게).
4. **SPA 재초기화**: 라우트 전환 시 광고가 새로 로드되도록 `(adsbygoogle = window.adsbygoogle || []).push({})`를 페이지 마운트/네비게이션마다 호출하는 **`<AdUnit>` 컴포넌트** 1개로 캡슐화(키로 강제 리마운트). CSR라 필수.
5. **동의(개인정보) 관리**: 개인화 광고용 **동의 배너/CMP**(EU/한국). 구글 Consent Mode 연동.

### 2-C. 분석
- **Google Analytics(GA4)** 함께 도입(트래픽·수익 분석). app.html 또는 동의 후 로드.

---

## 3. 우선순위 / 단계
1. **개인정보처리방침·약관 페이지** + `lang=ko` + 기본 메타 — (애드센스 선결 + SEO 기초)
2. **SeoHead 컴포넌트로 전 라우트 메타/og/canonical** + **robots.txt + sitemap.xml** + 검색엔진 등록(구글/네이버)
3. **애드센스 신청** → 승인 후 스크립트 + ads.txt + `<AdUnit>` 슬롯 + 동의 배너 + GA4
4. (효과 보고) **프리렌더/부분 SSR**로 크롤 가능성 강화(특히 네이버)

## 4. 주의/리스크
- **CSR 빈 셸**이 SEO 최대 약점 — 1-A로 시작하되 네이버 노출이 목표면 1-B(프리렌더/SSR) 필요.
- **애드센스 정책**: 저작권 게임 자산 비중 + 개인정보처리방침 필수. 승인 전 콘텐츠 정비.
- 광고가 홈서버 콘텐츠 로드를 느리게 하지 않게(광고는 비동기/지연 로드).
- 전부 프론트 작업(+sitemap은 백엔드 동적 엔드포인트 가능). 백엔드 부하 거의 없음.

---

### 요약
> CSR/SPA라 **검색 크롤이 빈약**한 게 SEO·애드센스 공통 선결 과제. 우선 **개인정보처리방침/약관 + lang=ko + 전 라우트 메타(og/canonical) + robots/sitemap + 구글·네이버 등록**으로 기초를 깔고, **애드센스 신청 → 승인 후 스크립트/ads.txt/`<AdUnit>`(SPA 재초기화)/동의배너/GA4**. 네이버까지 제대로 잡으려면 후속으로 **핵심 페이지 프리렌더/부분 SSR**.
