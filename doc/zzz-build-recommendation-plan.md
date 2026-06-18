# 기획안 — 젠레스존제로(ZZZ) 추천(W-Engine/드라이브 디스크/파티) 크롤 (genshin.gg/zzz)

> 작성일: 2026-06-19
> 요청: ZZZ도 https://genshin.gg/zzz/ 참조해 명조처럼 추천 크롤 기획. (genshin.gg/star-rail BuildScraper와 동형)

---

## 0. 스파이크 결과 (가능 — 실측)
- `https://genshin.gg/zzz/` 리스트 200, **캐릭터 슬러그 52종**(alice, anby, ellen …). 점 슬러그(`silverwolflv.999` 같은) 가능성 대비해 슬러그 정규식 `[a-z0-9.-]+` 사용.
- 캐릭터 페이지 `https://genshin.gg/zzz/characters/<slug>/` (예 ellen, 27KB)에 **빌드 섹션이 정적 HTML**로 존재(실측):
  - **Best W-Engines Weapons** (음향엔진=무기)
  - **Best Disk Drives Gear Sets** (드라이브 디스크 세트=유물/장비)
  - **Best Main Stats / Best Substats** (메인/서브 옵션)
  - **Best Team / Best Ellen Team** (파티)
  - `.character-info-build` 섹션 10개 — starrail과 동일 구조.
- → **`StarRailBuildScraper`와 거의 동형**(genshin.gg 동일 도메인·cheerio 파싱). SPA 아님.

## 1. 설계 — `ZzzBuildScraper` (genshin.gg/star-rail BuildScraper 패턴 복제)
- **소스**: `genshin.gg/zzz/` 목록에서 slug 수집(점 포함 정규식) → 각 `/zzz/characters/<slug>/` HTML → cheerio.
- **캐릭 매핑**: 슬러그 정규화(norm: 비영숫자 제거) → 우리 zzz 캐릭터 originalId. 실패 시 빌드 섹션 제목("<표시명> Best ...")의 표시명 폴백. (starrail의 resolveCharId 그대로.)
- **추출 → metadata 병합**(read-merge; syncCharacters가 enrichment 키 보존하도록 PRESERVE_KEYS에 zzz 키 추가):
  - `recommendedWEngines` (또는 무기 슬롯 키): W-Engine 이름 → zzz items(W-Engine) originalId 배열.
  - `driveDiscs` / `recommendedDiscs`: 드라이브 디스크 세트(4pc/2pc) → 세트 이름 또는 disc item id.
  - `mainStats` / `subStats`: 추천 메인/서브 옵션(텍스트).
  - `teams`: 파티(캐릭 originalId/이름).
  - `recommendedSource: 'genshin.gg'`.
- **이름→id 매핑**: zzz items(W-Engine/드라이브 디스크)는 이미 크롤됨(zzz item 크롤 확인 필요). 영문/한글 이름 정규화 매칭, 실패 로깅.

## 2. 구현 단계
1. **파싱 스파이크**: ellen 페이지에서 W-Engine/드라이브 디스크/스탯/팀 섹션의 셀렉터·텍스트 구조 확정(starrail parseBuild 재사용 가능 여부).
2. **`ZzzBuildScraper`**(`src/crawlers/scrapers/zzz/BuildScraper.ts`): starrail BuildScraper 복제 후 ZZZ 섹션명/매핑으로 조정.
3. **스케줄러 `zzz/build` 태스크** 등록(starrail/build 블록 참고. zzz 캐릭/아이템 크롤이 선행해야 매핑됨).
4. **DataSyncService PRESERVE_KEYS**에 zzz enrichment 키 추가(character 재크롤이 추천 안 덮게 — 기존 보존 로직 확장).
5. **프론트 표시**: zzzInit layout에 추천 섹션(genshin 추천 컴포넌트 재사용: W-Engine=무기 자리, 드라이브 디스크=유물 자리, 파티). 빈 데이터 가드.
6. **검증**: `--game zzz --type build` 표본 → metadata에 W-Engine/디스크/팀 채워지는지 + 상세 노출. tsc/check 0. 서버 동일 작동.

## 3. 주의/리스크
- genshin.gg DOM 변경 취약 → 방어적 셀렉터. 점 슬러그 누락 주의(starrail 교훈 — `[a-z0-9.-]+`).
- 이름 매핑(한/영 W-Engine·디스크명 ↔ items): 정규화 + 별칭표. 실패 로깅.
- zzz items(W-Engine/드라이브 디스크) 크롤이 **선행**돼야 id 매핑 가능 — 없으면 item 크롤부터.
- 별형/신캐 공백은 **데이터 공백 추적**이 플래그(이미 구현 예정/구현됨).
- 전부 크롤러 코드(서버 재현).

---

### 요약
> genshin.gg/zzz 캐릭터 페이지는 **star-rail과 동일한 정적 HTML 빌드 구조**(Best W-Engines / Disk Drives / Stats / Team)라
> `StarRailBuildScraper`를 복제한 `ZzzBuildScraper`로 크롤 가능. W-Engine→무기·드라이브 디스크→유물 자리로 매핑,
> `zzz/build` 태스크 + DataSyncService PRESERVE_KEYS 확장 + genshin 추천 섹션 재사용. 셀렉터·item 선행 크롤은 스파이크로 확정.
