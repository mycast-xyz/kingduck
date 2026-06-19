# 기획안 — 새 게임 "이환(異環 / Neverness to Everness, NTE)" 추가

> 작성일: 2026-06-19
> 요청: 게임 "이환"을 플랫폼에 추가하는 기획.

---

## 0. 게임 식별
- **이환(異環)** = *Neverness to Everness (NTE)*. 개발: Hotta Studio(퍼펙트 월드 자회사). UE5 오픈월드 액션 RPG.
- 출시: **2026-04-29 글로벌**(PC/PS5/모바일). 초자연 어반 오픈월드, 도시 "헤테로", 조직 "에이본".
- 공식: `nte.perfectworld.com/kr`. Google Play: `com.hottagames.nte`.
- **slug 후보**: `nte` (영문 약칭, URL/파일 일관성 ↑). 표시명: "이환".

## 1. 데이터 소스 — everness.info GraphQL + 공식 홈페이지 (확정·실측)
> 이 두 사이트만 사용한다(namu/fandom/커뮤니티 등 외부 소스는 쓰지 않음).

### 1-A. 주 소스 = everness.info **GraphQL API** (스파이크 완료 — 렌더 불필요!)
- **엔드포인트: `POST https://everness.info/api/graphql`** (Apollo). `/ko/characters`는 **404**였고, 실제 데이터는 GraphQL로 온다.
- **한국어: 헤더 `Accept-Language: ko`** 를 보내면 이름이 한국어("사키리"). 없으면 영어("Sakiri"). (니케 이벤트와 동일 발상 — 직접 HTTP, 인증 불필요.)
- **캐릭터(이능력자) 목록 쿼리** (operationName `GetEspers`):
  ```graphql
  query { espers { id name element rarity iconGacha arcs_tags { id name icon type_id } } }
  ```
  → `{data:{espers:[{id:"1003", name:"사키리", element:"Incantation", rarity:5, iconGacha:"/Game/UI/UI/Gacha/YH_lihui_character_zaowu", arcs_tags:{name:"기체",icon:"...",type_id:"4"}}, ...]}}` (현재 19명).
  - **element 값**: Incantation / Chaos / Cosmos … (NTE 속성). rarity: 정수(5 등).
  - **arcs_tags** = 무기/직업류 태그(name 한글 "기체").
- **상세(스킬/스탯 등)**: `/ko/espers/{id}` 라우트(예 1003). 상세도 GraphQL 쿼리가 있음 → 스파이크로 esper 상세 쿼리(스킬/모듈/돌파재료) 확정.
- **아크(무기)·모듈**: `/ko/arcs`, `/ko/modules` 라우트 + 대응 GraphQL 쿼리(GetArcs/GetModules 류) — 스파이크로 확정.
- **이미지 해석**: iconGacha `/Game/UI/UI/Gacha/X` → **`https://api.everness.info/data/assets/UI/Gacha/X.webp`** (접두 `/Game/UI/` 제거 → `data/assets/`. 200 확인). `ImageDownloader`로 static 저장.

### 1-B. 보조 소스 = 공식 홈페이지 `https://nte.perfectworld.com/kr`
- everness에 없는 공식 이미지/캐릭터 소개·로고·이벤트/공지 보완(필요 시).
- **기술 스택(실측)**: **Next.js App Router + RSC 스트리밍**(`self.__next_f.push(...)` 청크에 데이터). 일반 `__NEXT_DATA__`/SSR HTML이 아니라 **RSC 페이로드에 데이터가 인코딩**돼 있음.
- **추출 방식 스파이크(택1)**:
  1. **RSC 페이로드 파싱**: `self.__next_f` 청크를 모아 JSON 복원 → 캐릭터 목록/상세. (가장 가벼움, 단 포맷 파싱 필요.)
  2. **내부 API 발굴**: Next.js App Router가 fetch하는 데이터 엔드포인트(`/api/*` 또는 `/_next/data/*`) 확인 → 직접 호출(가능하면 최우선, 가장 안정적).
  3. **헤드리스 렌더 + DOM 추출**(puppeteer): 1·2가 어려우면 폴백(blablalink 방식).
- **확보 필드**: 이름, 희귀도, **속성(element)**, **무기/클래스**, 스킬, 캐릭터 이미지(아이콘/스플래시), 속성·무기 **아이콘 URL**, originalId(everness 캐릭터 슬러그/id).

## 2. 프론트(이 저장소) — "새 게임 추가" 체크리스트 (doc/ARCHITECTURE.md 3.3)
1. **`src/app/model/game/NteInit.ts`** 생성 — `GameInitConfig` 형태 `init()` 반환. 기존 Init(ZzzInit/HonkaiStarRailInit) 템플릿 참고:
   - 필터 `type`(속성/무기·클래스), `rarity`(희귀도 — 색상/이미지), `list`(카드), `content`(상세 main image), `layout`(상세 섹션: 프로필/스킬 등).
   - 속성/무기 필터는 **DB Element + attrIcons** 기반(아이콘은 크롤 적재).
2. **라우트 slug 등록**: `routes/list/[slug]`, `routes/content/[gameEnName]/[characterId]`, `routes/calendar/[slug]`, `routes/tier-list/[slug]` 등 `+page.ts` slug switch + `GameRegistry`에 `nte` 추가.
3. **게임 전용 metadata 타입**: `api.ts`에 `NteCharacterMetaType` 추가 후 `CharacterType<NteMeta>`.
4. **캘린더 색상**: `model/calendar/CalendarConfig.ts`에 nte 색상 매핑.
5. 상세 레이아웃: 공통 컴포넌트 재사용(ProfileView/SkillTreeView 등). 전용 표시 필요하면 `NteProfileView` 추가(NikkeProfileView 패턴).

## 3. 백엔드(kingduck-server)
1. **`Game` 행**: slug `nte`, 표시명 "이환", 아이콘(로고).
2. **`src/crawlers/scrapers/nte/CharacterScraper.ts`** (GraphQL, 니케 이벤트 스크래퍼처럼 직접 `axios.post`):
   - `POST everness.info/api/graphql` + `Accept-Language: ko` 로 `GetEspers` 쿼리 → espers 목록.
   - 각 esper의 `/ko/espers/{id}` 상세 쿼리로 스킬/스탯 등 보강(상세 쿼리는 스파이크로 확정).
   - `ScrapedData`: name(ko), rarity, imageUrl(iconGacha→`api.everness.info/data/assets/...webp` 다운로드), metadata{originalId=id, element, arcsTag, skills, ...}. → `DataSyncService.syncCharacters('nte', data)`.
3. **속성/무기 Element + 아이콘**: `element`(Incantation/Chaos/…) → Element(DamageType), arcs_tags → Element(Path/무기류). 아이콘은 `metadata.elementIconUrl`/`pathIconUrl`로 공급(arcs_tags.icon / element 아이콘도 GraphQL/CDN에서) → DataSyncService가 Element.iconUrl 적재(이미 구축된 패턴).
4. **스케줄러 `nte/character` 태스크** 등록.
5. (후속) 이벤트/추천: 캘린더·공지(공식 홈페이지), 추천(everness에 있으면)도 다른 게임 패턴으로.
6. **데이터 공백 추적**: 이미 구축됨 — `GAMES_WITH_SKILLS` 등에 nte 추가 시 자동 적용.

## 4. 단계 / 검증
1. 소스 스파이크 → 캐릭터 구조화 데이터 확보 방식 확정.
2. 백엔드: Game 행 + CharacterScraper + 스케줄러 → 크롤 → DB 적재.
3. 프론트: NteInit + 라우트 등록 → `/list/nte` 카드, `/content/nte/<id>` 상세 표시.
4. 속성/무기 필터 아이콘 크롤 적재(0→채움 검증).
5. tsc/check 0, 리스트·상세 스크린샷 검증. 전부 서버 재현.

## 5. 주의/리스크
- **추출 방식은 해결됨**: everness.info GraphQL(`/api/graphql`, `Accept-Language: ko`) 직접 POST로 한국어 데이터 확보(렌더 불필요). 남은 스파이크는 **esper 상세/아크/모듈 쿼리 필드**뿐. everness에 없는 항목만 공식 홈페이지로 보완.
- GraphQL 스키마 변경 취약 → 방어적. 이미지 경로 접두(`/Game/UI/`) 규칙 변동 주의.
- 속성/무기 체계가 기존 게임과 다를 수 있음 → Element type 매핑 새로 정의.
- 전부 크롤러 코드(서버 재현), 게임 분기 하드코딩 최소화(Init 설정/레이아웃으로).

---

### 요약
> 이환(NTE)은 2026-04 출시 신생 오픈월드 RPG. 추가 자체는 **확립된 "새 게임 추가" 패턴**(NteInit + 라우트 slug + 백엔드 Game/CharacterScraper/스케줄러)으로 가능.
> **데이터 소스 확정**: everness.info **GraphQL**(`/api/graphql` + `Accept-Language: ko`, 직접 POST·렌더 불필요)로 한국어 이능력자/아크/모듈 데이터, 공식 홈페이지는 보조. 이미지는 `api.everness.info/data/assets/`. `GetEspers` 쿼리·이미지 해석까지 실측 완료 — 남은 건 상세/아크/모듈 쿼리 필드 스파이크. 이후 NteInit + 라우트 + 백엔드 GraphQL 스크래퍼 + 속성·무기 아이콘·데이터 공백 추적(기존 인프라 재사용).

### 데이터 소스 (이 두 곳만)
- **주: [everness.info/ko](https://everness.info/ko)** (Next.js App Router, RSC 스트리밍) — 캐릭터 데이터
- **보조: [공식 홈페이지](https://nte.perfectworld.com/kr/index.html)** — 공식 이미지/소개/공지 보완
