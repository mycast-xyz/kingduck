# 기획안 — 젠레스존제로(ZZZ) 종합 크롤 (캐릭터/무기·아이템/영상/추천)

> 작성일: 2026-06-19 (개정: 추천만 다루던 기획을 **전체 데이터**로 확장)
> 요청: ZZZ는 지금 크롤러가 캐릭터밖에 없음 → 무기·아이템·영상·추천까지 싹 다 크롤하는 형태로.

---

## 0. 현황
- **있는 것**: `zzz/character` (`ZzzCharacterScraper`, 소스 **zzz.gg/ko**). 속성/직업 필터 아이콘은 적재됨(완료).
- **없는 것**: 무기(W-Engine)·아이템(드라이브 디스크), 영상, 추천(W-Engine/디스크/팀). → 이번에 추가.
- 다른 게임 대비: genshin/starrail은 캐릭+아이템+추천(+영상/이벤트)까지 있음. ZZZ를 그 수준으로.

## 1. 아이템 — W-Engine(무기) + 드라이브 디스크(유물 세트)
- **소스(실측 200)**: `zzz.gg/ko/w-engines`(음향엔진=무기), `zzz.gg/ko/disk-drives`(드라이브 디스크 세트), `zzz.gg/ko/items`.
- **`ZzzItemScraper`**(`src/crawlers/scrapers/zzz/ItemScraper.ts`): 목록→상세 파싱 → `ScrapedData`(name/rarity/imageUrl/type/metadata) → `DataSyncService.syncItems('zzz', data)`.
  - `ItemType` 통합 스키마의 `type`으로 구분: `W-Engine`(무기) / `DriveDisc`(디스크 세트). 메인옵션·세트효과(2pc/4pc) metadata에.
  - 이미지(아이콘) 다운로드(`ImageDownloader`). originalId=zzz.gg 슬러그/id.
- **선행 의존**: 추천(3번)이 W-Engine/디스크 **이름→id 매핑**을 하므로 **아이템 크롤이 먼저**.

## 2. 영상 — 공식 한국 유튜브 @ZZZ_KO
- **소스**: `https://www.youtube.com/@ZZZ_KO` (젠레스존제로 공식 한국 채널).
- **`ZzzYoutubeScraper`**: 니케 `YoutubeShortsScraper` 패턴 재사용 — YouTube Data API로 채널 uploads 수집 → 제목에서 **DB 캐릭터명 매칭**(가장 긴 이름 우선) → 캐릭터별 영상 적재(`Video`).
  - 종류 분류(캐릭터 PV/에이전트 소개 등) + 세로/가로 필터는 니케 방식 참고(필요 시).
  - 캐릭/아이템 크롤로 DB 캐릭터명이 있어야 매칭됨(선행).

## 3. 추천 — W-Engine/드라이브 디스크/팀 (genshin.gg/zzz)
- **소스(실측)**: `genshin.gg/zzz/`(52캐릭). 캐릭 페이지(예 ellen, 27KB)에 정적 HTML 빌드 섹션:
  **Best W-Engines / Best Disk Drives Gear Sets / Best Main Stats / Best Substats / Best Team** (`.character-info-build` ×10) — **star-rail와 동일 구조**.
- **`ZzzBuildScraper`**(`src/crawlers/scrapers/zzz/BuildScraper.ts`): `StarRailBuildScraper` 복제 →
  - 슬러그 수집(점 포함 `[a-z0-9.-]+` — starrail 교훈), 캐릭 매핑(norm 정규화 + 섹션 제목 폴백),
  - 추출 → metadata 병합: `recommendedWEngines`(무기 id 배열), `driveDiscs`(세트), `mainStats`/`subStats`(텍스트), `teams`, `recommendedSource:'genshin.gg'`.
  - 이름→id 매핑은 **1번 아이템 크롤 선행** 필요.
- **DataSyncService PRESERVE_KEYS**에 zzz 키 추가(character 재크롤이 추천 안 덮게 — 기존 보존 로직 확장).

## 4. 스케줄러 태스크 (추가)
- `zzz/item`(W-Engine+디스크), `zzz/video`(@ZZZ_KO), `zzz/build`(추천).
- **실행 순서 의존**: character → item → (build, video). build/video는 캐릭·아이템이 있어야 매핑.

## 5. 프론트(이 저장소)
- **아이템**: zzzInit에 아이템 리스트/상세 노출(다른 게임 item 라우트·컴포넌트 재사용).
- **영상**: 상세에 영상 섹션(공통 영상 컴포넌트).
- **추천**: zzzInit layout에 추천 섹션(genshin 추천 컴포넌트 재사용 — W-Engine=무기 자리, 드라이브 디스크=유물 자리, 팀). 빈 데이터 가드 + **데이터 공백 추적**(GAMES_WITH_BUILD에 zzz 추가 시 추천 공백 자동 플래그).

## 6. 검증 / 주의
- 단계: 아이템 크롤 → 영상 → 추천 순. 각 `--game zzz --type <item|video|build>` 표본 실행 → DB 적재 + 상세 노출 + tsc/check 0.
- zzz.gg/genshin.gg DOM 변경 취약 → 방어적 셀렉터. 이름 매핑 실패 로깅.
- 이미지/아이콘은 static 저장(서버 크롤 생성). 전부 **크롤러 코드**(서버 재현).
- 영상은 YouTube API 키 필요(기존 니케와 동일 env).

---

### 요약
> ZZZ는 현재 캐릭터만. 추가: **아이템(`zzz.gg/ko/w-engines`·`/disk-drives`)** → **영상(`@ZZZ_KO`)** → **추천(`genshin.gg/zzz`, star-rail BuildScraper 복제)**.
> 스케줄러 `zzz/item`·`zzz/video`·`zzz/build` + 프론트 아이템/영상/추천 섹션 + PRESERVE_KEYS·데이터 공백 추적 확장.
> 의존 순서: character → item → build/video(이름→id 매핑 때문).

### 소스
- 캐릭/아이템: [zzz.gg/ko](https://zzz.gg/ko) · 추천: [genshin.gg/zzz](https://genshin.gg/zzz/) · 영상: [@ZZZ_KO](https://www.youtube.com/@ZZZ_KO) · 공식: [zenless.hoyoverse.com/ko-kr](https://zenless.hoyoverse.com/ko-kr/main)
