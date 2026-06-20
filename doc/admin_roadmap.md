# 기획안 — 어드민 기능 개발 & 수정 로드맵

> 작성일: 2026-06-20
> 방법: 팀 에이전트 3방향 병렬 감사(fe-audit 기능 인벤토리 · be-audit 백엔드 엔드포인트 · fix-audit 코드 품질/버그) 종합 + 운영자 관점 제안.
> 범위: 프론트 `G:\GitHub\kingduck` 어드민 + 백엔드 `G:\GitHub\kingduck-server` admin 엔드포인트.

---

## 0. 한눈에

- **현황**: 어드민 뷰 20개 중 **18 동작 / 2 스텁**(`AdminDashBoard` 목업, `AdminPendingData` 플레이스홀더). 미사용 컴포넌트 0.
- **가장 급한 것**: 게임·캐릭터 **"추가"가 완전 먹통**(모달 미등록), 캐릭터 목록 **편집 버튼이 죽어있음**. → 어드민의 기본 뮤테이션이 일부 불가.
- **숨은 결함**: 목록이 컴포넌트 자체 fetch라 모달 저장 후 `invalidateAll()`로는 안 갱신됨(아이템은 수정 완료, **이벤트·캐릭터는 동일 결함 잔존**).
- **백엔드**: 대부분 받쳐줌. 갭은 **쿠폰 수동관리·캐릭터 CRUD**가 핵심이며 **둘 다 테이블 존재 → 마이그레이션 불필요**.
- **메뉴 dead-end 3건**(`/admin/analytics`, `/admin/stats`, `/admin/layouts/collapsed`) + 라벨이 거짓인 항목 2건.

권장 진입: **Phase 0(즉효 수정, 프론트만)** → Phase 1(신뢰도) → Phase 2(기능 확장).

---

## 1. 현황 인벤토리 (fe-audit)

| 기능 | 진입점 | 상태 | 근거 |
|---|---|---|---|
| 대시보드 | `/admin/` → AdminDashBoard | 🟡부분 | 요약카드·활동로그 **목업**. 하위 위젯(방문자/검색/완성도)은 실 API. 93~95줄 **깨진 import 텍스트 노출** |
| 프로젝트 관리(칸반) | `/admin/kanban` | 🟡부분 | 컬럼·태스크 목업, API 없음 |
| 사용자 관리 | `/admin/user` (+`/user/[id]`) | ✅완성 | adminUserService 실 API |
| 캐릭터 관리 | `/admin/character` | ✅목록만 | list+상세는 동작, **추가/편집/삭제 불가**(아래 H1·H2) |
| 아이템 관리 | `/admin/item` | ✅완성 | 방금 구현(list/CRUD/이미지) |
| 게임 관리 | `/admin/game` | ✅완성 | list+아이콘+등급색 (단 게임 "추가"는 H1로 먹통) |
| 이벤트/캘린더 | `/admin/event` | ✅완성¹ | list/POST/PUT. ¹저장 후 목록 미갱신(M1) |
| 타입(속성/특성 아이콘) | `/admin/type` | ✅완성 | element list+색상/이름 |
| 크롤러/파서 | `/admin/crawler` (4탭) | 🟡부분 | 상태·로그·데이터공백 ✅ / **검토대기 탭 스텁** |
| 시스템 모니터링 | `/admin/monitor` | ✅완성 | 시스템 통계 실 API |
| 캘린더(메뉴) | `/admin/analytics` | 🔴dead-end | [slug] switch에 case 없음 → 빈 화면 |
| 통계 분석(메뉴) | `/admin/stats` | 🔴dead-end | case 없음 → 빈 화면(위젯은 대시보드에만) |

**generic `admin/[slug]` switch가 처리하는 case**: `kanban·game·character·type·item` 뿐. 그 외 slug는 default→null→빈 화면. `[slug]/[id]`는 `character`만.

---

## 2. 수정해야 할 부분 (fix-audit) — 우선순위

### 🔴 High
- **H1 — `admin-add-game` 모달 미등록 → 게임/캐릭터 추가 UI 먹통.**
  `DesktopModal.svelte` switch에 case 없음(kanban/event/item만). `AdminGameList`(게임 추가), `AdminCharacterList`(캐릭터 추가) 둘 다 `openModal('admin-add-game')` → 빈 모달만 뜸. *캐릭터는 별도 모달 타입이어야 맞음(현재 게임 모달 재사용 자체가 오류), 캐릭터 모달 컴포넌트도 없음.*
  ⚠️ **백엔드 의존**: Game·Character 둘 다 **create 엔드포인트 없음**(be-audit §5, G2·G3). 모달만 배선해도 저장 불가 → 풀 동작은 백엔드 동반(Phase 2). **Phase 0에서는 "추가" 버튼을 일단 숨김/비활성**해 dead-end만 제거하는 게 정직.
- **H2 — `AdminCharacterList` 편집 버튼이 죽어있음 + 갱신 없음.**
  편집 버튼에 `onclick` 자체가 없음(293~301), 삭제 버튼도 없음, 모달-close watcher도 없음. → 캐릭터 어드민은 사실상 읽기 전용.
  ⚠️ **백엔드 의존**: Character **update·delete 엔드포인트 없음**(G2). 편집/삭제 UI를 살리려면 백엔드 동반(Phase 2). **Phase 0에서는 죽은 버튼 제거/비활성**.

### 🟡 Med
- **M1 — 이벤트 목록 저장 후 미갱신.** `AdminEventModal`이 `closeModal()`+`invalidateAll()`만 호출하나 `/admin/event` load는 데이터를 안 들고 있음(목록은 컴포넌트 자체 fetch). → **아이템에서 고친 modal-close `$effect` watcher를 `AdminEventList`에도 이식**.
- **M2 — 캐릭터 상태표시 스텁/오작동.** `getImageStatus`/`getSkillStatus`가 항상 '완료' 반환(metadata 객체 검사 오류). 이미지/스킬/출시 컬럼 무의미 → 실제 필드 기준 재작성 또는 컬럼 제거.
- **M3 — 사이드바 collapse 시 본문 마진 깨짐.** `crawler/+page.svelte`·`user/+page.svelte`가 `mainMargin` derived 무시하고 `ml-64` 하드코딩. crawler 검토대기 배지 "3"도 하드코딩.

### ⚪ Low (묶음)
- 죽은 메뉴 링크 3건(`/admin/analytics`·`/admin/stats`·`/admin/layouts/collapsed`) + 라벨 거짓 2건("나무위키/hakush 테스트"가 실은 캐릭터/게임 목록).
- 사이드바 슬림화 토글 버튼 주석처리(collapse를 UI로 못 켬), `dropdownStates.menu3` 미사용.
- `alert()` 혼용(`AdminEventList.deleteEvent`, `AdminEventModal`)을 toastStore로. deleteEvent는 resultCode 미확인.
- 빈 `if(browser){}` 블록 + 미사용 import(`redirect`/`error`/`authTokenService`) — admin load들. 죽은 CSS(`admin/+page.svelte`). `AdminHeadMenu` 하드코딩(관리자/이메일, `/add-account` 링크 라벨 불일치).

> **이상 없음 확인**: 응답 봉투 처리(admin은 res.data.data, `/api/v0/admin/`만 unwrap 제외 일치), browser 가드(localStorage/window), 직접 fetch의 토큰 첨부, 구독/인터벌 정리.

---

## 3. 신규 기능 후보 (fe-audit + be-audit)

| 후보 | 가치 | 규모 | FE/BE | 백엔드 갭 |
|---|---|---|---|---|
| **dead-end 3건 해소 + 메뉴 정리** (`/admin/stats`에 기존 위젯 모으기) | 높음 | **S** | FE | 없음(위젯 존재) |
| **대시보드 실데이터화** (요약카드·활동로그 실 API + 깨진 잔재 삭제) | 높음 | S~M | FE+BE | 활동로그용 audit-log API |
| **컨텐츠 승인(이벤트)** — `AdminPendingData` 배선 | 높음 | **S~M** | FE | **없음**(백엔드 `/admin/event/pending·approve·reject` 이미 존재!) |
| **쿠폰/Redeem 수동 관리** | 높음 | L | FE+BE | RedeemGroup/Code CRUD(테이블 존재, 마이그X) |
| **캐릭터 CRUD**(추가/수정/삭제/이미지) | 중~높음 | M~L | FE+BE | Item 패턴 미러링(테이블 존재) |
| **공지사항/FAQ 관리** | 중 | M | FE+BE | 신규 모델 |
| **이미지/미디어 라이브러리**(미사용 정리) | 중 | L | FE+BE | 스캔/삭제 API |
| **팀 빌드 추천 관리** | 중 | L | FE+BE | 신규 데이터모델 |

> **핵심 발견**: "컨텐츠 승인 시스템"(plan #5)은 **이벤트에 한해 백엔드가 이미 완성**돼 있다. 스텁 `AdminPendingData`가 존재하지 않는 `/admin/parser/*`를 가리키고 있을 뿐 — 실제 경로 `/admin/event/pending|approve/:id|reject/:id`로 배선하면 즉시 동작한다(프론트만). 캐릭터/아이템 승인까지 확장하려면 그때 백엔드 추가.

---

## 4. 운영자 관점 추가 제안 (감사 외 — 직접 제안)

플랫폼 특성(크롤 주도 가챠 정보 사이트 + 최근 부분 프리렌더/AdSense 도입)을 고려한 운영 편의 기능.

| 제안 | 왜 필요(운영 관점) | 규모 | FE/BE |
|---|---|---|---|
| **A. 크롤 후 재빌드/배포 트리거 + sitemap ping** | 방금 도입한 **부분 프리렌더(list 랜딩)는 빌드 스냅샷**이라 크롤로 캐릭터 추가되면 stale. 어드민에서 "재빌드/배포" 버튼 + 구글/네이버 sitemap ping을 누르면 운영자가 SSH 없이 갱신. SEO 작업과 직결. | M | FE+BE(빌드 훅) |
| **B. 공개 페이지 미리보기(Preview as user)** | 캐릭터/아이템 어드민 상세·편집에서 "공개 페이지로 보기" 링크. 편집 결과가 실제 사이트에 어떻게 뜨는지 즉시 확인(특히 5분 캐시 지연 인지). | **S** | FE |
| **C. 변경 이력(Audit log)** | 누가 무엇을 언제 바꿨는지. 대시보드 "최근 활동"(현재 목업)을 실데이터로 채우는 소스이기도. 다중 관리자 대비. | M | FE+BE |
| **D. 쿠폰 빠른 추가 + 만료 임박 알림** | 신규 쿠폰 코드는 크롤러가 잡기 전 수기 입력이 빠를 때가 많음. 만료 임박 쿠폰을 대시보드에 표시해 노출 관리. (제안 D는 §3 쿠폰관리의 운영 시나리오 보강) | M | FE+BE |
| **E. 이미지 헬스 리포트 + 일괄 재수집** | 깨진/누락 imageUrl을 엔티티 횡단 스캔해 한 화면에서 일괄 force-recrawl. `AdminDataGaps`를 이미지 축으로 확장. | M | FE+BE |
| **F. 게임 노출 순서/활성화 토글** | 홈 "최근 추가된 게임" 순서·노출 제어, 데이터 0건 비활성 게임 숨김(예: GirlsFrontline2). | S~M | FE+BE |
| **G. 전역 빠른 검색(Quick jump)** | 캐릭터/아이템/이벤트를 이름으로 가로질러 검색·점프. 어드민 QoL. | S | FE |

추천 우선: **B(미리보기, S)** · **A(재빌드 트리거 — SEO 연계)** · **C(audit log — 대시보드 실데이터와 1석2조)**.

---

## 5. 백엔드 커버리지 매트릭스 (be-audit, 부록)

`O`=있음 `-`=없음 `△`=부분

| 엔티티 | list | get | create | update | delete | image |
|---|---|---|---|---|---|---|
| Item | O | O | O | O | O | O |
| Event | O | -¹ | O | O | O | -² |
| User | O | O | - | △³ | - | n/a |
| Game | O | -⁴ | - | △⁵ | - | O |
| Element/Type | O | - | - | △⁶ | - | O |
| Character | O | O⁷ | - | - | - | - |
| Redeem/쿠폰 | - | - | - | - | - | - |

¹공개 detail 존재 ²URL만 ³role/status만 ⁴공개 `/game/:slug` ⁵rarity만 ⁶displayName/color만 ⁷공개 `/character/admin/:id`

**백엔드 갭(우선순위)**: G1 쿠폰 CRUD(L) · G2 캐릭터 CRUD(M~L) · G3 게임 생성/삭제(M) · G4 Element 생성/삭제(S~M) · G5 이벤트 이미지 업로드(S, 선택) · G6 유저 확장(S, 낮음).
**공통 주의**: 위 갭 전부 **테이블 존재 → 마이그레이션 불필요**. unique 제약은 Item처럼 **P2002→409** 복제. 이미지 업로드는 `multer→sharp webp→static→?v=ts` 패턴 통일. 공개 라우터 5분 인메모리 캐시 → 어드민 쓰기 후 공개 반영 최대 5분 지연.

---

## 6. 권장 로드맵 (단계)

**Phase 0 — 즉효 수정 (프론트만, S)**  ※기존 기능이 "안 되는" 것부터, 백엔드 무의존
- **M1** 이벤트 목록 갱신 watcher 이식(아이템 패턴)
- **dead-end 3건** 라우팅 + 메뉴 라벨/링크 정정(`/admin/stats`에 기존 위젯 통합, 거짓 라벨/죽은 링크 제거)
- **M3** 사이드바 collapse 마진(mainMargin derived 사용)
- **Low 묶음**: alert→toast, 죽은 CSS/미사용 import, 깨진 대시보드 import 텍스트(93~95), AdminHeadMenu 하드코딩
- **H1/H2 stopgap**: 백엔드 create/update가 없으므로, 동작 안 하는 **게임·캐릭터 "추가"/캐릭터 "편집·삭제" 버튼은 숨김/비활성**(dead-end 제거). 풀 기능은 Phase 2.

**Phase 0.5 — (선택) H1/H2 풀 동작**: 게임·캐릭터 CRUD 백엔드(G2·G3) + 모달 UI. 양 repo. → 실질적으로 Phase 2와 합류.

**Phase 1 — 신뢰도/완결 (S~M)**
- 컨텐츠 승인(이벤트) 배선 — `AdminPendingData` → `/admin/event/pending·approve·reject` (백엔드 이미 있음)
- 대시보드 실데이터화 + **C. 변경 이력(audit log)** API(활동로그 겸용)
- **B. 공개 페이지 미리보기**(S)
- M2 캐릭터 상태표시 정정

**Phase 2 — 기능 확장 (M~L, 양 repo)**
- **쿠폰 수동 관리**(G1) + **D. 쿠폰 만료 알림**
- **캐릭터 CRUD**(G2, Item 패턴 미러링)
- **A. 크롤 후 재빌드/배포 트리거 + sitemap ping**(SEO 연계)
- **E. 이미지 헬스 리포트**

**Phase 3 — 차후**
- 공지/FAQ, 이미지 라이브러리, 팀빌드 추천, 설정/배치, F 게임 노출제어, G 전역검색

---

### 참고 경로
- 프론트: `src/routes/admin/[slug]/+page.svelte`(switch), `src/app/view/menu/AdminSideBarMenu.svelte`(메뉴), `src/app/view/modal/DesktopModal.svelte`(모달 registry), `src/app/view/admin/**`, `src/app/view/admin/crawler/AdminPendingData.svelte`(스텁).
- 백엔드: `src/routes/admin/{router,AdminController,CrawlerController,SystemStatsController,UserManagementController}.ts`, `prisma/schema.prisma`.
