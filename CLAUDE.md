# CLAUDE.md

이 파일은 Claude Code(및 팀 에이전트)가 이 저장소에서 작업할 때 따르는 가이드다.
세부 아키텍처는 `doc/ARCHITECTURE.md`, 도메인 배경은 `doc/multi_game_architecture.md` 참고.

## 프로젝트 한눈에

**kingduck** — 여러 가챠 게임(원신·스타레일·명조·니케·리버스1999·엔드필드·소녀전선2 등)의
캐릭터/이벤트/캘린더/티어리스트/쿠폰 정보를 한 플랫폼에서 제공하는 비공식 정보 사이트.

- **이 저장소 = 프론트엔드만.** SvelteKit(Svelte 5 runes) + TypeScript + TailwindCSS.
- **백엔드는 별도 저장소 `kingduck-server`** (Node/Express + Prisma + PostgreSQL), 포트 `3100`.
  이 repo에는 없다. API는 전부 `/api/v0/...` REST.
- **배포**: `adapter-static` 기반 **CSR/SPA** (`fallback: index.html`). 서버 렌더링 없음.

## 명령어 (pnpm 강제 — `.npmrc: engine-strict=true`)

```bash
pnpm install
pnpm run dev          # 개발 서버 (http://localhost:4173, strictPort). 백엔드 3100번이 떠 있어야 데이터가 보인다
pnpm run build        # 정적 빌드
pnpm run preview      # 빌드 결과 미리보기
pnpm run check        # svelte-kit sync && svelte-check (타입 검사) — 변경 후 항상 실행
pnpm run lint         # prettier --check && eslint
pnpm run format       # prettier --write
pnpm run test         # vitest --run
```

> 백엔드 URL은 `.env`의 `PUBLIC_API_BASE_URL`(기본 `http://127.0.0.1:3100`). `localhost`가 아닌
> `127.0.0.1`을 쓰는 이유: 같은 머신의 다른 프로젝트가 IPv6(`::1`)로 포트를 점유 중일 때
> `localhost`→`::1` 해석으로 SSR(node fetch)가 엉뚱한 서버에 붙는 사고를 막기 위함. `client.ts`는
> `PUBLIC_API_BASE_URL`이 없을 때만 브라우저에서 `window.location.hostname:3100`을 폴백으로 쓴다.
> 포트: 프론트 `4173`(strictPort), 백엔드 `3100`. (5173/3000 및 5xxx 인근은 다른 프로젝트가 사용)

## 아키텍처 핵심 (이것만은 알고 시작)

1. **게임별 설정이 데이터다 — 코드 분기 최소화.**
   각 게임은 `src/app/model/game/<Game>Init.ts`의 `class ...Init { init() { return {...} } }`가
   UI 구조(필터 `type`, `rarity`, `list`, `content`, `layout`)를 통째로 반환한다.
   라우트 `+page.ts`가 `params.slug`로 알맞은 Init을 골라
   `GameSettingInitService.updateGameInit(...)`로 스토어에 주입하고, 컴포넌트는 이 설정을 읽어 렌더한다.
   **→ 새 게임 추가 = 새 Init 파일 + slug switch 등록. 자세히는 `doc/ARCHITECTURE.md`의 "새 게임 추가".**

2. **다중 게임을 스키마 하나로 — `metadata` 제네릭.**
   `CharacterType<T>` / `ItemType<T>`의 공통 필드는 컬럼, 게임별 가변 데이터는 `metadata: T`(JSON).
   게임 전용 타입을 제네릭으로 주입해 타입 안전성을 확보한다. (`src/app/model/api/api.ts`)

3. **레이어 구분**
   - `src/routes/**` — SvelteKit 라우트. `+page.ts` load가 API를 호출하고 게임 설정을 주입.
   - `src/app/service/**` — 싱글톤 서비스. `class XInit {} → export const X = new XInit()` 패턴, 내부 `writable` 스토어 보유.
   - `src/app/model/**` — 타입/게임설정/캘린더 도메인 모델.
   - `src/app/view/**` — 기능 컴포넌트(`*View`, `Admin*`, `*Menu` 접미/접두).
   - `src/app/view-framework/**` — 게임 무관 프리미티브(ContentLayer, Desktop/MobileModal 셸).
   - `src/utils/**` — 순수 헬퍼(calendar, mobile).

4. **반응형**: `data.isMobile`(레이아웃 load에서 UA 감지)로 `agent/desktop/*` vs `agent/mobile/*` 분기.

5. **인증**: `AuthTokenService`가 JWT를 localStorage(`auth_token`/`refresh_token`)에 저장,
   `client.ts` 인터셉터가 `Authorization: Bearer`를 자동 첨부. 관리자 보호는
   `routes/admin/+layout.svelte`의 `onMount`에서 `authTokenService.isAdmin`(role ADMIN/MANAGER) **클라이언트 측** 가드.
   서버 측 가드 없음(SPA라 `+page.server.ts` 없음).

## 컨벤션

- **Svelte 5 runes**: `$state`, `$derived`, `$props`, `$effect` 사용. 전역 반응 상태는 서비스의 `writable` 스토어.
- **서비스 패턴**: `class FooServiceInit { ... } export const FooService = new FooServiceInit()`. 새 서비스도 이 형태.
- **import 경로**: 상대경로 + SvelteKit 빌트인(`$app/*`, `$env/static/public`)만. `$lib` 거의 안 씀, 커스텀 alias 없음.
- **포맷(Prettier)**: **탭** 들여쓰기, 작은따옴표, trailing comma 없음, printWidth 100. TS strict.
- **스타일**: Tailwind 우선(dark mode `class` 전략). 별도 .scss 파일은 거의 없음.
- **아이콘**: Remixicon(`ri-*`). 토스트/모달 등에서 사용.
- **토스트**: `toastStore.success/error/info/warning(msg)`. **모달**: `WindowService.openModal('<type>')` / `closeModal()`.

## 주의점 (Gotchas)

- **API base URL 이원화**: `PUBLIC_API_BASE_URL`이 설정돼 있으면 그것을 쓰고(현재 `.env`엔 설정됨),
  없을 때만 `client.ts`가 브라우저에서 `window.location` 기반 `:3100` 폴백을 쓴다.
  배포 시 백엔드가 같은 호스트 3100이 아니면 이 폴백 로직도 손봐야 한다.
- **CSR 전용**: `browser` 가드 없는 `window`/`localStorage` 접근 주의. prerender 안 함.
- **관리자 가드가 클라이언트 전용**: 진짜 권한 검증은 백엔드 책임. 프론트 가드는 UX용.
- **서비스 위치**: 모든 서비스는 `src/app/service/`에 있다. (옛 `src/service/` 잔재 폴더는 제거됨 — `doc/code-audit.md` F-T2.)
- 변경 후 **`pnpm run check`로 타입 통과를 확인**하고, 커밋 전 `pnpm run lint`.

## 작업 시 기본 태도

- 새 기능은 위 5개 아키텍처 패턴을 따른다. 게임별 분기를 `{#if slug === ...}`로 하드코딩하지 말고
  가능하면 게임 Init 설정/레이아웃 배열로 표현한다.
- 커밋·푸시는 사용자가 요청할 때만. 커밋 메시지는 한 줄 요약 + 필요 시 본문.
- 블로그 연재 관련 문서는 `doc/devlog/`, `doc/dev_blog_plan.md`에 있다 — 코드 작업과 무관하면 건드리지 말 것.
