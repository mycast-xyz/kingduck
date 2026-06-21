# 기획안 — 새 게임 "브라운더스트2(BrownDust II)" 추가

> 작성일: 2026-06-21
> 요청: 브라운더스트2를 플랫폼에 추가하는 기획.

---

## 0. 게임 식별

- **브라운더스트2** (*BrownDust II*). 개발·서비스: 네오위즈(Neowiz). 2D 다크 판타지 **턴제 전략 RPG**.
- 출시: 2022년 11월 한국 선출시, 이후 글로벌. Google Play: `com.neowiz.android.browndust2`.
- 공식: `browndust2.neowiz.com`.
- **기존 게임과의 차별점**:
  - 3D 액션(원신/명조/이환) · 실시간(니케)과 달리 **순수 2D 픽셀 아트 + 턴제 전략**. 전투 배치 퍼즐 요소 강함.
  - **코스튬이 핵심 수익 모델** — 캐릭터 1인당 코스튬 수가 타 게임 대비 압도적으로 많음. `CostumeView`가 가장 중요한 레이아웃 섹션.
  - 캐릭터 명칭이 "용병(Mercenary)" — 속성 필터 축이 원소·무기 2축이 아닌 **속성(Element) + 직업(Class)** 2축.
  - **쿠폰(리딤코드) 시스템 있음** — `coupon/[slug]` 라우트 포함 필요.
- **slug 결정**: `browndust2` (아래 §1 참조).

---

## 1. Slug 결정

| 후보 | 판단 |
|------|------|
| `browndust2` | **채택.** 공식 영문 명칭 BrownDust2와 1:1 대응. 기존 `bluearchive`·`wutheringwaves` 패턴(소문자 연속 문자열)과 일관성. |
| `bd2` | 탈락. 약칭은 검색 인덱싱에 취약하고 다른 게임과 혼동 가능. |
| `BrownDust2` | 탈락. 대소문자 혼용 — DB slug는 항상 소문자. |

**주의(slug 불일치 함정)**: 과거 스타레일처럼 백엔드 `Game.slug`가 `BrownDust2`(대소문자 혼용)나 `browndust-2`(하이픈)로 적재되면 레지스트리가 매칭되지 않는다. 백엔드 Game 행 삽입 시 `browndust2`(소문자, 하이픈 없음)로 반드시 통일. 만약 별칭이 필요하면 `GameRegistry.ts`의 `SLUG_ALIASES`에 `BrownDust2: 'browndust2'` 추가.

---

## 2. 게임 개요 — 도메인 특성

| 항목 | 내용 |
|------|------|
| 캐릭터 명칭 | 용병(Mercenary) |
| 속성(Element) | 화염·냉기·전격·빛·어둠 (5종 — 스파이크로 영문 key 확정 필요) |
| 직업(Class) | 전사·궁수·마법사·사제·격투가 (5종 — 스파이크로 확정 필요) |
| 희귀도 | SSR / SR / R / N (4단계) |
| 코스튬 | 캐릭터당 다수. 가챠·이벤트 보상·판매 혼재. |
| 쿠폰(리딤) | 있음 |
| 이벤트/캘린더 | 정기 이벤트·가챠 배너 있음 |
| 추천 빌드 | 조합 추천(파티) 가능하나 장비 시스템이 단순 → 초기엔 TeamRecommendationView 생략 가능 |

---

## 3. 프론트엔드 작업 목록

### 3-1. `BrownDust2Init.ts` 설계

`src/app/model/game/BrownDust2Init.ts` 신규 작성. `GameInitConfig` 계약 준수.

**필터(type) 설계** — nikke의 clientFilter 패턴 참고:

| 필터 키 | `name` | `apiPoint` | `apiType` | `clientFilter` | 비고 |
|--------|--------|------------|-----------|----------------|------|
| `elementType` | 속성 | `elementId` | `DamageType` | — | DB Element 기반. 속성 아이콘 크롤 적재 필요. |
| `classType` | 직업 | `class` | — | `true` | metadata.class 클라이언트 필터. Element DB 미사용. |

**희귀도(rarity) 설계** — nikke 패턴(type: `'string'`):

```
'4': 'SSR'
'3': 'SR'
'2': 'R'
'1': 'N'
```

`default: false` (숫자 표시 대신 레이블 표시).

**카드(card) 색상**:

| 등급 | border/background | gradient from→to |
|------|-------------------|-----------------|
| SSR(4) | `#fcba49` (금) | `#885550` → `#c9a36a` |
| SR(3) | `#9f66c8` (보라) | `#343659` → `#8a5fcc` |
| R(2) | `#4175bb` (파랑) | `#303051` → `#4175bb` |
| N(1) | `#6b7280` (회색) | `#1f2937` → `#6b7280` |

nikke·리버스1999의 등급 색상 팔레트 재사용. 스파이크 후 BD2 테마에 맞게 조정.

**레이아웃(layout) 설계** — 코스튬 비중 최우선:

```
[
  { component: 'CostumeView',            dataKey: 'costumes',  props: { title: '코스튬' } },
  { component: 'BrownDust2ProfileView',  dataKey: 'metadata',  props: { title: '캐릭터 정보' } },
  { component: 'SkillTreeView',          dataKey: 'skills',    props: { title: '스킬' } },
  { component: 'StoryView',              dataKey: 'stories',   props: { title: '캐릭터 스토리' } }
]
```

`BrownDust2ProfileView` 전용 뷰 필요 여부: 직업·속성·기본 스탯 표시에 BD2 전용 UI가 필요하면 `NikkeProfileView` 패턴으로 추가. 초기엔 `ProfileView`(기본)로 시작해 후속 교체 가능.

**쿠폰**:
```
coupon: { name: '리딤코드' }
```

### 3-2. 게임 전용 metadata 타입

`src/app/model/api/api.ts` 하단 또는 `src/app/model/game/metadata/` (기존 관행 참고):

```ts
export interface BrownDust2CharacterMetaType {
  originalId: string;          // 외부 소스 ID
  element: string;             // 'Fire' | 'Ice' | 'Thunder' | 'Light' | 'Dark' (스파이크 확정)
  jobClass: string;            // 'Warrior' | 'Archer' | 'Mage' | 'Priest' | 'Fighter'
  isLimited: boolean;          // 한정 여부
  costumes?: {
    id: string;
    name: string;
    imageUrl: string;
    type: 'default' | 'event' | 'gacha' | 'paid';
  }[];
  skills?: unknown;            // 스킬 구조는 소스 스파이크 후 확정
  stats?: Record<string, number>;  // 기본 스탯
  story?: string;              // 캐릭터 스토리 텍스트
}
```

사용: `CharacterType<BrownDust2CharacterMetaType>`.

`api.ts` 코드 주석 76번 줄 패턴에 따라 별도 파일에 정의 후 참조.

### 3-3. 라우트 등록 위치

**기존 GameRegistry 중앙화 덕분에 단 한 곳만 수정**:
`src/app/model/game/GameRegistry.ts`의 `GAME_INIT_FACTORIES`에 추가:

```ts
browndust2: () => new BrownDust2Init().setInit()
```

이 한 줄이 `list/[slug]`, `content/[gameEnName]/[characterId]`, `calendar/[slug]`, `tier-list/[slug]`, `coupon/[slug]` 전체 라우트를 커버한다.

추가로 필요한 파일 수정:
- `GameInitConfig.ts`의 `GameSlug` 유니온에 `'browndust2'` 추가.
- `GameInitConfig.ts`의 `ComponentLayout.component`에 `'BrownDust2ProfileView'` 추가 (전용 뷰 사용 시).

### 3-4. 캘린더 색상

`src/app/model/calendar/CalendarConfig.ts`의 `GAME_CONFIG`에 추가:

```ts
browndust2: { color: 'bg-[#C04B4B]' }
```

BD2 다크 판타지 테마(붉은 계열). 실제 브랜드 색상 확인 후 조정.

### 3-5. 아이콘·이미지 자원

- 게임 로고/아이콘: 공식 사이트 또는 공식 SNS에서 수급.
- 속성 아이콘(elementType): 크롤러가 원본 소스에서 다운로드 → DB Element.iconUrl 적재. 기존 인프라 재사용.
- 직업(classType)은 clientFilter라 Element DB에 저장하지 않음 — 목록 카드에 텍스트 뱃지로 표시.

---

## 4. 백엔드(kingduck-server) 필요사항

### 4-1. 데이터 소스 후보

> **BD2는 SchaleDB·everness.info 같은 공개 JSON API가 현재 확인되지 않는다.** 소스 스파이크가 필수.

| 소스 | 기술 스택 | 특이사항 |
|------|-----------|---------|
| 공식 사이트 `browndust2.neowiz.com` | 정적 HTML 또는 Next.js | 캐릭터 상세·코스튬 이미지 공식 경로 확인 가능 |
| 공식 게임 내 API | 미확인 | 게임 클라이언트 패킷 분석 필요(회색 영역, 권장하지 않음) |
| 팬덤 위키 `browndust2.fandom.com` | MediaWiki | 구조적 데이터 API(`api.php?action=query`) 있음. HTML 파싱보다 안정적. |
| 나무위키 | MediaWiki | ko 한국어 정보 풍부하나 라이선스·구조 변동 위험 |
| 공식 Discord 공지 | — | 신규 캐릭터·이벤트 알림 확인용 (크롤 불가, 수동 참고) |

**권장 스파이크 순서**:
1. 공식 사이트 내부 API/JSON 엔드포인트 발굴 (Next.js RSC 패턴 가능 — everness.info와 동일 분석 방법).
2. 없으면 팬덤 위키 API `browndust2.fandom.com/api.php` — MediaWiki API는 인증 불필요, 구조 데이터 추출 가능.
3. 그것도 불충분하면 Chromium(puppeteer) 렌더 기반 DOM 추출 — 부하 높음, 최후 수단.

### 4-2. 백엔드 작업

1. **`Game` 행 삽입**: slug `browndust2`, 표시명 "브라운더스트2", 로고.
   - 기존 테이블(`Game`, `Character`, `Item`, `Event`, `Redeem`) 구조 재사용 — 마이그레이션 불필요.
   - 단 `Element` 시드(속성·아이콘) 삽입은 필요.
2. **`Element` 시드**: 속성(DamageType) 5종 + 아이콘 URL. 직업(classType)은 Element DB 저장 안 함(clientFilter).
3. **`src/crawlers/scrapers/browndust2/CharacterScraper.ts`**:
   - 소스 스파이크 완료 후 구현 방법 확정.
   - `ScrapedData`: name, rarity(SSR→4/SR→3/R→2/N→1), imageUrl(캐릭터 메인 이미지), metadata{originalId, element, jobClass, isLimited, costumes, skills, stats, story} → `DataSyncService.syncCharacters('browndust2', data)`.
4. **`src/crawlers/scrapers/browndust2/CostumeScraper.ts`** (필요 시 별도):
   - 코스튬 이미지가 매우 많음(수백 장) → 이미지 다운로드 전략 선행 수립 필요(용량·CDN 비용).
   - 캐릭터 metadata.costumes 배열로 적재할지, 별도 Item 테이블 행으로 적재할지 결정 필요.
5. **이벤트·쿠폰 크롤러**: `EventScraper`, `RedeemScraper` — 캘린더·쿠폰 라우트 활성화 시 추가.
6. **스케줄러**: `browndust2/character` 태스크(+ 후속 event/redeem) 등록.
7. **Chromium 의존 여부**: 소스 스파이크 결과에 따라 결정. 공식 사이트가 Next.js RSC면 `self.__next_f` 청크 파싱(이환 방식) 또는 내부 API 직접 fetch. 팬덤 위키 API 사용 시 Chromium 불필요.

---

## 5. 단계적 로드맵

| 단계 | 내용 | 완료 기준 |
|------|------|----------|
| **Phase 0** — 빈 껍데기 등록 | `BrownDust2Init.ts` 작성, `GameRegistry`·`GameInitConfig`·`CalendarConfig` 등록. 백엔드 Game 행 삽입(캐릭터 0건). | `/list/browndust2` 접속 시 빈 캐릭터 목록 + 게임명 표시. `pnpm run check` 0 에러. |
| **Phase 1** — 소스 스파이크 + 기본 크롤 | 데이터 소스 확정, CharacterScraper 구현, 캐릭터 목록 크롤·적재. 속성 Element 시드. | `/list/browndust2` 카드 표시, 속성 필터 동작. |
| **Phase 2** — 상세 + 코스튬 | 캐릭터 상세(`/content/browndust2/<id>`) — CostumeView, SkillTreeView, StoryView. 이미지 다운로드 전략 실행. | 상세 페이지 코스튬 갤러리 표시, 스킬 표시. |
| **Phase 3** — 캘린더·쿠폰 | EventScraper + RedeemScraper. 캘린더 색상 적용. | `/calendar/browndust2`, `/coupon/browndust2` 동작. |
| **Phase 4** — 전용 UI·최적화 | `BrownDust2ProfileView` 전용 뷰(필요 시), 티어리스트 활성화, 추천 조합(후속). | 스크린샷 검증, 서버 재현. |

---

## 6. 리스크·주의

| 리스크 | 내용 | 대응 |
|--------|------|------|
| **데이터 소스 미확정** | SchaleDB·everness.info 같은 공개 구조화 API 없음. 팬덤 위키 또는 공식 사이트 역공학 필요. | Phase 1 전 스파이크를 독립 태스크로 분리. 결과에 따라 크롤러 방식 결정. |
| **코스튬 이미지 용량** | 캐릭터당 코스튬 수십 종, 전체 수백~수천 장 예상. 무제한 다운로드 시 스토리지·CDN 부담. | 초기엔 기본 코스튬(default)만 적재, 나머지는 on-demand 또는 lazy 크롤 전략 수립. |
| **slug 불일치** | 백엔드 DB에 `BrownDust2`(대문자)·`browndust-2`(하이픈)로 적재 시 레지스트리 미매칭. | 삽입 SQL/시드 스크립트 검수 필수. `SLUG_ALIASES` 예비 등록 검토. |
| **직업(clientFilter) 키 불일치** | CharacterScraper가 적재하는 `metadata.class` 값과 Init `classType.list`의 키가 달라지면 필터 동작 안 함. | 스파이크 단계에서 소스 영문 key 확정 → Init list 키와 1:1 맞춤. |
| **속성·직업 체계 변동** | 향후 BD2 업데이트로 속성·직업 추가 가능. | `elementType.list` / `classType.list`를 Init에서만 관리하므로 수정 한 곳. |
| **Chromium 필요 시** | 공식 사이트 렌더 기반 스크래핑 → CI 빌드 서버·홈서버 Docker에 Chromium 추가 부하. | 팬덤 위키 API 직접 fetch로 우회 우선. |

---

### 요약

> 브라운더스트2는 네오위즈의 2D 턴제 전략 RPG. **코스튬이 핵심 수익 모델**이라 `CostumeView`가 가장 중요한 레이아웃 섹션. 필터 축은 **속성(DamageType, Element DB) + 직업(clientFilter)** 2축.
> 프론트는 `BrownDust2Init.ts` + `GameRegistry` 한 줄 등록으로 전 라우트 커버 (리팩터링 완료 덕분에 slug switch 중복 없음).
> **관건은 데이터 소스 스파이크** — 공개 JSON API가 없어 공식 사이트 내부 API 발굴(NTE 방식) 또는 팬덤 위키 MediaWiki API 사용을 우선 검토해야 하며, 코스튬 이미지 용량 전략과 slug 소문자 통일도 주의 사항.

### 데이터 소스 후보 (우선순위)

1. **공식 사이트** `browndust2.neowiz.com` — 내부 API/RSC 엔드포인트 스파이크(렌더 불필요 가능성).
2. **팬덤 위키** `browndust2.fandom.com/api.php` — MediaWiki API (렌더 불필요, 인증 불필요).
3. **Chromium 렌더 스크래핑** — 1·2 실패 시 최후 수단.
