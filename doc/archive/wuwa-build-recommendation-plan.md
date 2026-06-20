# 기획안 — 명조(WuWa) 추천(무기/에코) 크롤 (wuthering.gg/ko)

> 작성일: 2026-06-19
> 요청: 명조도 https://wuthering.gg/ko/characters 참조해 **추천 무기 + 에코 추천** 크롤 추가. 기획안.

---

## 0. 스파이크 결과 (가능 — 실측)
- 리스트 `https://wuthering.gg/ko/characters` (176KB HTML)에 **캐릭터 슬러그 전부**(aalto, baizhi, jinhsi, changli …)가 들어있다 → slug 목록 확보 용이.
- 캐릭터 페이지 `https://wuthering.gg/ko/characters/<slug>` (예 jinhsi, 283KB HTML, 200)에 **추천 무기 + 에코 세트(sonata) 데이터가 HTML로** 있다(키워드 실측: 무기·에코·에코 세트·build·echo·sonata·weapon 다수).
- **SSR HTML이라 genshin.gg와 동일하게 cheerio 파싱으로 크롤 가능**(SPA 렌더 불필요). starrail.gg(SPA)와 달리 명조는 HTML에 데이터가 있다.
- → **genshin `GenshinBuildScraper` / 스타레일 BuildScraper와 동형**으로 만든다.

## 1. 설계 — `WutheringBuildScraper` (genshin BuildScraper 패턴)
- **소스**: `wuthering.gg/ko/characters` 목록에서 slug 수집 → 각 `/ko/characters/<slug>` HTML fetch → cheerio 파싱.
- **추출 → metadata 병합**(syncCharacters가 metadata 통째 덮으므로 기존 metadata read-merge):
  - `recommendedWeapons`: 추천 무기 → 우리 wuwa `items`(Weapon) originalId 배열로 매핑(이름 정규화).
  - `recommendedEchoes` / `echoSets`: 추천 에코 세트(sonata) → 세트 이름(또는 echo item id) 배열.
  - (있으면) 추천 스탯/메인옵션, 추천 파티도 같이.
  - `recommendedSource: 'wuthering.gg'`.
- **매핑**: 무기/에코 이름 → wuwa items originalId(이미 EchoScraper/WeaponScraper로 크롤됨). 실패분 로깅.

## 2. 구현 단계
1. **파싱 스파이크**: jinhsi 페이지 HTML에서 추천 무기/에코 세트의 정확한 셀렉터·구조 확인(섹션 제목 "추천 무기"/"에코 세트" 기준).
2. **`WutheringBuildScraper`**(`src/crawlers/scrapers/wutheringwaves/BuildScraper.ts`): slug 목록 → 페이지 파싱 → 이름→id 매핑 → metadata 병합한 ScrapedData[] 반환.
3. **스케줄러 `wutheringwaves/build` 태스크** 등록(genshin/build 패턴. 캐릭/무기/에코 크롤이 먼저 있어야 id 매핑됨 → 순서 주의).
4. **프론트 표시**: wuwaInit layout에 추천 섹션 추가 — genshin 추천 컴포넌트 재사용(무기=추천 무기, 에코=추천 성유물 자리). 빈 데이터 가드.
5. **검증**: `--game wutheringwaves --type build` 표본 실행 → 캐릭 metadata에 recommendedWeapons/echoSets 채워지는지 + 상세 노출 확인. tsc/check 0 에러. 서버 동일 작동.

## 3. 주의/리스크
- wuthering.gg DOM 변경 취약 → 방어적 셀렉터.
- 이름 매핑(한국어 무기/에코명 ↔ 우리 items): 정규화 + 별칭표. 실패 로깅.
- **전부 크롤러 코드**(서버 재현). static 이미지·아이콘과 마찬가지로 서버에서 크롤 실행해야 반영.
- robots/ToS·rate limit 준수(요청 간 딜레이).

---

### 요약
> wuthering.gg/ko 캐릭터 페이지는 **SSR HTML에 추천 무기·에코 세트가 있어 genshin.gg처럼 cheerio 파싱으로 크롤 가능**.
> `WutheringBuildScraper`(genshin/starrail BuildScraper 동형) → `recommendedWeapons`/`echoSets` metadata 병합 + `wutheringwaves/build`
> 스케줄러 태스크 + genshin 추천 섹션 재사용. 이름→items id 매핑은 스파이크로 셀렉터 확정 후.
