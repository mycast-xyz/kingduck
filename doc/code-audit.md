# 코드 점검 보고서 (Code Audit)

작성일: 2026-06-15 · 대상: `kingduck`(프론트) + `kingduck-server`(백엔드) · 방식: 정적 분석(코드 미수정, 발견만)

> 이 문서는 양쪽 저장소를 보안 / 정확성·운영 / 기술부채 3축으로 감사한 결과다.
> 각 항목은 **심각도 · `파일:라인` · 근거 · 권장 수정**으로 적었다. "추정"은 실행 검증 없이
> 코드 정황으로 판단한 것. 수정 시 `.claude/agents/`의 전용 에이전트에 위임 가능.

---

## 0. 한눈에 (Executive Summary)

가장 무거운 결론 셋:

1. 🔴 **백엔드가 프로덕션에서 부팅조차 안 될 가능성이 높다.** start 경로 불일치 + config JSON 미복사 + prod JWT 시크릿 누락이 겹친다 (→ B-C1).
2. 🔴 **비밀정보가 git에 커밋돼 있다.** JWT 서명 키와 DB 비밀번호가 소스에 평문 → 누구나 ADMIN 토큰을 위조해 전 어드민 API를 뚫을 수 있다 (→ B-S1·S2). 이게 프론트의 "어드민 가드는 UX용" 한계(F-S1)와 합쳐지면 실질 방어선이 없다.
3. 🔴 **저장형 XSS 표면이 넓다.** 크롤링/어드민이 넣은 텍스트를 이스케이프 없이 `{@html}`로 출력하는 곳이 다수 (→ F-S3). 토큰이 localStorage에 있어(F-S2) XSS 한 건이면 토큰까지 털린다.

> 개인 프로젝트·CSR·소규모라 "지금 당장 사고"는 아닐 수 있으나, **공개 배포 전 1~2번은 필수**다.
> 블로그 연재(`doc/devlog/`) 소재로도 훌륭하다 — "내 프로젝트를 감사해봤다" 편.

심각도 분포(중복 제거 전): 🔴 Critical 8 · 🟠 High 12 · 🟡 Medium 11 · 🟢 Low 다수.

---

## 0-1. 수정 이력 (Changelog)

### 2026-06-15 · Phase 0 (배포 차단 해소) — 백엔드, 빌드/부팅 검증 완료 ✅
`pnpm build` exit 0 + `node dist/index.js` 정상 부팅(listen + DB 연결) 확인.

- **B-C1.1** start 경로: `package.json` `dist/src/index.js` → `dist/index.js` ✅
- **B-C1.2** config JSON 미복사: `scripts/copy-config.js` 추가 + `build`에 복사 단계 → `dist/config/*.json` 생성 확인 ✅
- **B-C1.3 / B-S5** prod JWT 시크릿: `src/config/config.ts`를 **환경변수 우선 + 미설정 시 부팅 fail-fast**로 변경(prod는 `JWT_SECRET_KEY` env 필수) ✅
- **B-C2** video 컨트롤러 크래시: Sequelize 잔재(`Character`/`CharacterImage`)를 Prisma `Video` 모델로 재작성 + try/catch + url upsert ✅
- **B-C4** 전역 에러 미들웨어 + 404 핸들러를 `src/index.ts`에 추가 ✅
- **(추가 발견)** `pnpm build`가 애초에 **컴파일 자체 실패**(dev는 `--transpile-only`라 은폐). 깨진 `@types/sqlite3`(미사용) 제거 + 선재 TS 에러 8건 수정(Express query `string|string[]` 강제 변환, puppeteer `headless:true`, `window` 캐스팅) ✅
- **B-C3** 인증 핸들러 가드: `LoginController.Login` try/catch 추가, `AccountController`의 `findUnique`/`encryptPassword`를 try 안으로 이동 → 장애 시 500 응답(요청 행 방지). 토큰/PII 콘솔 로깅(B-S9) 제거 ✅
- **B-C6** 크롤러 브라우저 누수: `apiUtils.fetchPageConfig`·`scheduler` 실행 루프를 try/finally로, `namuWikiUtils`는 browser 핸들 반환(현재 호출자 0건) ✅

- **B-C5** 어드민 이벤트 CRUD: `POST/PUT/DELETE /admin/event` 구현(createEvent/updateEvent/deleteEvent), 프론트 payload→`CalendarEvent` 매핑, `?name=` 검색 반영 ✅

**Phase 0 완료** ✅ (빌드 green + 부팅 검증).

### 2026-06-15 · Phase 1 (보안) — 빌드/check green 검증 완료 ✅
- **B-S3 / B-M6** CORS 잠금: 미일치 origin 거부(기존 `callback(null,true)` 제거), OPTIONS origin 반사 제거(화이트리스트일 때만 echo+credentials), `CORS_ORIGINS` env 지원 ✅
- **B-S4** role 상승 차단: `PUT /user/:id/role` → `authorize(['ADMIN'])`, role enum 화이트리스트 검증, 자기 role 변경 금지, 최종 ADMIN 강등 방지 ✅
- **F-S3** 저장형 XSS: `dompurify` 도입 + `src/app/util/sanitize.ts` 헬퍼, `{@html}` 9곳 sanitize(이벤트 상세 `full_content`, 캐릭터/스킬/장비/유물 설명). 정적 설정값(`rarityIcon`)은 제외 ✅
- **F-A1** baseURL 일원화: `client.ts`에 `getApiBaseUrl()`(PUBLIC_API_BASE_URL 우선 → 기존 `:3000` 폴백) 도입, 하드코딩 17파일 정리, `.env.example` 문서화 ✅

> 🔎 **머지 후 런타임 수동검증 권장**: CORS preflight(화이트리스트 vs 외부 origin), MANAGER의 role 변경 403, 자기/최종ADMIN 강등 400, baseURL env 미설정 시 기존 동작 유지·설정 시 override, XSS 입력 렌더 확인.

- **B-S1 / B-S2** 커밋된 시크릿: 추적 파일에서 JWT 키·DB 비번 제거, env 기반 전환(`dotenv/config` 로드), **새 JWT 시크릿 생성→gitignore된 `.env`**, `.env.example` 추가 ✅ (HEAD 정화 + 부팅 검증)
  - ⏭️ **git 히스토리 스크럽은 보류**(사용자 결정 — 운영/테스트 서버 미운영이라 잔존 위험 낮음). 옛 시크릿은 히스토리에 남아있음.
  - ☑️ **사용자 수동 조치(배포 시 필수)**: ① 프로덕션 env에 새 `JWT_SECRET_KEY` 주입 ② Postgres 비밀번호 변경 + `DATABASE_URL` 갱신.

### 2026-06-15 · Phase 1 보안 (추가분)
- **F-S1** 어드민 가드 강화: `routes/admin/+layout.svelte`에서 `authorized` 게이트 도입 → 인가 확인 전 사이드바·children·어드민 API 요청 차단(Toast만 게이트 밖) ✅
- **B-S7** rate limit + 보안 헤더: `helmet`(CSP off로 swagger 보존) + `express-rate-limit`(로그인/계정생성/이메일검증 15분 20회/IP) ✅

> ⚠️ **남은 보안 항목(Phase 2 이후)**: F-S2(localStorage 토큰 → HttpOnly 쿠키 검토), B-S6(토큰 role DB 재확인/무효화), B-H3(페이지네이션 클램프), B-S10(크롤러 SQLite 식별자).

### 2026-06-15 · Phase 2 기능
- **B-H1** 누락/오라우팅 엔드포인트: `PATCH /admin/user/:id/status`(밴/언밴, User.status 컬럼 부재로 `permissions._status` 임시 저장), `GET /skill/list`(Skill 모델 부재로 `character.metadata.skills` 반환), `GET /character/admin/:id`(`/:gameSlug/:id`보다 먼저 등록해 오라우팅 해소) + 프론트 경로 1줄 정합 ✅
- **B-H4a** originalId 계약: 응답에 top-level `originalId`를 `metadata.originalId`에서 채워 노출(프론트 계약 충족, DB 변경 없음) ✅

#### ⏸️ B-H4b — DB 마이그레이션 (보류, 실 DB 변경이라 별도 진행)
온전한 originalId 정규화(컬럼 저장 + 인덱스)는 아래 **순서대로** 진행해야 안전(데이터 변경 + 스키마 변경 동반):
1. **중복 점검** (실패 예방): `(gameId, metadata->>'originalId')` 중복 행이 있으면 `@@unique`가 실패 → 먼저 정리.
   `SELECT game_id, metadata->>'originalId' AS oid, count(*) FROM characters GROUP BY 1,2 HAVING count(*)>1;`
2. **backfill**: `UPDATE characters SET original_id = metadata->>'originalId' WHERE original_id IS NULL;`
3. **스키마**: Character에 `@@unique([gameId, originalId])`, Item에 `originalId String? @map("original_id")` 추가.
4. **마이그레이션**: `pnpm prisma migrate dev --name add_original_id` (⚠️ 실 DB 변경).
5. **코드 전환**: `DataSyncService`·`character/service`·`item/service`의 `metadata.path(['originalId'])` 조회/저장을 **컬럼 기반**(`where: { originalId }`, upsert에 `gameId_originalId`)으로 교체 — 위 backfill 후에 해야 기존 데이터가 매칭됨.

> 미운영 상태라 급하지 않음. 실제 배포/크롤러 운영 전에 위 절차로 일괄 적용 권장.

### 2026-06-15 · Phase 3 안정성
- **B-H2** 무제한 findMany: 공개 목록 5개 서비스에 `take: MAX_LIST(1000)` 상한(silent truncation 주석) ✅
- **B-H3** 페이지네이션 클램프: admin/user 6개 핸들러에 `limit→1..100`, `page→≥1` 보정(음수 skip 500·전체로드 차단) ✅
- **B-H7** 크롤러 axios timeout: 스크래퍼/다운로더 37개 호출에 `timeout: 15000`(업스트림 행 방지) ✅
- **B-H8** 크롤러 중복 실행 방지: 수동 실행(CrawlerController, 409)·스케줄러 모두 RUNNING 로그 검사로 동시 실행 차단(싱글톤 브라우저 충돌 방지) ✅

### 2026-06-15 · Medium 정리
- **B-M2** `InternalServerError` 클래스: name `'BadRequest'`→`'InternalServerError'`, code `400`→`500` ✅
- **B-M3** 토큰 필드: approve/rejectEvent의 `req.user?.id`(undefined)→`req.user?.userId` (reviewedBy 기록 복구) ✅
- **B-M4** 경쟁 조건: approve/reject를 조건부 `updateMany(status:PENDING)`로 원자화(이중 처리 시 409) + `findOrCreateElement` 트랜잭션(완전 방지는 `@@unique` 마이그레이션 필요) ✅

> ⏸️ **의도적 보류**: B-M1(응답 envelope 통일 — 프론트 계약 깨뜨릴 위험 큰 cross-cutting 리팩터링, 프론트와 함께 진행할 일), B-H5(N+1 — sync 로직 변경 리스크), B-M5(누락 인덱스 — 마이그레이션), B-M7/M8(Docker DB 호스트·타임존), B-S6(토큰 무효화), F-S2(localStorage 토큰).

### 2026-06-15 · 프론트엔드 재점검 (회귀 검증 + 신규)
**회귀 검증 ✅**: 이번 세션 변경(XSS sanitize·baseURL·어드민 가드 F-S1·타입 수정) 전수 확인 — 회귀 없음.
**정리(cleanup)**: `<svelte:component>` deprecated 2곳 → Svelte5 직접 렌더, 중복 파일 `ContentView copy.svelte` 삭제, 디버그 console.log 9개 제거(순수 로깅 `$effect` 2개 포함). warnings 73→70.
**신규 버그 수정**:
- 🟠 어드민 **이벤트 편집 미연결**(빈 TODO): `WindowService.openModal(modal, data?)` 하위호환 확장 + `modalData` 스토어로 편집 배선, 모달 `openForEdit` 연결 ✅
- 🟡 모달 저장 후 `window.location.reload()` → `invalidateAll()` ✅
- 🟡 `RankListView` `gameId==='13'`(문자열 dead code) → 숫자 `13`, `TeamMember` `gameSlug` 누락(항상 undefined) → `getInitData`에 `data.gameSlug` 포함 ✅
- 🟢 admin `[slug]/[id]/+page.ts` fetch try/catch, 미사용 import 제거, `sanitize.ts` 주석 정정 ✅

> 🔎 **수동 확인 1건**: 어드민 이벤트 **편집** 흐름은 정적 수정이라, 실제 앱에서 편집 버튼→모달 프리필→저장이 동작하는지 클릭 테스트 권장.

> ⏸️ **재점검에서도 보류 확인(설계성)**: F-B1(구독 누수), F-B2(싱글톤 race), F-B3(slug/gameId 3중 혼재), F-B4(Math.random key), F-T1(가짜 모니터링 데이터 폴백), F-A2(401/refresh dead code), F-A3(에러 빈배열 은폐) — 코드 변화 없음, 설계 변경 동반이라 별도 과제.

> ⚠️ **남은 보안 후속(Phase 1)**: 커밋된 dev 시크릿/DB 비번(B-S1·S2)은 코드 변경만으론 안 되고 **키 로테이션 + git 히스토리 스크럽**이 필요 — 파괴적 작업이라 사용자 확인 후 진행. config.ts 변경으로 prod는 env 기반이 됐으나 dev json의 평문 시크릿은 여전히 추적 중.

### 2026-06-16 · 프론트 보류 항목 처리 (런타임 검증 동반)

이전 "보류(설계성)"로 남겼던 프론트 항목들을 실제 앱 구동(Playwright + 시스템 Chrome, 백엔드는 목)으로
검증하며 처리. 각 건 `pnpm run check` 0 errors.

- **어드민 이벤트 모달 (수동 확인 1건 → 버그 2개 발견·수정)** (`58dafe0`): `/admin/event`에 모달 호스트
  `<DesktopModal />`가 미마운트라 편집·추가 둘 다 모달이 안 떴음 → 마운트. 추가로 `openForEdit`이 ISO-8601
  날짜를 `datetime-local`에 그대로 넣어 시작/종료가 비고 저장이 막히던 2차 버그 → `toDateTimeLocal` 정규화. ✅
- **F-A3** 에러를 빈 데이터로 위장 (`6b8b500`): `+layout.ts`/`+page.ts` 게임목록 실패 → 토스트 + `infoError`,
  `list/[slug]` 게임정보 실패 → 가짜 404 대신 **503**, 캐릭터목록 실패 → 토스트 + `listError`,
  `getCharacterList` 성공여부 반환. ✅
- **F-T1** 가짜 모니터링 데이터 폴백 (`ab50628`): `AdminStatsService`(system stats/summary)·`AdminUserService`
  (users/detail)의 목 폴백 제거 → null/empty + 표면화(차트·요약 인라인 에러, 사용자 토스트), 무한 스피너(로딩 위장)
  → 에러 분기. 죽은 `setMock*` 삭제. (`fetchCompleteness`/visitor/keyword는 실패 위장이 아닌 미구현 스텁이라 범위 외) ✅
- **F-B1/F-B2** 구독 누수 + 싱글톤 race (`040f25f`): `getGameInit`·`applyFilter`·load들의 subscribe-읽기 →
  `get()`. `getCharacterList`는 active slug 태깅 + `'ok'|'error'|'stale'` 반환 → 빠른 네비 시 stale 응답이
  현재 게임을 덮어쓰지 않게(가드), 'stale'은 에러로 취급 안 함. ✅
- **F-B4** `Math.random()` 리스트 key (`c0e36f3`, 팀 에이전트): 3개 스킬트리 뷰모델의 key 폴백을
  결정적 `skill-${index}`로. ✅
- **F-B3** slug 3중 혼재 (`da41db4`): RankListView의 vm 분기가 gameId(enum명·숫자)·slug를 섞던 것(enum명 검사는
  숫자 gameId라 죽은 코드) → `gameSlug` 단일 키 switch로 정규화, 미사용 `gameId` prop 제거. content 링크는
  전부 slug라 실네비 동작 동일. ✅

> ⏭️ **남음**: **F-S2**(localStorage 토큰 → HttpOnly 쿠키)는 백엔드 쿠키 set/clear + CORS credentials 동반이라
> 양쪽 동시 작업 필요. **F-A2**(401/refresh dead code), **F-T4**(`any` 288건)는 별도 과제.

---

## 1. 백엔드 — 보안 (`kingduck-server`)

스택: Express 4 + Prisma 7 + JWT + bcrypt + Puppeteer/yt-dlp 크롤러. multer·raw SQL 미사용(주입 표면 작음), bcrypt·express-validator 적용은 양호.

| ID | 심각도 | 위치 | 문제 | 권장 |
|----|--------|------|------|------|
| B-S1 | 🔴 | `src/config/application.dev.json:19` | **JWT_SECRET_KEY 평문 커밋** (`54321FBE...`). 토큰 위조 → 임의 ADMIN 가능. git 추적됨 | 시크릿 env로 이전·즉시 로테이션·히스토리 제거(BFG), ≥256bit 랜덤 |
| B-S2 | 🔴 | `application.dev.json:8` · `application.prod.json:8` · `.env:1` | **DB 비밀번호 평문 커밋 + 약함**(`102468`) | 강한 랜덤으로 교체, env 주입, 히스토리 정리 |
| B-S3 | 🔴 | `src/index.ts:22-35,44-58` | **CORS가 모든 Origin 허용 + `credentials:true`** (미일치도 `callback(null,true)`, OPTIONS가 origin 반사) → 자격증명 탈취/CSRF | 미일치 origin 거부, 반사 제거, 화이트리스트를 env로 |
| B-S4 | 🟠 | `routes/admin/router.ts:11` · `services/UserManagementService.ts:111-135` | **권한 상승**: `PUT /user/:id/role`이 MANAGER에도 허용, 대상 role 검증 없음 → MANAGER가 스스로 ADMIN 승격 | role 변경은 `['ADMIN']`만, role enum 검증, 자기/최종관리자 보호 |
| B-S5 | 🟠 | `application.prod.json`(키 부재) | prod에 JWT 시크릿 없음 → 운영 시 sign throw 또는 dev 시크릿 재사용 (→ B-C1과 동일 뿌리) | env 주입 + 부팅 시 fail-fast |
| B-S6 | 🟡 | `src/middleware/auth.ts:38-46` | 인가가 토큰 `role`만 신뢰, DB 재확인·토큰 무효화 없음 → 차단/강등이 만료(1일) 전까지 미반영 | 민감 작업 시 DB 재조회, 토큰 버전/세션 무효화 |
| B-S7 | 🟡 | `package.json`(의존성) · `routes/account/LoginController.ts` | **rate limit·helmet 부재** → 로그인 무차별 대입 가능 | `express-rate-limit`(로그인/가입), `helmet` |
| B-S8 | 🟡 | `routes/video/router.ts:11` | 미인증 라우트가 yt-dlp/puppeteer 트리거 → 자원 고갈(DoS). (덤: `videoController.ts:24,46` import 누락 ReferenceError = B-C2) | 인증 추가, 동시 실행 큐 제한 |
| B-S9 | 🟡 | `LoginController.ts:40` · `JsonWebToken.ts:31` | **토큰/PII 콘솔 로깅**(JWT 평문 출력) | 토큰·이메일·payload 로깅 제거 |
| B-S10 | 🟢 | `crawlers/scrapers/trickcal/TrickcalScraper.ts:65,80,...` | 원격 SQLite 테이블명 문자열 조립(`SELECT * FROM ${t}`) — 입력원이 원격 DB라 이론적 주입(추정) | 식별자 화이트리스트 |

---

## 2. 백엔드 — 정확성 / 운영 (`kingduck-server`)

핵심: **부팅 실패 3종 → 부팅돼도 async 예외 시 요청 무한 행 → 크롤러 좀비 Chromium 누수.**

### 🔴 Critical
- **B-C1 · 프로덕션 부팅 불가 3중 결함**
  1. start 경로 불일치: `package.json:8`은 `dist/src/index.js`인데 `tsconfig`(`rootDir:./src`) 산출물은 `dist/index.js` → `Cannot find module`. `Dockerfile:46` 크래시 루프.
  2. config JSON 미복사: `src/config/config.ts:3-4`가 `require('./application.prod.json')`이나 tsc가 JSON을 outDir에 복사 안 함 → 런타임 모듈 없음.
  3. prod JWT 시크릿 누락(B-S5): `docker-compose.yml:9`가 `NODE_ENV=production` → 키 `undefined` → 로그인/인증 전부 500.
  → 권장: `node dist/index.js`로 수정, 빌드에 JSON 복사 단계, prod 시크릿 env 주입.
- **B-C2 · video 컨트롤러 100% 크래시** `routes/video/videoController.ts:24,46` — Sequelize 잔재 `Character`/`CharacterImage` 미import + try/catch 없음 → ReferenceError → (B-C4로) 응답 영구 행. Prisma로 재작성 + try/catch.
- **B-C3 · 인증 엔드포인트 가드 없는 async** `LoginController.ts:8-55`, `AccountController.ts:17,29`(await가 try 밖) — DB/bcrypt 실패 시 응답 없이 매달림. await 구간 전체 try/catch.
- **B-C4 · 전역 에러 미들웨어 부재** `src/index.ts:72` 이후 4-arg 핸들러·404 catch-all 없음 → async reject가 응답 미전송(소켓 행). 종단 에러 미들웨어 + `asyncHandler` 래퍼.
- **B-C5 · 어드민 이벤트 CRUD 미구현** 프론트가 부르는 `POST/PUT/DELETE /admin/event[/:id]`(`AdminEventModal.svelte:68,70`, `AdminEventList.svelte:215`)가 백엔드에 없음 → 404, UI 비기능.
- **B-C6 · 크롤러 Puppeteer 브라우저 누수** `utils/apiUtils.ts:11-36`, `scheduler.ts:362`, `namuWikiUtils.ts:41` — `close()`가 성공 경로에만/finally 아님 → 좀비 Chromium·PID 고갈. 전부 `try/finally`.

### 🟠 High
- **B-H1 · 미구현/오라우팅 엔드포인트**: `PATCH /admin/users/:id/status`(밴/언밴, 경로도 복수 불일치) 없음 · `GET /skill/list`(스킬트리) 라우터 미등록 · `GET /character/admin/:id`가 `gameSlug="admin"`으로 오해석 → 항상 404.
- **B-H2 · 무제한 `findMany`(take 없음)**: `character/service.ts:16`, `item/service.ts:39`, `element/`, `event/`, `redeem/service.ts:12` — 공개 목록이 테이블 전체 로드.
- **B-H3 · 페이지네이션 미검증**: 다수 컨트롤러 `take:limit` 클램프 없음 → `?limit=99999999` DoS, `?page=-5` → 음수 skip → 500. `Math.min/max` 클램프.
- **B-H4 · `originalId`를 JSON 경로로 조회 → 풀스캔**: `DataSyncService.ts:79-87,161-169`, `character/service.ts:52-66` — 인덱스 불가 순차 스캔. **게다가 프론트 계약 불일치**: 프론트는 최상위 `character.originalId` 기대(`api.ts:30`)인데 백엔드는 `metadata.originalId`에 저장 → 항상 `undefined`. 실제 컬럼(`schema.prisma:126`)에 저장 + `@@unique([gameId,originalId])`.
- **B-H5 · N+1 동기화/조회 루프**: `DataSyncService.ts:56-130` 등 직렬 라운드트립, `CrawlerController.getStatus`(폴링마다 N×M), `AdminController.getGameList`(게임당 count 3회). Map 프리로드/`groupBy`.
- **B-H6 · 크롤러 실패가 "성공 0건"으로 은폐**: `starrail/EventScraper.ts:86`, `wutheringwaves/EventScraper.ts:97,135`가 오류 삼키고 `[]` 반환 → `SUCCESS` 기록. `PARTIAL` enum은 정의됐으나 한 번도 set 안 됨. 스크래퍼 re-throw + sync가 {success,errors} 반환.
- **B-H7 · axios 타임아웃·재시도 전무 + 취약 파싱**: 모든 `axios.get`에 timeout 없음 → 업스트림 행 시 무한 정지. `response.data.data.list` 식 무방비 구조 가정. timeout+재시도+셀렉터 방어.
- **B-H8 · 동시/중복 실행 락 부재**: 스케줄러·수동 실행이 같은 싱글톤 Browser 공유 → close 충돌·중복 upsert. (game,type)별 isRunning 가드.
- **B-H9 · 커밋된 비밀정보**(= B-S1·S2 재확인) + `.env`의 실사용형 `YOUTUBE_API_KEY` 평문. 키 로테이션 + gitignore + 히스토리 스크럽.

### 🟡 Medium (요약)
- **B-M1** 응답 envelope 난립(공개=raw / admin=`{resultCode,items}` 또는 `{data:{items}}` 혼재) → 단일 파서 불가. 공용 헬퍼로 통일.
- **B-M2** `manager/Errors/InternalServerError.ts:7,9` name=`BadRequest`, code=400 — 500이 400으로 오보고.
- **B-M3** 토큰 필드 불일치: 발급은 `userId`인데 `AdminController.ts:273,347`은 `req.user?.id`(undefined) → `reviewedBy` 미기록. `req.user?.userId`로 통일.
- **B-M4** 트랜잭션 없는 read-check-write 경쟁(`findOrCreateElement`, `approve/rejectEvent`) → 중복/이중 처리. `$transaction` 또는 조건부 `updateMany`.
- **B-M5** 누락 인덱스/유니크: `RedeemCode.groupId` FK, `Element(gameId,name,type)` 유니크, `CalendarEvent.reviewedBy` FK.
- **B-M6** CORS 무력화(= B-S3) + 홈 IP 하드코딩.
- **B-M7** Docker DB 호스트 `127.0.0.1` 하드코딩 + compose에 DB 서비스 없음 → `$connect` 실패 가능(추정).
- **B-M8** 타임존 처리 취약(`starrail/EventScraper.ts:263-265` 등) → 연말 롤오버 버그.

### 🟢 Low (선택)
B-L1 DB 연결 실패해도 listen 지속(`process.exit` 없음) · B-L2 detached `.catch` 내 await가 unhandledRejection · B-L3 RUNNING 로그 영구 고착(기동 시 stale 스윕 필요) · B-L4 하드코딩 운영 취약(Arca 단일 글 ID, DB에 `localhost:3000` URL 저장) · B-L5 HTTP status vs body code 불일치 · B-L6 포트 3000 전역 하드코딩.

---

## 3. 프론트엔드 (`kingduck`)

### 🔴 Critical
- **F-S1 · 어드민 가드가 클라이언트 onMount 전용** `routes/admin/+layout.svelte:13-18` — `onMount` 실행 전 children이 잠깐 렌더되어 어드민 요청이 먼저 나갈 수 있음. 판정도 서명 검증 없는 `atob(role)`. **진짜 방어는 백엔드**(B-S1과 합쳐지면 무방비). 최소 `{#if authorized}`로 children 선렌더 차단.
- **F-S2 · JWT를 localStorage 평문 저장** `AuthTokenService.ts:24,33` — XSS 시 토큰 탈취. HttpOnly+Secure 쿠키로 이전 검토.
- **F-S3 · `{@html}`로 외부 데이터 렌더 → 저장형 XSS**: 최악은 이벤트 상세 `routes/calendar/[slug]/[id]/+page.svelte:605`(메타 `full_content`를 이스케이프 없이). 동형 다수: `RankListView.svelte:76`, `CarouselListView.svelte:215,303`, `SkillTreeView.svelte:181`, `TraceListView.svelte:134`, `EquipmentItemView.svelte:333`, `BuildRecommendationView.svelte:306,318`. 크롤링 텍스트=신뢰 불가 입력. **DOMPurify로 sanitize** 후 출력. (정적 설정값인 `ListCardView`의 `rarityIcon`은 저위험.)

### 🔴/🟠 API 연동
- **F-A1 🔴 · baseURL 하드코딩** `app/service/api/client.ts:5-10` — 브라우저에서 항상 `window.location.hostname:3000` 강제, `PUBLIC_API_BASE_URL` 무력. 같은 하드코딩이 `+layout.ts:38`, `list/[slug]/+page.ts:98`에도 복제 → 정적 배포 시 전부 깨짐. 단일 환경변수로 일원화.
- **F-A2 🟠 · 401 처리/리프레시 없음** `client.ts:34-43` 인터셉터가 콘솔만. `setRefreshToken/needsRefresh`는 정의됐으나 **호출처 없는 죽은 코드**. 401 시 토큰 정리+로그인 유도 또는 refresh 교환 구현.
- **F-A3 🟠 · 에러를 빈 배열로 조용히 삼킴** `+layout.ts:30-32`, `CharacterListService.ts:55-59`, `list/[slug]/+page.ts:58-60` — 장애가 "데이터 없음"으로 위장. 에러 상태를 load 반환에 포함.

### 🟠 정확성 버그
- **F-B1 · 구독 누수/안티패턴**: `list/[slug]/+page.ts:94`(unsubscribe 누락), `GameSettingService.ts:23-29`(매 호출 구독), `CharacterListService.ts:72-75,114-115`(즉시 subscribe→unsubscribe). 값 읽기는 `get(store)`로.
- **F-B2 · 싱글톤 스토어 라우트 공유 → race**: `GameSettingService`/`CharacterListService`가 전역 1개 스토어 → 빠른 네비게이션 시 늦게 온 응답이 현재 게임 설정 덮어씀. load 반환으로 전달하거나 slug 가드로 stale 폐기.
- **F-B3 🟡 · slug 표기 3중 불일치**: `RankListView.svelte:21-32`가 `HonkaiStarRail`/`starrail`/`'13'`을 OR로 묶음. enum명/slug/숫자ID 혼재 → 신규 게임마다 누락 위험. slug 단일 키로 정규화. (devlog #3에 이미 기록한 빚.)
- **F-B4 🟡 · `Math.random()`을 리스트 id로**: `WwSkillTreeViewModel/HsrSkillTreeViewModel/Reverse1999SkillViewModel.svelte.ts`의 `id: item.id || Math.random()` → `{#each}` key 불안정. index 기반 결정적 key.

### 🟡 기술부채
- **F-T1 · 운영 서비스에 가짜 데이터 폴백**: `AdminStatsService.ts:174-205`(가짜 CPU/메모리), `AdminUserService.ts:170-171`(가짜 시각) — API 실패가 "정상 그래프"로 위장 → 모니터링 신뢰성 훼손. 목 폴백 제거.
- **F-T2 · 문서-실제 불일치**: `src/service/`는 **빈 디렉터리**인데 `CLAUDE.md`/`ARCHITECTURE.md`는 "레거시 공존"이라 기술. → 빈 폴더 삭제 + 문서 갱신.(아래 5장에서 처리)
- **F-T3** `<svelte:component>` deprecated: `admin/[slug]/+page.svelte:60`, `admin/[slug]/[id]/+page.svelte:46`.
- **F-T4** `any`/`$state<any>` 288건(83파일) — 타입 안전성 무력화. 핵심 흐름부터 실제 타입.
- **F-T5 🟢** `console.*` 49건, 중복 파일 `agent/mobile/ContentView copy.svelte` 삭제.

---

## 4. 우선 수정 로드맵

**Phase 0 — 배포 차단 해소 (백엔드 없으면 아무것도 안 됨)**
1. B-C1(부팅 3종) · B-C4(전역 에러 미들웨어) · B-C2·C3(핵심 핸들러 try/catch)

**Phase 1 — 보안 (공개 배포 전 필수)**
2. B-S1·S2·H9(비밀정보 로테이션 + 히스토리 제거) · B-S3/M6(CORS 잠금)
3. B-S4(role 변경 권한) · F-S3(XSS sanitize) · F-S1(어드민 children 차단) · F-A1(baseURL)

**Phase 2 — 기능 정상화**
4. B-C5·H1(누락 엔드포인트: admin event CRUD, user status, skill, admin character) · B-H4(originalId 계약/인덱스)
5. F-A2(401/refresh) · F-A3(에러 노출) · F-B1·B2(구독 누수/race)

**Phase 3 — 안정성·부하**
6. B-C6·H7·H8(크롤러 누수/타임아웃/락) · B-H6(실패 은폐/PARTIAL) · B-H2·H3·H5(쿼리 한계·N+1)

**Phase 4 — 정리**
7. F-T1(가짜 데이터) · B-M*(envelope/에러클래스/토큰필드/인덱스) · slug 정규화 · 죽은 코드/문서 정리

---

## 5. 잘 된 부분 (참고)
- 백엔드: Prisma 단일 싱글톤·raw SQL 없음(SQL 주입 표면 없음), bcrypt 적용, `auth.ts` 미들웨어 자체는 try/catch로 안전, 대부분 `findUnique` null 체크.
- 프론트: 게임설정-데이터 분리 아키텍처는 견고(`doc/ARCHITECTURE.md`), 응답 일부를 방어적으로 파싱(`AdminCrawlerLogs`).

> 모든 항목은 정적 분석 기반이다. 수정 착수 전 각 항목을 실제 실행/재현으로 1차 확인할 것.
