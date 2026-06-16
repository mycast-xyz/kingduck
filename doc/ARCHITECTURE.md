# 아키텍처 (Architecture)

kingduck 프론트엔드의 구조 종합 문서. 빠른 시작/명령어는 루트 `CLAUDE.md` 참고.

## 1. 시스템 구성

```
┌─────────────────────────────┐        REST /api/v0/*        ┌──────────────────────────┐
│  kingduck (이 저장소)        │  ─────────────────────────►  │  kingduck-server (별도)    │
│  SvelteKit · Svelte 5 · TS   │  ◄─────────────────────────  │  Express · Prisma · PG     │
│  adapter-static (CSR/SPA)    │        JSON (+ JWT Bearer)   │  포트 3000                 │
└─────────────────────────────┘                              └──────────────────────────┘
```

- 프론트는 정적 파일로 빌드되어 어디서든 호스팅(GitHub Pages 등, `BASE_PATH` 지원).
- 모든 동적 데이터는 런타임에 백엔드 REST에서 페치.

## 2. 디렉터리 레이어

| 경로 | 역할 |
|------|------|
| `src/routes/**` | SvelteKit 라우트. `+page.ts` load가 API 호출 + 게임설정 주입, `+page.svelte`가 렌더 |
| `src/app/service/**` | 싱글톤 서비스(+내부 `writable` 스토어). API/auth/character/game/admin |
| `src/app/model/**` | 타입(`api/`), 게임설정(`game/`), 캘린더·날씨 도메인(`calendar/`) |
| `src/app/view/**` | 기능 컴포넌트. admin/ calendar/ info/ list/ menu/ modal/ toast/ agent/ 등 |
| `src/app/view-framework/**` | 게임 무관 UI 프리미티브(ContentLayer, Desktop/MobileModal 셸) |
| `src/app/store/**` | 전역 Svelte 스토어(현재 `theme.ts`) |
| `src/utils/**` | 순수 헬퍼(calendar 타임라인 계산, mobile UA 감지, URL) |

## 3. 핵심 패턴 — 게임별 설정을 데이터로

이 프로젝트의 확장성은 전부 여기서 나온다.

### 3.1 게임 Init 클래스

`src/app/model/game/<Game>Init.ts`:

```ts
export class HonkaiStarRailInit {
  init(): GameInitConfig {
    return {
      gameId: 'starrail',
      copyright: { ... },
      type:    { /* 필터 속성: damageType/path/element/weapon/corp ... */ },
      rarity:  { /* 등급 매핑(숫자↔문자), 기본값, 속성 필터 */ },
      list:    { /* 캐릭터·아이템 목록 표시/검색 설정, card 색상·그라데이션 */ },
      content: { /* 상세 페이지 섹션: image/video, attribute, info(mainItem/item/skill/gacha...) */ },
      layout:  [ /* { component, dataKey, initDataKey, props } 배열 → 상세 페이지 구성 */ ],
    };
  }
  setInit() { return this.init(); }
}
```

존재하는 게임: `nikkeInit`, `HonkaiStarRailInit`, `WutheringWavesInit`, `Reverse1999Init`,
`GirlsFrontline2Init`, `EndfieldInit`, + 특수 `CalendarInit`. 계약은 `GameInitConfig.ts`.

### 3.2 주입 & 소비 흐름

```
라우트 load(+page.ts)
  ├─ GET /api/v0/game/{slug}                     → 게임 메타
  ├─ switch(params.slug) → new XInit().setInit()  → GameSettingInitService.updateGameInit(config)
  └─ CharacterListService.getCharacterList(slug)  → GET /api/v0/character/{slug}/list

컴포넌트
  ├─ GameSettingInitService.showList 구독 → UI 구조/색상/라벨을 config에서 읽음
  └─ characterList 스토어 구독 → 필터링된 목록 렌더
```

상세 페이지는 `config.layout` 배열을 순회하며 `component`(예: `MainItemView`, `SkillTreeView`,
`TraceListView`)를 `dataKey`로 데이터를 꺼내 렌더 → **게임별 화면을 if 분기 없이 구성**.

### 3.3 새 게임 추가 (체크리스트)

1. `src/app/model/game/NewGameInit.ts` 생성 — `GameInitConfig` 형태로 `init()` 반환.
2. 해당 게임을 노출할 라우트들의 `+page.ts` slug switch에 등록:
   `routes/list/[slug]`, `routes/content/[gameEnName]/[characterId]`, `routes/calendar/[slug]`,
   `routes/tier-list/[slug]` 등.
3. 백엔드(`kingduck-server`)에 그 게임의 `Game.slug`/캐릭터/이벤트 데이터가 있어야 함.
4. 게임 전용 metadata가 있으면 `api.ts`에 `XxxCharacterMetaType` 추가 후 `CharacterType<XxxMeta>`로 사용.
5. 캘린더 색상이 필요하면 `model/calendar/CalendarConfig.ts`의 게임 색상 매핑에 추가.

## 4. 데이터 모델 (API 타입)

`src/app/model/api/api.ts`:

- `ResultCodeType<T>` — `{ resultCode, items, message? }` 공통 응답 래퍼.
- `GameType` — `{ id, slug, name, iconUrl?, ... }`.
- `ElementType` — `{ gameId, name, type("DamageType"|"Path"...), iconUrl? }` 게임별 속성 통합 테이블.
- `CharacterType<T=any>` — 공통 필드 + `metadata?: T`, 관계(`game/element/path`). **제네릭으로 게임별 메타 주입.**
- `ItemType<T=any>` — 무기/장비/재료 통합, `type`으로 구분.
- `CrawlerStatusType` / `CrawlerLogType` / `CrawlerRunRequest` — 어드민 크롤러용.

## 5. 서비스 레이어

| 서비스 | 파일 | 책임 |
|--------|------|------|
| API Client | `service/api/client.ts` | axios 인스턴스, Bearer 인터셉터, baseURL 결정 |
| AuthTokenService | `service/auth/AuthTokenService.ts` | JWT 저장/검증/역할판별, `token`·`isAuthenticated` 스토어 |
| GameSettingInitService | `service/game/GameSettingService.ts` | 현재 게임 `GameInitConfig`를 `showList` 스토어로 보관 |
| CharacterListService | `service/character/CharacterListService.ts` | 캐릭터 페치 + 타입/등급/검색 필터, `characterList` 스토어 |
| CharacterRarityService | `service/character/CharacterRarityService.ts` | 등급 문자↔숫자 매핑(getInstance 싱글톤) |
| WindowService | `service/WindowService.ts` | 모달 상태(`modal`, `ModalView`) |
| ToastService | `service/ToastService.ts` | 토스트 큐(`toastStore`) |
| MainMenuService | `service/MainMenuService.ts` | 내비/사이드바 토글 상태 |
| Admin* (User/Stats/SideMenu) | `service/Admin*.ts` | 어드민 페이지 데이터 |

패턴: `class XInit { ... } → export const X = new XInit()`. 내부 `writable`로 반응 상태 보유.

## 6. 라우트 맵

### 공개
| URL | load가 호출하는 API | 렌더 |
|-----|--------------------|------|
| `/` | `GET /game/list` | 게임 목록 랜딩 |
| `/list/[slug]` | `GET /game/{slug}`, `GET /character/{slug}/list` | 캐릭터 DB |
| `/content/[gameEnName]/[characterId]` | `GET /game/{g}`, `GET /character/{g}/{id}` | 캐릭터 상세(layout 기반) |
| `/tier-list/[slug]` | `GET /game/{slug}`, `/character/{slug}/list` | 드래그 티어표(SortableJS) |
| `/calendar` | `GET /game/list` + 게임별 `GET /event/{slug}` | 통합 캘린더 |
| `/calendar/[slug]` | `GET /game/{slug}`, `/redeem/{slug}`, `/event/{slug}` | 게임 캘린더 + 날씨경보 |
| `/calendar/[slug]/[id]` | `…`, `/event/detail/{id}`, `/{character\|item}/{g}/name/{name}` | 이벤트 상세 |
| `/coupon/[slug]` | `GET /game/{slug}`, `/redeem/{slug}` | 쿠폰 목록 |
| `/login`, `/login/create`, `/login/password` | `/account/login`·`/validate/email`·`/create/account` | 인증 폼 |

### 어드민 (`/admin/*`, `+layout.svelte`에서 `isAdmin` 가드)
| URL | 주요 API |
|-----|---------|
| `/admin/[slug]` (`character` 등 제네릭) | `GET /admin/character/list`, `GET /admin/game/list` |
| `/admin/[slug]/[id]` | `GET /character/admin/{id}` |
| `/admin/crawler` | `GET /admin/crawler/status`, `POST /admin/crawler/run`, `GET /admin/crawler/logs`, (`/admin/parser/*` TODO) |
| `/admin/event` | `GET/POST/PUT/DELETE /admin/event[/{id}]` |
| `/admin/user`, `/admin/user/[id]` | `GET /admin/user/list`, `/admin/user/{id}`, `/logs`, `PUT /role`, `PATCH /status` |
| `/admin/monitor` | `GET /admin/system/summary`, `GET /admin/system/stats` |

## 7. 캘린더 · 날씨경보 도메인

`src/app/model/calendar/`:

- `CalendarConfig` — `daysToShow=30, pastDays=3, pixelsPerDay=100`, 게임별 색상.
- `CalendarTypes` — `EventType = GACHA|EVENT|MAINTENANCE`, `CalendarEvent`, `LayoutEvent`(행 인덱스).
- `WeatherAlertCalculator.analyzeWeatherAlert(events, now)` — 가챠 일정을 날씨 경보 레벨로 변환:
  `DISASTER`(동시 픽업 3+), `DISSIPATION`(7일 내 종료), `WARNING`(진행중/3일 내), `ADVISORY`(7일 내 시작),
  `RECOVERY`(최근 점검), `SAFE`. 가챠 문화 밈 메시지는 `WeatherAlertMessages`.
- 타임라인 좌표 계산은 `utils/calendar/CalendarUtils.ts`(`resolveEventRows` 비겹침 배치 등).

## 8. UI 시스템

- **컴포넌트 명명**: 상세 패널 `*View`, 어드민 `Admin*`, 메뉴 `*Menu`, 반응형 `Desktop*`/`Mobile*` 또는 `desktop/`·`mobile/` 폴더.
- **모달**: 콘텐츠를 `view/modal/<feature>/`에 두고 `WindowService.openModal('<type>')`로 호출,
  `view-framework/modal/`의 셸(size 변형/백드롭)이 실제 렌더.
- **토스트**: `Toast.svelte`가 `toastStore` 구독, 서비스에서 `toastStore.success/error/...` 호출.
- **테마**: `store/theme.ts`(`light|dark|system`, localStorage 영속, `<html>`에 class 적용).

## 9. 빌드/배포 메모

- `adapter-static`, `fallback: index.html` → 순수 CSR. prerender entries 비움.
- `BASE_PATH` 환경변수로 서브경로 배포(GitHub Pages) 지원.
- 백엔드 URL은 `client.ts`가 브라우저에서 `window.location.hostname:3000`을 우선. 다른 호스트/포트면 이 로직 수정 필요.
