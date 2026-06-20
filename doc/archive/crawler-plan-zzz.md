# 크롤링 기획안 — 젠레스 존 제로 (ZZZ / Zenless Zone Zero)

> 작성일: 2026-06-18
> 목적: ZZZ 캐릭터(에이전트) 데이터를 크롤링으로 채우고, 프론트 게임 설정(ZzzInit)을 신규 작성해
> 리스트/상세 페이지에 노출하기 위한 소스 조사 · 데이터 매핑 · 작업 분해.
> 전제: 이 저장소(`kingduck`)는 **프론트엔드(UI 구조)**, 실제 크롤은 **백엔드 `kingduck-server`** 담당.
> 참고: 니케 크롤러(`scrapers/nikke/CharacterScraper.ts`)가 가장 가까운 선례 — fandom MediaWiki API 패턴.

---

## 0. 현황 (zzz는 백엔드·프론트 둘 다 신규)

- DB `games`에 **zzz 게임 행은 존재(id=5)하나 캐릭터 0개**.
- 프론트에 **ZzzInit 없음**, **GameRegistry 미등록**, 필터/카드 설정 전무.
- 따라서 니케(이미 nikkeInit이 있었음)보다 작업이 하나 더 많다 → **백엔드 스크래퍼 + 프론트 ZzzInit/registry 동시 신규.**

---

## 1. 소스 결정 — **zzz.gg/ko** 채택

| 후보 | 상태 | KR | 구조 | 비고 |
|---|---|---|---|---|
| **zzz.gg/ko** | ✅ 도달(curl 200) | ✅ **기본 한국어** | Next.js(App Router, RSC) | **채택** — 한글명+속성+이미지 한 곳에 |
| zenless-zone-zero.fandom.com | ✅ 도달 | △ (영문명+`ko=`) | MediaWiki API | 영문 위주, 등급/속성은 카테고리 파생 필요 → 보조 |
| hakush.in (api.hakush.in/zzz) | ❌ 작업환경 ECONNREFUSED | ko | JSON | 환경 차단 |

> **채택 이유**: zzz.gg/ko는 **캐릭터명이 처음부터 한국어**(네코마타·카이사르·엔비·니콜)이고,
> 등급/속성/특성/소속이 **목록 페이지 한 곳에** 다 있으며, 이미지도 직접 접근된다. (fandom은 영문명+카테고리 조합이 필요)

### 1.1 검증된 zzz.gg 구조

- **목록**: `https://zzz.gg/ko/characters` (curl 200, ~129KB, **43 에이전트**). 각 카드: 한국어명 · 등급(S/A) ·
  속성(물리/화염/얼음/전기/에테르) · 특성(강공/격파/이상/지원/방어/관통) · 소속 · 아이콘.
- **상세**: `https://zzz.gg/ko/characters/{한국어명}` (예: `/ko/characters/네코마타`) — 스플래시·스킬·음향엔진·스탯 등(가용성 구현 시 확인).
- **이미지**: 카드 src는 Next 최적화 래퍼 `/_ipx/w_140&q_70/images/IconRole{NN}.png`.
  **원본은 `https://zzz.gg/images/IconRole{NN}.png`** (curl 200, png ~790KB) — 래퍼 벗기고 원본 다운로드.
- 검증 샘플: 네코마타(S/물리/강공), 「11호」(S/화염/강공), 카이사르(S/물리/방어), 엔비(A/전기/격파), 니콜(A/에테르/지원).

### 1.2 추출 방식 — Puppeteer DOM 렌더 (권장)

zzz.gg는 **Next.js App Router(RSC 스트리밍)** 라 `__NEXT_DATA__` 정적 JSON이 없다. 데이터는 SSR HTML의
`self.__next_f` 청크(이스케이프된 JSON)에 들어있어 직접 파싱이 지저분하다.
→ **이미 Puppeteer 인프라가 있으므로**(reverse1999 스크래퍼 동일) **렌더 후 DOM 쿼리**가 가장 견고하다.
목록 페이지에서 카드(이름/등급/속성/특성/소속/IconRole)를 읽고, 필요 시 상세 페이지로 보강.
(대안: `__next_f` 청크에서 IconRole+이름+속성 JSON을 정규식 추출 — 페이지 구조 변경에 취약하므로 후순위.)

---

## 2. 데이터 매핑 (스크랩 → DB/메타데이터)

| 대상 | 소스(zzz.gg/ko) | DB/메타 |
|---|---|---|
| name | 카드 한국어명 | `Character.name` (예: 네코마타) |
| originalId | 한국어명 또는 IconRole 번호 | `metadata.originalId` (안정 식별자) |
| 등급 S/A | 카드 등급 | `rarity` Int(S=5, A=4) + `metadata.rarity`("S"/"A") |
| 속성(원소) | 카드 속성 | `metadata.element` → resolveElement(DamageType) |
| 특성 | 카드 특성 | `metadata.specialty` → resolveElement(Path), `role`에도 반영 |
| 소속 | 카드/상세 소속 | `metadata.faction` |
| 아이콘 | `images/IconRole{NN}.png`(원본) | ImageDownloader → 로컬 webp |
| 스플래시·스킬·성우 | 상세 페이지(가용성 확인 후) | `metadata.cardImageUrl` / `skills` / `cv` — **후속** |

- **이미지**: 카드의 `_ipx` 래퍼를 벗겨 **원본 `https://zzz.gg/images/IconRole{NN}.png`** 로
  `ImageDownloader.downloadAndSave(url,'zzz','character',`icon_${id}`)` → **로컬 webp 저장**(직링크 금지).
  ImageDownloader에 `zzz` 설정 이미 존재(referer zenless.gg).
- **Element/Path 자동 생성**: `DataSyncService.createElementResolver`가 없는 값은 생성하므로 시드 불필요(니케 검증).
- **속성/특성 한글 표기**: zzz.gg가 이미 한국어로 주므로 별도 매핑 거의 불필요(필요 시 영문 키 정규화만).

---

## 3. 작업 분해

### 백엔드 (`kingduck-server`)
1. `src/crawlers/scrapers/zzz/CharacterScraper.ts` — **reverse1999 스크래퍼(Puppeteer) 구조 재사용**:
   - `https://zzz.gg/ko/characters` 렌더 → 카드 DOM에서 이름/등급/속성/특성/소속/IconRole 추출(43개).
   - IconRole 원본 이미지 다운로드.
   - (후속) 상세 페이지 `/ko/characters/{name}` 보강(스플래시/스킬/성우).
2. 스케줄러 등록: `{ game:'zzz', type:'character', ... syncCharacters('zzz', data) }`.
3. (후속) 영상: 공식 ZZZ 한국 채널 핸들 확보 시 니케처럼 `YoutubeShortsScraper`.

### 프론트 (`kingduck`) — zzz 설정 신규
4. `src/app/model/game/ZzzInit.ts` 작성:
   - `type` 필터: 속성(DamageType)·특성(Path)·등급·소속. 각 `list` 한글 매핑 포함(니케와 달리 처음부터 완성).
   - `rarity`: `{ type:'string', list:{ '5':'S','4':'A' } }`.
   - `list.card.rarityColors`: S(금)·A(보라).
   - `content`/`layout`: 기본 정보 + (가능 시) 캐릭터 정보 섹션. 스킬은 후속.
5. `GameRegistry.ts`에 `zzz: () => new ZzzInit().setInit()` 등록.
6. (선택) 카테고리→한글 매핑 테이블(속성/특성/공격타입) 공유.

---

## 4. 범위 / 후속

- **1차**: 캐릭터 목록 + 등급/속성/특성/소속/성우/프로필 + 아이콘·스플래시 이미지 → 리스트/기본 상세 렌더.
- **후속**: 스킬(별도 템플릿 파싱), 영상, 캐릭터 스토리/음성(데이터 가용성 확인 후).

## 5. 주의점

- **App Router(RSC) 추출**: zzz.gg는 정적 `__NEXT_DATA__`가 없어 **Puppeteer DOM 렌더**로 긁는다(reverse1999 동일).
  DOM 셀렉터는 사이트 마크업에 의존 → 셀렉터를 한 곳에 모으고, 빈 결과 시 즉시 로그 경고.
- **이미지 _ipx 래퍼**: 카드 src `/_ipx/w_140&q_70/images/IconRole{NN}.png` → 원본 `/images/IconRole{NN}.png` 로 치환 후 다운로드.
- **상세 데이터 가용성**: 스킬/성우/스탯이 상세 페이지에 있는지 구현 시 확인. 없으면 1차는 목록 정보만으로 충분.
- **봇 차단/레이트리밋**: zzz.gg(Cloudflare 가능성) — UA 설정·요청 간 지연, 차단 시 fandom 보조 소스로 폴백.
- **신규 게임 추가 절차**는 `doc/ARCHITECTURE.md`의 "새 게임 추가"와 니케 PR 패턴(스크래퍼+스케줄러+Init+registry)을 따른다.

---

### 요약

> **소스 = zzz.gg/ko** (한국어 이름·등급·속성·특성·소속이 목록 한 곳 + 원본 이미지 직접 접근).
> 추출은 **Puppeteer DOM 렌더**(reverse1999 패턴). 백엔드 스크래퍼 + zzz는 프론트 설정 전무하므로
> **ZzzInit + GameRegistry**도 신규 작성. 이미지 로컬 저장, Element/Path는 sync 자동 생성, 스킬·성우·영상은 후속.
> (fandom 위키는 영문명+카테고리라 보조/폴백으로만.)
