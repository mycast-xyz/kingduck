# kingduck 풀스택 설계 & 수정 계획 (DESIGN & FIX PLAN)

> 대상: 프론트엔드 `kingduck` (SvelteKit / Svelte 5 runes) + 백엔드 `kingduck-server` (Express / Prisma / PostgreSQL)
> 목적: 전체 코드베이스 리팩터를 앞두고 "무엇을 어떻게 고칠지"를 우선순위와 함께 정리한 실행 로드맵.
> 작성일: 2026-06-17

---

## 0. 총평

코드베이스는 Phase 0~1 보안/안정성 작업(CORS 잠금, 역할 상승 방지, rate limit, JWT 시크릿 관리, 401 처리, XSS sanitize, baseURL 일원화 등)을 거쳐 **"치명적 결함은 대부분 닫혔고, 이제 설계 부채(design debt)가 전면에 드러난"** 단계다. 프론트엔드는 "게임 설정을 데이터로" 다루는 핵심 아키텍처(Init 클래스 + `metadata<T>` 제네릭)가 견고하지만, **slug→Init 분기가 6~7개 라우트에 복붙(43개 case)되어 있고, 싱글톤 서비스 전역 상태와 load 반환 데이터가 이중으로 진실의 원천(source of truth)을 만드는** 두 가지 구조적 문제가 확장성을 좀먹고 있다. 백엔드는 **응답 봉투(response envelope) 포맷이 6종 이상으로 파편화**되어 클라이언트 단일 파서를 불가능하게 만들고, **DB 연결 실패가 기동을 막지 못하는 좀비 프로세스 위험, 인증 없는 비디오 다운로드 엔드포인트(DoS), N+1 쿼리, graceful shutdown 부재** 등 운영 신뢰성 이슈가 남아 있다. 가장 큰 설계 테마는 세 가지로 압축된다 — **(1) 중복 제거를 통한 단일 진실원(게임 레지스트리·응답 빌더·sync 단일 경로), (2) 상태 소유권 명확화(라우트 load 중심 vs 싱글톤 스토어), (3) 타입 안전성 회복(`any` 290+ 제거, metadata 타입 정의).** 전반적 건강도는 "양호하나 확장 임계점 직전"이며, 지금이 리팩터의 적기다.

---

## 1. 프론트엔드 — 설계 개선

### 1-A. 아키텍처 (게임 설정·라우팅)

**A1. slug→Init switch 6~7개 라우트 복붙 → 중앙 게임 레지스트리 (최우선)**
- 문제: `list/[slug]`, `coupon/[slug]`, `calendar/[slug]`, `calendar/[slug]/[id]`, `tier-list/[slug]`, `content/[gameEnName]/[characterId]`의 `+page.ts`가 6개 Init 클래스를 각각 import하고 동일한 `switch(params.slug)`(총 38~43 case)를 반복. 새 게임 = 6~7개 파일 수정. DRY 정면 위반.
- 권장 설계: `src/app/model/game/GameRegistry.ts` 신설 — `const GAME_REGISTRY = new Map<string, () => GameInitConfig>()`로 slug→Init **팩토리(lazy)** 매핑. `getGameInit(slug)` / `getAllGames()` / `isGameSupported(slug)` 헬퍼 제공. 모든 라우트는 switch 대신 `getGameInit(params.slug)` 호출. 게임 메타(name·icon·description)도 한곳에 둬 단일 진실원화.
- 영향 파일: 위 6개 `+page.ts`, 신규 `GameRegistry.ts`, `GameInitConfig.ts`.
- 공수: **L** (auditRef: new / F-A2 group)

**A2. `GameInitConfig.gameId` 값 일원화 → slug를 정체성으로**
- 문제: `gameId`가 enum 이름('HonkaiStarRail') / 숫자(6) / slug('starrail') 3종으로 혼용. 라우팅엔 쓰이지 않는데 컴포넌트 분기는 `gameId`에 의존.
- 권장 설계: `GameInitConfig.gameId`를 **slug 자체**('starrail', 'nikke', ...)로 통일하고, 표시용 이름이 필요하면 `displayName`/`enName` 별도 필드 추가. `GameSlug` 리터럴 유니온 타입 정의.
- 영향 파일: `src/app/model/game/*Init.ts`(6개), `api.ts`.
- 공수: **M** (auditRef: F-B3)

**A3. `[gameEnName]` 라우트 파라미터 → `[slug]`로 통일**
- 문제: `content/[gameEnName]/[characterId]`만 파라미터명이 다름.
- 권장 설계: `[gameEnName]` → `[slug]` 리네임, switch는 A1 레지스트리로 대체.
- 영향 파일: `src/routes/content/[gameEnName]/...`.
- 공수: **S** (auditRef: new)

**A4. 컴포넌트 layout 렌더 if/else 체인 → 컴포넌트 레지스트리**
- 문제: `agent/desktop/ContentView.svelte:146-257`가 긴 if/else로 섹션 컴포넌트를 분기.
- 권장 설계: `COMPONENT_REGISTRY: Record<string, Component>` 정의 후 `<svelte:component this={REGISTRY[section.component]} />`. (게임 레지스트리보다 우선순위 낮음.)
- 영향 파일: `ContentView.svelte`, 신규 레지스트리.
- 공수: **M** (auditRef: new)

### 1-B. 서비스 / 상태 관리

**B1. 싱글톤 서비스 전역 상태 + load 반환 데이터의 이중 진실원 (핵심)**
- 문제: 모든 라우트가 `GameSettingInitService.updateGameInit()` / `CharacterListService.getCharacterList()`로 싱글톤 스토어를 갱신하면서 동시에 같은 데이터를 load에서 반환. 컴포넌트가 스토어를 구독하면 props와 어긋남. 빠른 네비게이션 시 stale 표시 위험. `CharacterListService`만 `_activeSlug` 가드가 있고 `GameSettingService`엔 없음.
- 권장 설계 (선호: 라우트 스코프 상태로 이전):
  - load는 `{ gameInit, characterList }`를 **반환만** 하고 서비스 mutation 호출 제거.
  - 컴포넌트는 `$props`로 수신, 싱글톤 스토어 구독 중단.
  - 싱글톤은 **진짜 전역 상태**(auth, toast, modal, theme)로만 제한.
  - 과도기: 즉시 제거가 어려우면 `GameSettingService`에도 `CharacterListService`와 동일한 `_activeSlug` 가드를 추가하고, stale 가드 검사를 **fetch 시작 전**으로 옮긴다(AbortController로 in-flight 취소 고려).
- 영향 파일: `GameSettingService.ts`, `CharacterListService.ts`, `list/tier-list/calendar/content` 각 `+page.ts`, 구독 컴포넌트.
- 공수: **XL** (auditRef: F-B2 / new)

**B2. 컴포넌트 구독 생명주기 정리 (메모리 누수)**
- 문제: `FooterView`, `ListCardView`, `CarouselListView` 등 9~13개 파일이 `.subscribe()`를 호출하나 cleanup이 없거나 auto-subscription과 혼용. tier-list/calendar 상세 페이지의 구독은 해제되지 않음.
- 권장 설계: Svelte 5 패턴 통일 — 읽기 전용은 `$derived($store)` 자동구독, 부수효과는 `$effect` 안에서 `const u = store.subscribe(...); return () => u()`. 빈 effect(`DesktopModal.svelte:34`) 제거. 장기적으로 props 전달로 구독 자체 제거.
- 영향 파일: 위 9~13개 `*.svelte`.
- 공수: **M** (auditRef: F-B1)

**B3. `CharacterRarityService` 게임 컨텍스트 간 싱글톤 상태 유지**
- 문제: static 인스턴스를 게임 전환 후에도 재사용.
- 권장 설계: 무상태 유틸로 전환(매 호출 `gameInit` 전달) 또는 라우트 load당 1회 초기화 후 props 전달. static 캐싱 제거.
- 영향 파일: `CharacterRarityService.ts`, `ListCardView.svelte`.
- 공수: **S** (auditRef: new)

**B4. Admin 서비스 캐시 mutation 후 무효화 누락**
- 문제: `AdminUserService`/`AdminStatsService`가 역할/상태 변경 후 스토어를 갱신/refetch하지 않음.
- 권장 설계: mutation 성공 후 `invalidate(['admin:users'])` 또는 명시적 refetch/store reset 패턴.
- 영향 파일: `AdminUserService.ts`, `AdminStatsService.ts`.
- 공수: **M** (auditRef: new)

### 1-C. 뷰 / 컴포넌트

**C1. Desktop/Mobile UI 완전 중복 (agent 6파일)**
- 문제: `agent/desktop/{MainMenu,ListView,ContentView}` ↔ `agent/mobile/...`가 로직까지 복제. 기능 변경 시 양쪽 동기화 부담.
- 권장 설계: 데이터 페칭·상태 로직을 공통 컴포넌트/서비스로 추출, `isMobile` 분기는 표시 전용(sidebar vs hamburger)에만 남김. 모달 셸(`DesktopModal`/`MobileModal`)도 단일 반응형 컴포넌트로 통합.
- 영향 파일: `agent/desktop/**`, `agent/mobile/**`.
- 공수: **L** (auditRef: new)

**C2. 모달 셸 패턴 불일치 + WindowService 데이터 계약 무타입**
- 문제: `DesktopModal`은 `{@render body()}`(snippet), `MobileModal`은 `<slot name="body">`(slot) 사용. `WindowService.modalData`는 무타입 `get()`.
- 권장 설계: Svelte 5 `{@render}` snippet으로 통일, 두 셸을 `view-framework/modal/`에 공존. `ModalDataMap<T>` 타입 정의로 모달 타입별 데이터 계약 명시.
- 영향 파일: `view/modal/DesktopModal.svelte`, `view-framework/modal/MobileModal.svelte`, `WindowService`.
- 공수: **S** (auditRef: new)

**C3. `SkillTreeView`의 gameId/slug/enum 혼용 (RankListView처럼 미수정)**
- 문제: `SkillTreeView.svelte:32-47`이 `RankListView`(F-B3로 수정됨)와 달리 여전히 `gameId` 비교 잔존.
- 권장 설계: `gameSlug`만으로 switch, `targetGameId` 제거. (A2 slug 통일과 함께 진행.)
- 영향 파일: `SkillTreeView.svelte`, `EquipmentItemView.svelte:68,98`.
- 공수: **S** (auditRef: F-B3)

### 1-D. 데이터 / 인증 / 에러

**D1. localStorage JWT의 XSS 취약 (F-S2) — HttpOnly 쿠키 이전**
- 문제: `AuthTokenService.ts:24,33`이 토큰을 localStorage에 저장, `client.ts`가 매 요청 Authorization 헤더에 첨부. XSS 1건이라도 발생하면 토큰 탈취·위조 가능. DOMPurify로 현재 활성 XSS는 없으나 구조적 위험 잔존. (백엔드는 응답 body로 토큰 반환 중 — 쿠키 미지원.)
- 권장 설계 (백엔드 공조 필수): 로그인 시 백엔드가 `Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict` 발급 → 프론트는 localStorage 토큰 제거, axios `withCredentials: true`로 쿠키 자동 전송, 수동 setToken/getToken 로직 삭제. 과도기엔 매 read마다 만료 검증, JWT 구조 검증(`token.split('.').length === 3`) 추가.
- 영향 파일: `AuthTokenService.ts`, `client.ts`, 백엔드 `LoginController.ts`.
- 공수: **XL** (백엔드 포함) (auditRef: F-S2)

**D2. load 에러 처리 패턴/상태코드 불일치 표준화**
- 문제: `throw error()`(list/calendar/content) vs `return {error}`(root `+page.ts`) 혼용. 상태코드도 503/500/404/silent로 제각각. `Promise.all().then().catch()`가 부분 실패 컨텍스트 상실(calendar 상세·coupon).
- 권장 설계: load 에러 컨벤션 1종 확립 — 네트워크 불가=503, 미존재=404, 예기치 못한=500. 공유 에러 핸들러 유틸 작성. `Promise.all` → `Promise.allSettled` 또는 try/catch 내 `await`로 per-request 격리.
- 영향 파일: 모든 `+page.ts`, 신규 에러 유틸.
- 공수: **M** (auditRef: new)

**D3. baseURL 매 load 재계산 + 401 컨텍스트 무시 + refresh 미구현**
- 문제: `client.ts:7-15`가 매 load마다 baseURL 재계산. 401 인터셉터가 로그인 페이지에서도 "세션 만료" 토스트. refresh 토큰 교환 미구현.
- 권장 설계: baseURL 1회 계산 후 캐시(frozen singleton/store). 401 인터셉터는 토스트 없이 에러 반환, 라우트가 메시징 결정. refresh 엔드포인트 확정 후 401→refresh→원요청 재시도 로직(axios-retry) 구현.
- 영향 파일: `client.ts`, `AuthTokenService.ts`.
- 공수: **M** (auditRef: F-A2 / new)

### 1-E. 타입 안전성

**E1. 미특화 제네릭으로 인한 `any` 범람 (290+ across 81 files)**
- 문제: `CharacterType<T=any>`/`ItemType<T=any>` 기본값 any, 14개 사용처 100% any로 폴백. metadata 타입이 2종(Genshin/Nikke)만 존재 → HSR·WW·R1999·Endfield·GFL2는 무타입 접근(`char.metadata?.weaponType`).
- 권장 설계: (1) 게임별 `HsrCharacterMetaType` 등 metadata 인터페이스를 실제 API 응답에서 추출해 정의(가능하면 OpenAPI 생성), (2) `type CharacterTypeHsr = CharacterType<HsrCharacterMetaType>` 타입 별칭, (3) 서비스 경계에서 명시 특화 요구, (4) 런타임 안전이 필요하면 Zod 스키마로 API 경계 파싱.
- 영향 파일: `api.ts`, viewmodel 다수, 서비스.
- 공수: **XL** (auditRef: F-T4)

**E2. Viewmodel 클래스 60% 중복 + 잘못된 cross-game 의존**
- 문제: `EndfieldStatsViewModel`(155)/`HsrStatsViewModel`(136)/`WwStatsViewModel`(221)이 거의 동일 로직(metadata 파싱·승급 비용·itemCache). `loadCostItems` 85% 중복. Endfield·WW가 `../starrail/HsrItemService`를 잘못 import. Endfield는 RankList/SkillTree 베이스 미상속.
- 권장 설계: (1) `StatsViewModelBase<T>` 베이스 추출(costList·itemCache·levelState 공통화), 서브클래스는 metadata 파싱만, (2) `GameItemService` 추상화 후 게임별 구현(`HsrItemService`를 common으로 이동), (3) 베이스 로직 단위테스트 1회. ~400 LOC 중복 제거.
- 영향 파일: `service/game/{endfield,starrail,wutheringwaves}/*ViewModel.svelte.ts`, 신규 베이스.
- 공수: **L** (auditRef: new)

**E3. 뷰 컴포넌트 `$state<any>` / `GameInitConfig` Record<string,any> 구체화**
- 문제: `CarouselListView`/`EquipmentItemView`/`MainItemView`/`SkillTreeView`의 `gameInit`·`selectedList`가 `$state<any>`. `GameInitConfig`의 filter/rarityColors/info/props가 Record/any. tier-list·EquipmentItemView 10+ any.
- 권장 설계: `$state<GameInitConfig|null>` 등 구체 타입, `FilterConfigType`/`RarityColorType`/`TierItem`/`TierState` 인터페이스 정의, info 변형은 discriminated union.
- 영향 파일: `view/info/*.svelte`, `GameInitConfig.ts`, `tier-list/[slug]/+page.svelte`.
- 공수: **M~L** (auditRef: F-T4)

**E4. 중복/충돌 데드코드 `ContentManualModal`**
- 문제: `ContentManualModal.ts` / `ContentManualModalService.ts`가 동일 클래스명 중복 export.
- 권장 설계: `ContentManualModal.ts`(데드) 삭제, Service 파일을 정식 이름으로 리네임, `$state` runes로 통일. 중복 export 금지 ESLint 룰.
- 영향 파일: `service/ContentManualModal*.ts`.
- 공수: **S** (auditRef: new)

---

## 2. 백엔드 — 설계 개선

### 2-A. 크롤러 프레임워크

**A1. 좀비 RUNNING 로그가 향후 실행 영구 차단 (Critical/High)** — §3 참조 (B-L3)

**A2. silent-empty 실패를 SUCCESS로 기록, PARTIAL enum 미사용** — §3 참조 (B-H6)

**A3. per-scraper 에러 처리 불일치 → ScraperBase 추상화**
- 문제: 스크래퍼별 에러 처리 제각각, 베이스 추상화 부재. EventScraper류는 catch 후 `[]` 반환, CharacterScraper는 throw.
- 권장 설계: `ScraperBase`에 `protected fetchWithErrorSurfacing()` 추가 → `{success, partialCount, errors}` 반환. 모든 스크래퍼가 `ScraperError('context', e)` throw, `DataSyncService`는 binary가 아닌 상세 에러 튜플 수신.
- 영향 파일: `crawlers/core/ScraperBase.ts`, `crawlers/scrapers/**`.
- 공수: **M** (auditRef: new)

**A4. sync 계약 파편화 + 단일 경로화 + 동시성 락**
- 문제: 일부는 `DataSyncService` 호출, 일부는 `scraper.save()`. 수동+스케줄 동시 실행 시 race(중복 로그 체크가 race되면 Browser 동시 접근).
- 권장 설계: 단일 경로 — 모든 스크래퍼는 raw 배열 반환, 스케줄러가 `DataSyncService`로 전달. `scraper.save()` 제거. `${game}:${type}` 키 mutex(`async-lock`)로 작업 직렬화.
- 영향 파일: `scheduler.ts`, `DataSyncService.ts`, `CrawlerController.ts`.
- 공수: **M** (auditRef: new)

**A5. metadata 업데이트 시 deep-merge 부재로 기존 키 손실 + 재시도/백오프 부재**
- 문제: 업데이트가 metadata 전체 교체 → 기존 키 silent 손실. 단일 timeout, 재시도 없음.
- 권장 설계: `{...existing.metadata, ...overrides}` deep-merge. 재사용 `axiosWithRetry(url, opts, maxRetries=3, 지수백오프)` — 전이성 에러(ECONNRESET/5xx)만 재시도, 404/파싱오류는 fail-fast. 구조화 로그(`{attemptN, statusCode, nextRetryMs}`).
- 영향 파일: `DataSyncService.ts`, `crawlers/utils/srsPageConfig.ts`, 스크래퍼.
- 공수: **S~M** (auditRef: B-H4 / new)

### 2-B. API / 응답 설계

**B1. 응답 봉투 6+종 파편화 (Critical)** — §3 참조 (B-M1)

**B2. 입력 검증 분산 → 통합 검증 레이어**
- 문제: account만 express-validator, character/item/skill은 컨트롤러 내 수동 Number()/isNaN, `clampPage/clampLimit`가 AdminController·UserManagementController에 복제, event/game은 검증 없음.
- 권장 설계: `src/middleware/validation.ts`(validateGameSlug/validateId/validatePagination), `src/utils/pagination.ts`로 clamp 추출, 검증은 라우터 미들웨어로 이동. 통합 에러 봉투 사용.
- 영향 파일: `routes/account/validator.ts`, 각 컨트롤러, 신규 미들웨어.
- 공수: **M** (auditRef: new)

**B3. 페이지네이션 en 강제 불일치 + game 엔드포인트 무제한**
- 문제: admin은 clamp(1~100), public list는 per-endpoint clamp 없음. `game/service.ts`는 페이지 제한 자체 없음(전체 반환). MAX_LIST=1000 silent truncation.
- 권장 설계: 공유 `validatePagination` 미들웨어를 public 포함 전 list에 적용, `clampLimit(1,100)` 통일. game 엔드포인트 제한 추가. truncation 시 API 계약 문서화(또는 206/413).
- 영향 파일: `routes/{character,item,event,game}/`, `AdminController.ts`.
- 공수: **M** (auditRef: B-H3)

**B4. HTTP 상태/봉투 정합화 (201/204, 검증에러 형식, CRUD 중첩)**
- 문제: POST/PUT/DELETE가 모두 200. validator는 `errors[]`, 비즈니스 로직은 plain message. event CRUD가 `data` 유무 제각각. CrawlerController 검증/응답 미문서화.
- 권장 설계: POST=201, DELETE=204(또는 200+확인), 검증에러도 통합 봉투 `{success:false, resultCode, message, errors?, data:null}`. `ResponseBuilder.success()/error()/validationError()/listSuccess()` 팩토리 도입 후 30+ 핸들러 일괄 적용. CrawlerController runCrawler 입력 검증(gameSlug 존재, crawlerType enum) + 409(이미 실행 중).
- 영향 파일: `routes/**`, 신규 `utils/ResponseBuilder.ts`, `types/response.ts`.
- 공수: **L** (B1과 묶음) (auditRef: B-M1 / new)

### 2-C. 보안 / 인증

**C1. 인증 없는 YouTube 비디오 다운로드 엔드포인트 (Critical)** — §3 참조 (B-S8)

**C2. stateless JWT가 DB 상태 미재검증 (밴 24h 지연)**
- 문제: `auth.ts:41-46`이 디코딩된 role을 DB 재확인 없이 신뢰. 밴/강등이 토큰 만료(1일)까지 무효. refreshToken도 미검증.
- 권장 설계: 민감 작업(admin·계정 수정)에 한해 `prisma.user.findUnique`로 현재 role/status 재확인. 또는 `user_token_version` 필드(밴/역할 변경 시 증가)를 보호 라우트에서 검증하는 토큰 무효화 체계. 트레이드오프를 ARCHITECTURE/보안 가이드에 명문화.
- 영향 파일: `middleware/auth.ts`, `manager/Login/JsonWebToken.ts`.
- 공수: **M** (auditRef: B-S6)

**C3. JWT 페이로드/민감정보 console 로깅**
- 문제: `JsonWebToken.ts:31`이 payload 전체(userId·role·userName·userUUID) 무가공 로깅. 컨트롤러 catch가 logger 대신 console.error(21파일 101건). 프로덕션엔 console transport 없어 에러 유실.
- 권장 설계: payload console.log 제거, 모든 console.* → logger(error/info/debug) 이전, 로깅 sanitize 유틸(민감필드 마스킹), 컨테이너에서 로그 디렉터리(`./src/log`) 볼륨 마운트 또는 stdout 구조화 로깅.
- 영향 파일: `JsonWebToken.ts`, 21개 컨트롤러, `utils/logger.ts`.
- 공수: **M** (auditRef: B-S9)

### 2-D. DB / Prisma

**D1. `originalId` 컬럼 비동기화 (B-H4b)**
- 문제: `Character.originalId` 컬럼 정의(`schema.prisma:126`)되었으나 `DataSyncService.syncCharacters`가 채우지 않음 — metadata.originalId만 설정. `withOriginalId()` 폴백은 항상 null → 비효율 JSON path 쿼리 강제.
- 권장 설계 (옵션 A 권장): sync 시 `originalId` 컬럼 채우기 + `@@unique([gameId, originalId])` + 쿼리를 인덱스 컬럼 기반으로 재작성. Item 모델에도 동일 적용(현재 originalId 필드 자체 없음).
- 영향 파일: `schema.prisma`, `DataSyncService.ts`, `routes/character/service.ts`, `routes/item/service.ts`.
- 공수: **M** (auditRef: B-H4a/b)

**D2. N+1 쿼리 3개 경로 일괄 해소 (High)** — §3 참조 (B-H5: syncCharacters, getGameList, CrawlerController.getStatus)

**D3. 누락 유니크/인덱스 제약**
- 문제: `Element(gameId, name, type)` 유니크 없음(findOrCreate 트랜잭션+race), `CalendarEvent.reviewedBy` FK 인덱스 없음.
- 권장 설계: `@@unique([gameId, name, type])` 추가 후 `findOrCreateElement`를 `upsert(skipDuplicates)`로 단순화. `@@index([reviewedBy])` 추가.
- 영향 파일: `schema.prisma`, `DataSyncService.ts`.
- 공수: **M** (auditRef: B-M5)

### 2-E. 운영 / 배포

**E1. DB 연결 실패가 기동을 막지 못함 (Critical)** — §3 참조 (B-L1)

**E2. 중앙 async 에러 래퍼 부재 (High)** — §3 참조 (new)

**E3. graceful shutdown 부재 (High)** — §3 참조 (new)

**E4. 설정/배포 위생 (config 데드코드, health check)**
- 문제: `application.{dev,prod}.json`의 pool 설정·db_server.host('127.0.0.1')는 데드코드(Prisma는 DATABASE_URL만 사용). docker-compose health check·/health 엔드포인트 없음. pool 모니터링 없음.
- 권장 설계: JSON의 pool/db_server 제거, 연결정보는 DATABASE_URL 단일화(.env.example에 local/compose/prod 예시). `/health`(DB 연결 확인) 추가 + docker-compose healthcheck. pool 통계 주기 로깅/metrics 엔드포인트.
- 영향 파일: `config/application.*.json`, `utils/prisma.ts`, `docker-compose.yml`, 신규 health 라우트.
- 공수: **M** (auditRef: B-M7 / new)

---

## 3. 확정된 Critical/High 이슈

| 심각도 | 영역 | 위치 | 문제 | 권장 | 공수 | 감사ref |
|---|---|---|---|---|---|---|
| **Critical** | BE API 응답 | `routes/**`(character/event/game/item/admin/account/video) | 응답 봉투 6+종 파편화(raw/wrapped/nested), admin조차 `items` vs `data.items` 혼재 → 클라 단일 파서 불가 | 통합 봉투 `{success,resultCode,data,message,errors?}` + `ResponseBuilder` 팩토리, 30+ 핸들러 적용 | L | B-M1 |
| **Critical** | BE 보안 | `routes/video/router.ts:11-14`, `videoController.ts:40` | 인증 없는 `GET /video/get/youtube/:cid/:vid`가 Puppeteer+yt-dlp 서브프로세스 실행 → DoS/자원고갈 | `authorize(['USER',...])` 미들웨어 + 엔드포인트별 strict rate limit(예 5/10분/IP) + timeout, 장기적으로 잡 큐 | M(인증) / S(rate limit) | B-S8 |
| **Critical** | BE 운영 | `src/index.ts:120-129` | `prisma.$connect()` 실패해도 포트 listen → DB 없는 좀비 프로세스, 헬스 위장 | 연결 실패 시 `process.exit(1)` + 지수백오프 재시도, 오케스트레이터 재기동 유도 | M | B-L1 |
| **High** | FE 아키텍처 | `list/[slug]`, `coupon/[slug]`, `calendar/[slug]`, `calendar/[slug]/[id]`, `tier-list/[slug]`, `content/[gameEnName]/[characterId]` 의 `+page.ts` | slug→Init switch가 6~7파일에 복붙(38~43 case), 중앙 레지스트리 없음 → 새 게임=다파일 수정 | `GameRegistry.ts`(Map<slug, ()=>Init>) + `getGameInit(slug)`, 전 라우트 적용 | L | new |
| **High** | FE 상태 | `GameSettingService.ts:29`, `CharacterListService.ts:132` | 싱글톤 전역 상태를 전 라우트 공유, `GameSettingService`엔 `_activeSlug` 가드 부재 → 빠른 네비 시 stale 게임 설정 표시 | 라우트 load로 상태 이전(props 전달) 또는 전 stateful 서비스에 slug 가드 일관 적용 | L | F-B2 |
| **High** | FE 상태 | `list/[slug]/+page.ts:80-104`, `calendar/[slug]/+page.ts:118-149` | load 반환 + 싱글톤 갱신의 이중 진실원, 미해제 구독 메모리 누수 | route-scoped 데이터는 load 반환만, 싱글톤은 전역 상태로 제한 | XL | new |
| **High** | FE 보안 | `AuthTokenService.ts:24,33`, `client.ts:27-29` | JWT를 localStorage 저장(HttpOnly 아님), 매 요청 첨부 → XSS 시 토큰 탈취 | HttpOnly+Secure 쿠키로 이전(백엔드 Set-Cookie), localStorage 제거 | XL | F-S2 |
| **High** | FE 타입 | `api.ts:28,53` 및 소비처 | `CharacterType<T=any>`/`ItemType<T=any>` 기본 any로 타입검사 우회, metadata 타입 2종만 존재 | 게임별 metadata 인터페이스 정의 + 타입 별칭, 서비스 경계 명시 특화 | XL | F-T4 |
| **High** | FE 타입 | `service/game/{endfield,starrail,ww}/*ViewModel.svelte.ts` | Stats/Rank/Skill viewmodel 60% 중복, Endfield·WW가 starrail `HsrItemService` 오의존 | `StatsViewModelBase`·`GameItemService` 추상화, 공통 로직 1회 테스트 | L | new |
| **High** | FE 타입 | `MainItemView:33`, `EquipmentItemView:33`, `TeamRecommendationView:36-38`, `calendar/[slug]/[id]:124,194` | gameId가 이름/숫자/slug 3종 혼용(`gId==='Reverse1999'||6||'6'`) | slug 정규 키 통일(`GameSlug` 유니온), 하드코딩 이름 금지 린트, GameIdConverter | M | F-B3 |
| **High** | BE 크롤러 | `index.ts:120-129`, `scheduler.ts:335-349` | 서버 크래시 시 RUNNING 로그 잔존 → 중복실행 가드가 해당 작업 영구 skip | 기동 시 stale RUNNING(임계 초과) → FAILED 일괄 정리, 처리 건수 로깅 | S | B-L3 |
| **High** | BE 크롤러 | `starrail/EventScraper.ts:87-91`, `ww/EventScraper.ts:97-99`, `scheduler.ts:362-372` | EventScraper가 에러 catch 후 `[]` 반환, itemsFound=0을 SUCCESS 기록, PARTIAL enum 미사용 | 스크래퍼 throw 통일, sync가 `{success,partial,errors}` 수신, errors>0&&success>0=PARTIAL | M | B-H6 |
| **High** | BE 보안 | `middleware/auth.ts:41-46` | JWT role을 DB 재검증 없이 신뢰 → 밴/강등 최대 24h 지연 | 민감 라우트 DB 재확인 또는 `user_token_version` 무효화 체계 | M | B-S6 |
| **High** | BE DB | `schema.prisma:126`, `DataSyncService.ts:113-126` | `originalId` 컬럼 미충전(metadata만), 폴백 항상 null → 비효율 JSON path 쿼리 | sync 시 컬럼 충전 + `@@unique([gameId,originalId])` + 인덱스 쿼리 재작성 | M | B-H4b |
| **High** | BE DB(성능) | `DataSyncService.ts:60-134` | sync 루프 per-item 4~6 쿼리(100건=400+) | element/path createMany 사전적재 + findMany 일괄조회 + batch upsert | L | B-H5 |
| **High** | BE DB(성능) | `AdminController.ts:14-60` | getGameList가 게임당 count 3회(10게임=31쿼리) | `groupBy({by:['gameId'], _count})` 집계 1~3쿼리 | M | B-H5 |
| **High** | BE DB(성능) | `CrawlerController.ts:58-117` | (game×type)별 findFirst 12쿼리 | `groupBy` _max(startTime) 후 매칭 fetch, 2쿼리로 축소 | M | B-H5 |
| **High** | BE 운영 | `routes/*`(예 `character/controller.ts:5-27`) | Express4 async 미들웨어 미자동캐치, 핸들러마다 try/catch 복붙 → 누락 시 unhandled rejection | `utils/asyncHandler.ts` 래퍼로 next(err) 전달, 전 라우트 점진 이전 | M | new |
| **High** | BE 운영 | `src/index.ts`(SIGTERM/SIGINT 부재) | graceful shutdown 없음 → in-flight 요청 유실, DB 롤백 미보장 | `server.close()→prisma.$disconnect()→exit(0)` + 30s 강제 타임아웃 핸들러 | M | new |
| **High** | BE 보안 | `JsonWebToken.ts:31`, `LoginController.ts:46`, 21파일 101건 | payload 전체 console 로깅, console.error로 프로덕션 에러 유실 | payload 로그 제거, console.*→logger 이전, sanitize 유틸 | M | B-S9 |

---

## 4. Medium/Low 백로그

**프론트 — 아키텍처/게임설정**
- [M] 컴포넌트 layout if/else 체인 → 컴포넌트 레지스트리 (`ContentView.svelte:146-257`).
- [M] 중앙 게임 discovery 부재 → `GameRegistry`로 메타·헬퍼 통합(A1에 흡수).
- [L] `[gameEnName]` → `[slug]` 파라미터 통일.
- [L] `ComponentLayout.component` 하드코딩 → 레지스트리 `keyof` 자동생성 또는 string+동적import.
- [L] metadata<T> 런타임 검증 부재 → Zod/io-ts 스키마를 API 경계서 파싱.

**프론트 — 서비스/상태**
- [M] stale 가드 서비스 간 불일치 → `_currentContext` 패턴 일관화(또는 라우트 상태 이전).
- [M] per-route 상태 격리 부재 → load가 싱글톤 mutation 호출 중단.
- [M] CharacterListService stale 검사를 fetch 시작 전으로 이동(AbortController).
- [S] CharacterRarityService 무상태화/reset.
- [S] 서비스 스토어 기본 초기화(`null` sentinel + 컴포넌트 null 체크), discriminated union 상태 모델.
- [L] getGameInit snapshot vs 구독 혼용 정리.

**프론트 — 뷰/타입**
- [M] `.subscribe()` vs auto-subscription 혼용(13파일) Svelte5 패턴 통일.
- [M] 뷰 레이어 `any` 274+ → view-props 타입 정의(framework→core views 단계 적용).
- [M] `$state<any>`(Carousel/Equipment/MainItem/SkillTree) 구체화.
- [M] `GameInitConfig` Record<string,any> → 구체 인터페이스(filter/rarityColor/info union).
- [M] WW/Endfield의 HsrItemService cross-game import 제거(E2에 흡수).
- [M] 게임별 metadata 타입 정의(HSR/WW/R1999/Endfield/GFL2).
- [S] `$state<any>`·EquipmentItemView/tier-list 타입화, CharacterRarityService any 제거.
- [S] ContentManualModal 데드코드 삭제, RankListViewModel 상속 일관화.
- [S] 빈 effect(`DesktopModal:34`) 제거, 모달 데이터 타입 계약, JWT 구조 검증.
- [L] Desktop/Mobile 6파일 중복 통합(C1).

**백엔드 — API/응답**
- [M] 입력 검증 미들웨어 통합 + clamp 유틸 추출.
- [M] 페이지네이션 일관 강제 + game 엔드포인트 무제한 수정.
- [M] CrawlerController 응답/검증 문서화·409.
- [S] event CRUD 응답 중첩 정규화, 검증에러 봉투 통일, 201/204 시맨틱, originalId 응답 전경로 보장.

**백엔드 — 크롤러**
- [M] ScraperBase 에러 추상화, sync 단일 경로화, 작업 mutex, axios 재시도/백오프.
- [S] CRAWLER_TASKS 반환값(실제 count) 강제, metadata deep-merge, srsPageConfig 채택 통일, 이미지 다운로드 실패 비-silent화, Browser 재연결 로직.

**백엔드 — DB**
- [M] Item originalId 필드 추가, Element 유니크 제약, originalId 인덱스 쿼리 전환.
- [L] DataSyncService JSON-path 룩업 → 인덱스 컬럼.
- [S] item 타입 강제(OR clause 제거), `CalendarEvent.reviewedBy` 인덱스.

**백엔드 — 보안/운영**
- [M] JWT stateless 트레이드오프 문서화 + 하이브리드 DB 재검증.
- [M] logger 일관 사용(console→logger), 로그 볼륨/stdout, docker-compose health check + /health, DB host DATABASE_URL 단일화, pool 모니터링.
- [S] payload console.log 제거, 비디오 엔드포인트 rate limit, JWT 필드명(userId 타입) 일관화, config JSON pool/db_server 데드코드 제거.

---

## 5. 우선순위 로드맵

### Phase 1 — 안정성 / 보안 (먼저, 작은 것부터)

**Quick wins (S 공수, 즉시):**
1. ✅ (2026-06-17) 비디오 엔드포인트 `authorize(['ADMIN','MANAGER'])` + rate limit(10분 5회) 추가 — `routes/video/router.ts`. (Critical, S)
2. ✅ (2026-06-17) JWT payload `console.log` 제거 — `JsonWebToken.ts:31`. (S)
3. ✅ (2026-06-17) 크롤러 기동 시 stale RUNNING → FAILED sweep(2h 임계) — `index.ts`(`sweepStaleCrawlerLogs`). (B-L3, S)

**나머지 Phase 1:** (전부 2026-06-17 완료 ✅)
4. ✅ DB 연결 실패 시 `process.exit(1)` + 재시도(5회, listen 전 연결) — `index.ts`. (Critical, M)
5. ✅ graceful shutdown(SIGTERM/SIGINT, 30s 강제 타임아웃) — `index.ts`. (M)
6. ✅ `asyncHandler` 래퍼 도입(`utils/asyncHandler.ts`) + 공개 라우터 7종 적용. (M)
7. ✅ console.* → logger 일괄 이전(100건/20파일). sanitize는 불필요(민감 로그 없음 확인). (M)
8. ✅ JWT DB 재검증 — `authorize(roles, { recheckDb })` 옵션 + 어드민 라우트 적용. (B-S6, M)
9. ✅ `/health`(DB ping) + docker-compose healthcheck. (M)

> Phase 1 전체 완료. `tsc --noEmit` 0, 서버 기동/`/health` 200/미인증 video 401 스모크 통과.

### Phase 2 — 핵심 설계 (단일 진실원 확립)

**Quick wins:**
1. `ResponseBuilder` + 통합 응답 봉투 도입(우선 신규/admin list부터). (Critical B-M1, L) — 클라 단일 파서 전제.
2. ✅ (2026-06-17) `GameRegistry.ts` 신설 후 6개 라우트 switch 제거(43 case→0). `GameInitConfig.apiPoint/apiType` 옵셔널화. (High)
3. `GameInitConfig.gameId` slug 통일 + `GameSlug` 유니온. (F-B3, M)

**나머지 Phase 2:**
4. EventScraper throw 통일 + PARTIAL 상태 흐름 + sync `{success,partial,errors}` 계약. (B-H6, M)
5. sync 단일 경로화 + ScraperBase 에러 추상화 + 작업 mutex. (M)
6. `originalId` 컬럼 충전 + `@@unique` + 인덱스 쿼리 전환(Character·Item). (B-H4b, M)
7. N+1 3경로(syncCharacters/getGameList/getStatus) 집계·batch로 해소. (B-H5, L)
8. 라우트 상태 소유권 정리 — load 반환 중심, 싱글톤은 전역 상태로 제한(또는 전 서비스 slug 가드). (F-B2/state dup, XL)
9. localStorage JWT → HttpOnly 쿠키 이전(프론트+백엔드 공조). (F-S2, XL)
10. 입력 검증 미들웨어 통합 + 페이지네이션 일관 강제 + game 엔드포인트 제한. (M)

### Phase 3 — 정리 / 타입 / 중복 제거

**Quick wins:**
1. ContentManualModal 데드코드 삭제, 빈 effect 제거, config JSON 데드코드 제거. (S)
2. `[gameEnName]` → `[slug]` 리네임. (S)
3. Element 유니크/reviewedBy 인덱스 추가, item 타입 강제. (S)

**나머지 Phase 3:**
4. 게임별 metadata 타입 정의 → `CharacterType<T>`/`ItemType<T>` 특화로 `any` 290+ 제거. (F-T4, XL)
5. `StatsViewModelBase`/`GameItemService` 추상화로 viewmodel 60% 중복 제거 + cross-game import 정리. (L)
6. 뷰 레이어 `.subscribe()` 통일 + 구독 cleanup($effect) + `$state<any>` 구체화. (M)
7. Desktop/Mobile 6파일 중복 통합 + 모달 셸 패턴 통일. (L)
8. 컴포넌트 레지스트리, metadata 런타임(Zod) 검증, axios 재시도/백오프, deep-merge, pool 모니터링 등 잔여 백로그. (M~S)

---

## 6. 거절된 오탐 (재검토 불필요)

- **"Svelte 4 `export let`가 여전히 지배적(32+ 파일) — 마이그레이션 미완료"** — 거짓. 지목된 5파일(ListCard/RankList/Equipment/MainItem/SkillTree) 모두 `$props()` 사용. `view-framework`에서 `export let`은 `ContentLayer.svelte` 1건뿐. 마이그레이션은 사실상 완료, ContentLayer만 선택적 정리(low) 대상.
- **"`getToken()`이 clearTokens 후 stale 토큰 반환"** — 거짓. `localStorage.removeItem()`은 완전 삭제이며, 검증 통과 경로와 clear 경로는 상호배타(line 43 return). 단, line 45가 검증된 `token` 변수 대신 localStorage를 재조회하는 사소한 code smell은 존재(별 위험 없음).
- **"HTTP 상태코드 vs body resultCode 불일치"** — 거짓. 지목된 LoginController/AdminController/index.ts는 상태코드와 resultCode가 일치. 실제 존재하는 건 응답 *필드명* 불일치(resultMsg vs error vs message)로, 이는 §2-B(B-M1) 봉투 통일로 이미 커버됨(Medium).