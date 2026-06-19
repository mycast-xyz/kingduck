# 기획안 — 새 게임 "블루 아카이브(Blue Archive)" 추가

> 작성일: 2026-06-19
> 요청: 이환 다음 추가 게임. 추천 1순위(소스 최상). 기획.

---

## 0. 게임 식별
- **블루 아카이브** (Blue Archive, ブルーアーカイブ). 개발 넥슨게임즈, 서비스 넥슨/Yostar. 서브컬처 수집형 RPG(학생=캐릭터). 한국 가챠 시장 최상위 인기.
- **slug 후보**: `bluearchive` (또는 `ba`). 표시명: "블루 아카이브".

## 1. 데이터 소스 — SchaleDB (확정·실측, 공개 JSON)
> 단일 공개 JSON + 이미지 CDN. 렌더·인증 불필요 — 이 중 가장 깔끔한 소스.
- **학생(캐릭터): `https://schaledb.com/data/kr/students.min.json`** (200, ~1.6MB, **264명, 한국어**).
  - 주요 필드(실측): `Id`(originalId), `Name`("아루"), `StarGrade`(희귀도 1~3★), `School`(게헨나 등), `Club`,
    `BulletType`(공격속성: Explosion/Pierce/Mystic/Sonic), `ArmorType`(방어속성: LightArmor/HeavyArmor/SpecialArmor/Elastic),
    `TacticRole`(역할: DamageDealer/Tanker/Healer/Supporter…), `SquadType`(Main/Support), `WeaponType`(SR 등), `Position`,
    `Skills`, 스탯(AttackPower100/MaxHP100/…), 프로필(FamilyName/PersonalName/CharacterAge/Birthday/CharacterVoice/Illustrator/ProfileIntroduction), `Equipment`, `IsLimited`, `IsReleased`.
- **이미지 CDN**(전부 200): `schaledb.com/images/student/portrait/{Id}.webp`(전신), `…/collection/{Id}.webp`(카드), `…/icon/{Id}.webp`(아이콘).
- **기타 데이터(200)**: `data/kr/equipment.min.json`(장비), `data/kr/raids.min.json`(총력전/대결전 — 캘린더), `data/kr/localization.min.json`(속성/역할 등 enum 한글명), `data/config.min.json`(아이콘/리소스 매핑).
- 속성/역할 **아이콘**: schaledb `images/ui/…` 또는 config.min.json의 타입 아이콘 경로 — 스파이크로 확정(필터 아이콘 크롤 적재).

## 2. 프론트 — "새 게임 추가" 체크리스트 (doc/ARCHITECTURE.md 3.3)
1. **`src/app/model/game/BlueArchiveInit.ts`**(`GameInitConfig`) — 기존 Init 템플릿 참고:
   - 필터 `type`: **공격속성(BulletType)** + **방어속성(ArmorType)** + **역할(TacticRole)** + **학교(School)**(BA 특유 4축). `rarity`: 1~3★.
   - `list`(카드: collection 이미지), `content`(상세 main: portrait), `layout`(프로필/스킬/스탯).
2. **라우트 slug 등록**: `list/[slug]`, `content/[gameEnName]/[characterId]`, `calendar/[slug]`, `tier-list/[slug]` 등 `+page.ts` switch + `GameRegistry`에 `bluearchive`.
3. **metadata 타입**: `api.ts`에 `BlueArchiveCharacterMetaType`.
4. **캘린더 색상**: `CalendarConfig.ts`에 추가.
5. 상세: 공통 컴포넌트 재사용. BA 전용 표시(공격/방어/역할/학교 배지) 필요하면 `BlueArchiveProfileView`(NikkeProfileView 패턴).

## 3. 백엔드(kingduck-server)
1. **`Game` 행**: slug `bluearchive`, 표시명 "블루 아카이브", 로고.
2. **`src/crawlers/scrapers/bluearchive/CharacterScraper.ts`** (직접 fetch, 렌더 불필요):
   - `students.min.json` 받아 IsReleased 학생 → `ScrapedData`: name, rarity=StarGrade, imageUrl=collection 다운로드, metadata{originalId=Id, bulletType, armorType, role, school, club, skills, stats, profile, portraitUrl, iconUrl}. → `syncCharacters('bluearchive', data)`.
   - localization.min.json으로 속성/역할 enum → 한글명(Element displayName) 매핑.
3. **속성/역할 Element + 아이콘**: BulletType→Element(예 type 'BulletType'), ArmorType→'ArmorType', TacticRole→'TacticRole', School→'School'. 아이콘은 `metadata.*IconUrl`로 공급 → DataSyncService가 Element.iconUrl 적재(기존 패턴). (필터가 4축이라 Element type 다축 — 기존 DamageType/Path 2축 관행 확장 검토.)
4. **장비(아이템)**: equipment.min.json → syncItems(선택, 후속).
5. **이벤트/총력전(캘린더)**: raids.min.json → CalendarEvent(후속).
6. **스케줄러 `bluearchive/character`**(+후속 item/event) 태스크.
7. **데이터 공백 추적**: `GAMES_WITH_SKILLS`에 'bluearchive' 추가 시 자동.

## 4. 단계 / 검증
1. 스파이크: students 필드·localization enum 한글명·속성/역할 아이콘 경로 확정.
2. 백엔드 Game 행 + CharacterScraper + 스케줄러 → 크롤 → DB 적재.
3. 프론트 BlueArchiveInit + 라우트 → `/list/bluearchive` 카드, `/content/bluearchive/<id>` 상세.
4. 속성/방어/역할/학교 필터 아이콘 크롤 적재(0→채움 검증).
5. tsc/check 0, 스크린샷 검증. 전부 서버 재현.

## 5. 주의/리스크
- **필터 4축**(공격/방어/역할/학교)이 기존 게임(속성/무기 2축)보다 많음 → Element type 다축 + 필터 UI 확인. ListFilterMenu가 N축을 받는지 점검.
- BA는 무기 아이템 개념이 약함(학생=고정무기+장비). "추천 무기" 대신 **추천 장비/티어**는 schaledb엔 없으니 추천 섹션은 생략 또는 별도 소스(후속).
- StarGrade 1~3 → rarity 색상/이미지 매핑(어드민 등급 에디터 재사용).
- 전부 크롤러 코드(서버 재현). schaledb JSON 스키마 변경 취약 → 방어적.

---

### 요약
> 블루 아카이브는 **SchaleDB 공개 JSON**(`data/kr/students.min.json`, 264명 한국어) + 이미지 CDN으로 **렌더 없이 직접 fetch** 가능 — 가장 깔끔.
> 백엔드 CharacterScraper(직접 fetch)+스케줄러, 프론트 BlueArchiveInit(공격/방어/역할/학교 4축 필터)+라우트, 속성 아이콘·데이터 공백 추적 기존 인프라 재사용.
> 관건은 4축 필터 UI 수용 + 속성/역할 아이콘 경로 스파이크. (장비/총력전 캘린더는 후속.)

### 소스 (이 곳만)
- 데이터/이미지: [SchaleDB](https://schaledb.com) — `data/kr/students.min.json`, `images/student/{portrait|collection|icon}/{Id}.webp`, equipment/raids/localization/config.
