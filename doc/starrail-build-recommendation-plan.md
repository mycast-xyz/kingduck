# 기획안 — 스타레일 추천(광추/유물/파티) 크롤

> 작성일: 2026-06-19
> 요청: 스타레일도 genshin처럼 **추천 광추(Light Cone)/유물(Relic)/파티(Team)** 를 크롤해서 제공.

---

## 1. 현황
- 스타레일은 캐릭터(92)·광추/유물(items 1750)·이벤트·쿠폰 크롤러 보유.
- 단 **캐릭터 metadata에 추천(광추/유물/파티) 데이터가 없다** (키: camp/path/stats/skills/eidolons/skillTrees/voiceLines/stories 등).
- 반면 **genshin은 이미 추천 보유**: `GenshinBuildScraper`(소스 `genshin.gg/characters` + Ambr id매핑)가
  `metadata.recommendedWeapons`(id배열)·`recommendedArtifacts`·`teams`·`recommendedSource`를 병합. 상세에 추천 무기/성유물/파티 섹션 노출.

→ **genshin 방식을 스타레일로 복제**하면 된다.

## 2. 설계 — `StarRailBuildScraper` (genshin BuildScraper 패턴)
- **소스 후보**: `starrail.gg/characters/<slug>`(genshin.gg 자매 사이트, 빌드/추천 구조 유사) 우선 검토.
  대안: prydwen.gg/star-rail, 또는 기존 starrailstation. (스파이크로 추천 빌드 데이터 유무·구조 확인 필요.)
- **산출(metadata 병합)**: 기존 캐릭 metadata에 머지(syncCharacters가 metadata 통째 덮어쓰므로 read-merge):
  - `recommendedLightCones`: 광추 originalId 배열 (items 중 광추를 이름→id 매핑).
  - `recommendedRelics`: 유물 세트 originalId/이름 배열.
  - `teams`: 추천 파티(캐릭터 originalId/이름 묶음 + 역할).
  - `recommendedSource`: 출처 URL/표기.
- **id 매핑**: 광추/유물은 이미 items로 크롤됨 → 이름 정규화로 originalId 해석(genshin이 Ambr weapon으로 한 것과 동일). 파티 멤버는 캐릭터 이름→originalId.
- **크롤 태스크**: `starrail/build`(또는 character 후속) 태스크 추가 → 서버 크롤에서 실행. 캐릭터 크롤 뒤 실행(캐릭/광추/유물이 먼저 있어야 매핑됨).

## 3. 프론트 표시
- genshin 추천 섹션 컴포넌트(추천 무기/성유물/파티)를 **재사용/일반화**해 스타레일에도 매핑.
  - 광추 = genshin '추천 무기' 슬롯, 유물 = '추천 성유물', 파티 = '추천 파티'. dataKey만 starrail metadata 키로.
- starrailInit `layout`에 추천 섹션 추가(MainItemView/BuildRecommendationView 패턴). 빈 데이터 시 "데이터 없음" 가드(이미 구현됨).

## 4. 작업 분해
1. **스파이크**: starrail.gg(또는 대안) 캐릭터 페이지에서 추천 광추/유물/파티 데이터 위치·구조 확인(HTML/JSON).
2. **`StarRailBuildScraper`** 구현: 소스 파싱 → 이름→originalId 매핑(광추/유물=items, 파티=characters) → metadata 병합 반환.
3. **스케줄러 `starrail/build` 태스크** 등록(서버 크롤로 동일 작동).
4. **프론트**: starrailInit layout에 추천 섹션 추가(genshin 추천 컴포넌트 재사용). 빈 데이터 가드.
5. **검증**: 표본 캐릭(예: 캐스토라이스/블레이드)에 추천 광추/유물/파티가 채워지고 상세에 노출되는지.

## 5. 리스크/주의
- 소스(starrail.gg 등)에 추천 데이터가 실제로 있는지 **스파이크 선행**(없으면 prydwen 등 대안). DOM 변경 취약성.
- 광추/유물 이름 표기 차이(영문/한글) → 정규화 매핑 실패분 로깅.
- 모든 처리는 **서버 크롤러 코드**로(요청 원칙: 서버에서 동일 작동, DB 저장).

---

### 요약
> 스타레일엔 추천 데이터가 없고, genshin은 `GenshinBuildScraper`로 이미 있다. **동형의 `StarRailBuildScraper`**
> (starrail.gg 등 소스 → metadata.recommendedLightCones/recommendedRelics/teams 병합) + 스케줄러 태스크 + genshin 추천
> 섹션 재사용으로 광추/유물/파티 추천을 제공한다. 소스 구조는 스파이크로 먼저 확정.
