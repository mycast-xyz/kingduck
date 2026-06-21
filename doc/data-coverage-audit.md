# 기획안 — 사이트 내 데이터 노출 갭 감사 (Data Coverage Audit)

> 작성일: 2026-06-21
> 목적: 각 게임이 **백엔드 metadata에 이미 가진 데이터** vs **상세 페이지에 실제 노출(layout)되는 섹션**을 비교해,
> "데이터는 있는데 안 보여주는" 갭을 찾는다. (NTE를 2→9섹션으로 늘린 것과 동일한 발상의 전 게임 확대.)
> **대부분 프론트만 손대면 되는 값싼 추가** — 백엔드 재크롤 불필요(데이터가 이미 DB에 있음).

방법: `/api/v0/character/{slug}/list` → 샘플 캐릭터 `/{id}` 의 `metadata` 키(비어있지 않은 것) 집합과,
각 `…Init.ts`의 `layout[].dataKey` 집합을 비교.

---

## 갭 요약 (우선순위순)

| 게임 | 현재 섹션 수 | 안 보여주는 주요 데이터 | 추천 추가(재사용 컴포넌트) | 비고 |
|------|----------|----------------------|------------------------|------|
| **bluearchive** | **2** (프로필·스킬) | `stats`, `equipment`, `cv` | **StatsView**(stats), 장비 뷰(equipment), 프로필에 cv | 264캐릭터. NTE처럼 가장 빈약 → 최우선 |
| **nikke** | 3 (프로필·스킬·코스튬) | `stats`, `cv`, `lore` | **StatsView**(stats), 프로필 cv, **StoryView**(lore) | 192캐릭터 |
| **wutheringwaves** | 8 | `CharacterVoice`, `recommendedEchoes`, `recommendedSonata`, `Introduction` | **VoiceView**(CharacterVoice) | 음성 미노출 |
| **endfield** | 8 | `bestGifts`, `potentials`, `cvName` | **NteMaterialView**(bestGifts·평면), 프로필 cvName | bestGifts=선호 선물, NteMaterialView 재사용 가능 |
| **reverse1999** | 8 | `euphoria_info`, `lore`, `efficiency` + **costume 버그** | StoryView(lore) | **버그**: layout `CostumeView:costume`인데 metadata 키는 `skins` → 코스튬 섹션이 빈 채로 렌더(아래 §버그) |
| **zzz** | 6 | `recommendedStats` | (빌드 상세 — 선택) | 대체로 충실 |
| **genshin** | 8 | `fetter`, `talent`, `birthday`(프로필) | (선택) | 대체로 충실 |
| **starrail** | 11 | — | — | 레퍼런스(최다) |

---

## 버그 — reverse1999 코스튬 섹션 dataKey 불일치

`Reverse1999Init.ts` 레이아웃: `{ component: 'CostumeView', dataKey: 'costume' }`
그러나 백엔드 metadata 키는 **`skins`**. → `meta['costume']` = undefined → **코스튬 섹션이 항상 빈 채로 표시**.
**수정**: dataKey를 `'skins'`로 변경(1줄). 데이터는 이미 있음.

---

## 실측 검증 결과 (2026-06-21) — "키 존재 ≠ 사용 가능"

각 후보를 실제 데이터로 검증한 결과, 키는 있어도 **값이 비었거나 미해석**인 경우가 많았다:

| 항목 | 검증 | 상태 |
|------|------|------|
| **reverse1999 코스튬 dataKey** | `costume`→`skins` + CostumeView image/desc 관용화 | ✅ **수정 완료** |
| **bluearchive `stats`** (7키) / **nikke `stats`** (5키) | flat dict, StatsView fallback 일반화로 노출 | ✅ **완료** (재크롤 0) |
| **wuwa `CharacterVoice`** | **54캐릭 중 실데이터 0** (전부 "No Description Available" 플레이스홀더) | ❌ 데이터 부재 → 보류 |
| **endfield `bestGifts`** | shape `{iconId, nameI18nId, descI18nId, favorablePoint}` — **이름이 i18n ID(미해석)·아이콘도 ID** | ⚠️ 백엔드 i18n 해석+아이콘 필요(NTE 돌파와 동급) |
| **nikke `lore`** | 단일 **문자열**(스토리 단락) | △ ProfileView 설명 보강감(StoryView 부적합) |
| **reverse1999 `lore`** | **dict**(cv/age/birthday/fragrance…) = 프로필 필드 | △ ProfileView 보강감 |

**교훈**: 본 감사의 "available" 목록은 `metadata` 키 존재 기준이라 **플레이스홀더/미해석 값을 포함**한다.
실제 추가 전 항상 **값 실측**(전 캐릭 표본) 선행. 진짜 즉효 프론트 win은 위 ✅ 둘이었고, 나머지는
백엔드 해석(endfield) 또는 데이터 자체 부재(wuwa)였다.

## 권장 작업 (값싼 것부터)

### A. 즉시(프론트만, 데이터 이미 존재)
1. **reverse1999 코스튬 dataKey `costume`→`skins`** — 버그 수정 1줄.
2. **wutheringwaves 음성** — `VoiceView` 섹션 추가(`CharacterVoice`). 단 shape가 VoiceView 계약(`{title,text,krUrl…}`)과 다르면 매핑/VM 필요 → 확인 후.
3. **endfield 선호 선물** — `NteMaterialView`(평면) 재사용, `bestGifts`. shape 확인 후 매핑.
4. **bluearchive `stats`** / **nikke `stats`** — `StatsView` 섹션. StatsView는 게임별 VM 분기라 nte처럼 배열 fallback이 맞으면 즉시, 아니면 경량 VM 추가.

### B. 소규모 신규/매핑 필요
5. **bluearchive `equipment`** — 장비 표시. 기존 `EquipmentItemView` 재사용 가능성 검토.
6. **nikke `lore` / reverse1999 `lore` / endfield `profileRecord`** — `StoryView` 또는 프로필 보강.
7. **프로필 cv/cvName** — 각 *ProfileView에 성우 한 줄 추가.

> 주의: StatsView/VoiceView 등은 **게임별 ViewModel 분기**가 있다(`SkillTreeView`, `StatsView` 참고).
> 데이터 shape가 기존 VM과 안 맞으면 게임 전용 VM(`Nte…ViewModel` 패턴)을 추가해야 함 — 섹션마다 shape 실측 선행.

---

## 검증된 게임별 metadata(비어있지 않은 키) — 참고

- **genshin**: ascension, constellation, fetter, ranks_raw, recommendedArtifacts/Weapons, skills, stats, talent, teams …
- **starrail**: eidolons, lightcones, relics, skills(_raw/_tree), stats, stories, teams, voiceLines …(레퍼런스)
- **wutheringwaves**: CharacterVoice, Introduction, ResonantChain, Skills, SkillTree, Skins, Stories, recommendedEchoes/Sonata/Weapons, echoSets, Properties …
- **nikke**: class, costumes, cv, element, lore, skills, squad, **stats**
- **zzz**: driveDiscs, recommendedStats/WEngines, skills, talents, teams …
- **reverse1999**: builds, efficiency, euphoria_info, lore, profile, **skins**, teams
- **endfield**: attributes, **bestGifts**, factorySkills, potentials, profileRecord, skills, talents, cvName …
- **nte**: (2→9 완료) awaken, breakthrough, costumes, gifts, resonance, skills, stats, voiceLines …
- **bluearchive**: club, cv, **equipment**, school, skills, **stats**, weaponName …(현재 2섹션만 노출)

---

### 요약

> 백엔드는 이미 풍부한데 프론트 레이아웃이 못 따라간 게임이 여럿(특히 **bluearchive 2섹션**, **nikke stats 미노출**,
> **wuwa 음성 미노출**, **reverse1999 코스튬 dataKey 버그**). 대부분 **재크롤 없이 layout 섹션 추가/수정**으로 해결.
> shape가 기존 VM과 다른 경우만 게임 전용 ViewModel을 추가하면 된다. 우선순위: reverse1999 버그(1줄) → bluearchive/nikke stats → wuwa 음성 → endfield 선물.
