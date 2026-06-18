# 기획안 — 새 게임 "이환(異環 / Neverness to Everness, NTE)" 추가

> 작성일: 2026-06-19
> 요청: 게임 "이환"을 플랫폼에 추가하는 기획.

---

## 0. 게임 식별
- **이환(異環)** = *Neverness to Everness (NTE)*. 개발: Hotta Studio(퍼펙트 월드 자회사). UE5 오픈월드 액션 RPG.
- 출시: **2026-04-29 글로벌**(PC/PS5/모바일). 초자연 어반 오픈월드, 도시 "헤테로", 조직 "에이본".
- 공식: `nte.perfectworld.com/kr`. 위키: namu.wiki/이환, ko.wikipedia. 커뮤니티: arca.live/b/nevernesstoeverness, dcinside. 유튜브: `@NTE_KO`. Google Play: `com.hottagames.nte`.
- **slug 후보**: `nte` (영문 약칭, URL/파일 일관성 ↑). 표시명: "이환".

## 1. 데이터 소스 — everness.info/ko (확정)
- **소스: `https://everness.info/ko`** (이환 전용 한글 DB). 캐릭터 목록 `/ko/characters`, 상세 `/ko/character/<slug>`(추정) 200.
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
2. **`src/crawlers/scrapers/nte/CharacterScraper.ts`**: 1의 소스에서 캐릭터 목록+상세 → `ScrapedData`(name/rarity/imageUrl/metadata{originalId, element, weapon, skills, ...}). `DataSyncService.syncCharacters('nte', data)`.
3. **속성/무기 Element + 아이콘**: 소스 아이콘을 `metadata.elementIconUrl`/`pathIconUrl`로 공급 → DataSyncService가 Element.iconUrl 적재(이미 구축된 패턴). 필터 아이콘 크롤 소스화.
4. **스케줄러 `nte/character` 태스크** 등록.
5. (후속) 이벤트/추천/영상: 캘린더(공식), 추천(있으면), 영상(@NTE_KO 유튜브)도 다른 게임 패턴으로.
6. **데이터 공백 추적**: 이미 구축됨 — `GAMES_WITH_SKILLS` 등에 nte 추가 시 자동 적용.

## 4. 단계 / 검증
1. 소스 스파이크 → 캐릭터 구조화 데이터 확보 방식 확정.
2. 백엔드: Game 행 + CharacterScraper + 스케줄러 → 크롤 → DB 적재.
3. 프론트: NteInit + 라우트 등록 → `/list/nte` 카드, `/content/nte/<id>` 상세 표시.
4. 속성/무기 필터 아이콘 크롤 적재(0→채움 검증).
5. tsc/check 0, 리스트·상세 스크린샷 검증. 전부 서버 재현.

## 5. 주의/리스크
- **소스 부재 리스크**가 최대 변수 — 신생 게임이라 구조화 DB가 빈약할 수 있음. 공식 SPA 렌더 또는 namu.wiki 파싱이 현실적 폴백.
- 속성/무기 체계가 기존 게임과 다를 수 있음 → Element type 매핑 새로 정의.
- 전부 크롤러 코드(서버 재현), 게임 분기 하드코딩 최소화(Init 설정/레이아웃으로).

---

### 요약
> 이환(NTE)은 2026-04 출시 신생 오픈월드 RPG. 추가 자체는 **확립된 "새 게임 추가" 패턴**(NteInit + 라우트 slug + 백엔드 Game/CharacterScraper/스케줄러)으로 가능.
> **관건은 데이터 소스 스파이크** — 공식 사이트/전용 DB/namu.wiki 중 구조화 캐릭터 데이터를 가장 잘 주는 곳 선정. 이후 속성·무기 필터 아이콘·데이터 공백 추적 등 기존 인프라 그대로 재사용.

### 소스
- **데이터 크롤 소스: [everness.info/ko](https://everness.info/ko)** (Next.js App Router, RSC 스트리밍)
- [이환 - 나무위키](https://namu.wiki/w/%EC%9D%B4%ED%99%98) · [이환 공식](https://nte.perfectworld.com/kr/index.html) · [위키백과](https://ko.wikipedia.org/wiki/%EC%9D%B4%ED%99%98_(%EB%B9%84%EB%94%94%EC%98%A4_%EA%B2%8C%EC%9E%84))
