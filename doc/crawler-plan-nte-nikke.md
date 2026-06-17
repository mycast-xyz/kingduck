# 크롤링 기획안 — 이환(NTE) · 니케(NIKKE)

> 작성일: 2026-06-17
> 목적: 이환(NTE)·니케 두 게임의 캐릭터/이벤트 데이터를 크롤링으로 채우기 위한 소스 조사 · 데이터 매핑 · 작업 분해 · 프록시 검토.
> 전제: 이 저장소는 **프론트엔드(UI 구조 정의)만** 담당. **실제 크롤링은 백엔드 `kingduck-server`** 책임.
> 참고: `doc/ARCHITECTURE.md`(새 게임 추가), `doc/code-audit.md`(크롤러 현황·결함).

---

## 0. 용어/식별 정정 (먼저 확인)

- **이환 = Neverness to Everness (NTE)**, 중국명 **异环(Yìhuán)**, Hotta Studio/Perfect World.
  영어권 일부 검색에서 동일 한자가 NetEase의 *Ananta*와 혼동되지만, **한국에서 "이환"은 NTE**가 맞다
  (인벤 보드 `nte`, 아카라이브 `nevernesstoeverness`, 나무위키 "이환" 문서 모두 NTE를 가리킴).
- NTE는 **출시된 가챠 게임**(2026-06 기준 버전 1.0~1.1 진행). 주사위/보드게임형 가챠라는 점만 독특할 뿐,
  캐릭터·등급·속성 구조는 일반 가챠와 동일 → **본 플랫폼에 그대로 맞음**.
- ⚠️ 혹시 의도하신 "이환"이 NetEase *Ananta*(미출시·비가챠)였다면 이 기획 전제가 달라지니 알려달라.

---

## 1. 게임별 데이터 구조 (크롤 타겟 스키마)

프론트 `GameInitConfig`(`src/app/model/game/GameInitConfig.ts`)와 백엔드 `CharacterType<T>`
(`src/app/model/api/api.ts`)에 맞춰, 게임별로 **무엇을 긁어야 하는지**를 정의한다.

### 1-A. 이환 (NTE) — 신규 통합 필요

| 분류 | 값 | GameInitConfig 매핑 |
|------|-----|------|
| **등급(rarity)** | S급 / A급 (2단계) | `rarity.type: 'string'`, `list: { S: 'S급', A: 'A급' }` |
| **속성(element)** | 주·빛·암·혼·상·령 (6) | `type.elementType` (apiType: `"DamageType"` 류) |
| **아크/무기(weapon)** | 고체·액체·기체·결합·플라즈마 (5) | `type.arkType` (apiType: `"Weapon"`/`"Ark"`) |
| **역할(role)** | 메인딜러·서브딜러·서포터 (3) | `type.roleType` |
| **이름/이미지/출시일** | 캐릭터별 | `name`, `imageUrl`, `metadata.releaseDate` |

확인된 캐릭터 예시(시드용): 나나리(첫 픽업), 사키리, 백장, 하토르, 파디아, 다포딜, 구원,
제로, 민트, 호토리, 블라썸, 라크리모사 등 (1.0 기준 S 11 / A 6 ≈ 17명, 1.1에서 추가).

> 신규 게임이므로 프론트 5종 작업 필요: `NteInit.ts` 생성 → `routes/list·content·calendar·tier-list·coupon`
> 의 slug switch에 `nte` 등록 → `CalendarConfig.ts`에 색상 추가. (상세: `doc/ARCHITECTURE.md` "새 게임 추가")

### 1-B. 니케 (NIKKE) — 프론트 통합 완료, 백엔드 점검만

- 프론트 `nikkeInit.ts` **이미 존재**(라우트/캘린더 등록 완료). 속성 5종 정의됨:
  `manufacturerType`(기업소속), `weaponType`, `elementType`(코드), `classType`, `burstType`,
  rarity `SSR/SR/R`(string 3단계).
- 따라서 니케는 **신규 통합이 아니라, 백엔드 크롤러가 위 필드를 채우는지/최신인지 점검**이 핵심.
- 크롤 타겟 필드: name, imageUrl, rarity(SSR/SR/R), elementId(코드), manufacturer, weaponType,
  classType, burstType, releaseDate + 이벤트/가챠(캘린더).

### 공통 백엔드 스키마 (DataSyncService upsert 대상)

```
Character: { originalId, gameId, name, rarity, elementId, pathId, imageUrl, metadata<T>, ... }
Element:   { gameId, name, type, iconUrl }   // 게임별 속성/무기/등급을 Element 행으로 생성
Event:     { gameId, name, type: GACHA|EVENT|MAINTENANCE, startTime, endTime, metadata }
```

---

## 2. 크롤 소스 검토 (실제 웹 서핑 기반)

선정 기준(우선순위 갱신): **① 사용자(팬) 제작 DB형 사이트 최우선** — 속성/등급/역할로
필터되는 정형 스키마라 파싱이 가장 깔끔하고 필드 누락이 적다. ② 정형성·갱신 빈도,
③ 정적 HTML > JS 동적(파싱 비용), ④ 한국어 가산점(표기 일치). **나무위키는 프로즈(문장형)라
필드 추출이 불안정 → 보조/교차검증용으로 격하.**

> ⚠️ 트레이드오프: DB형 사이트는 정형성은 좋지만 **JS 동적 렌더링이 많다**(예: nikke.gg).
> 따라서 소스별로 "정적 HTML / 내부 JSON API / 헤드리스 필요"를 **B0에서 1차 검증**한 뒤 확정한다.
> 내부 JSON API가 뚫리면 그게 최선(빠르고 깔끔), 안 되면 헤드리스(Puppeteer).

### 2-0. ✅ 확정 소스 실측 정찰 (2026-06-17, curl 직접 조사)

사용자 지정 두 사이트를 직접 까서 렌더링 방식·API·인증을 확인했다.

#### 🟢 이환 → **everness.info/ko** (채택, 1순위)

| 항목 | 결과 |
|------|------|
| 스택 | **Next.js App Router(RSC) + Cloudflare**, 서버 프리렌더(`x-nextjs-prerender:1`) |
| 차단 | 기본 UA는 **403** → 브라우저 UA 헤더 주면 **200** (단순 UA 필터, 봇 차단 약함) |
| 한국어 | **`/ko` 로케일 내장** → 한글 표기 그대로 (별도 매핑 불필요!) |
| 섹션(경로) | `/ko/espers`(캐릭터=이능력자), `/ko/arcs`(아크), `/ko/items`, `/ko/cosmetics`, `/ko/events` 모두 200 |
| 상세 페이지 | `/ko/espers/<영문slug>` 존재 (예: `/nanali`, `/sakiri`, `/zero`, `/mint`) |
| ⚠️ 데이터 위치 | **프리렌더 HTML·RSC flight에 캐릭터 데이터가 없음 → 클라이언트에서 후페치(렌더링)** |
| **크롤 방식** | **(A) 헤드리스(Puppeteer)로 렌더 후 DOM 파싱** — 확실, 기존 프로젝트 패턴. **(B) devtools로 클라이언트 XHR(내부 JSON 엔드포인트) 1회 추적 → 직접 호출**(빠르고 헤드리스 회피). **B가 가능하면 B, 아니면 A.** |

> 결론: everness는 **무난히 크롤 가능**. 한글 로케일 내장이 큰 장점. 슬러그 목록은 `/ko/espers`에서 수집.
> 내부 JSON 엔드포인트만 1회 찾아두면(다음 작업) 헤드리스 비용도 없앨 수 있다.

#### 🟡 니케 → **blablalink.com** (채택하되 조건부)

| 항목 | 결과 |
|------|------|
| 스택 | **Vite SPA(완전 클라이언트 렌더)** — HTML은 빈 셸. 공식 NIKKE 컴패니언 앱 |
| API | **RPC형**: `sg-lipcommunity.playerinfinite.com/api/gpts.<service>.<Svc>/<Method>` (Twirp/gRPC-web 스타일) |
| ⚠️ 인증 | **`LoginByINTL`(intlgame 로그인) + `access_token`/`game_token` + `signature`(요청 서명)** → **인증·서명 게이트** |
| 공개 가능성 | `information_feeds_svr`의 **`GetGameLibraryData`/`GetCommonLibraryData`/`GetCommonLibraryList`**(콘텐츠/도감 피드)는 **앱/게스트 토큰 수준으로 접근 가능성** |
| 게임 리소스 | 캐릭터 테이블·이미지: `getGameJsonResource('/character/CharacterLevelTable…')`, `getIngameResourceUrl('/character/full/…')` → **정적 JSON/이미지 CDN**(`sg-cdn`/`sg-tools-cdn.blablalink.com`) — **공개일 가능성 높음** |

> 결론: blablalink는 **공식이라 데이터 품질 최상**이지만 **RPC + intlgame 인증 + 요청 서명 + ToS 민감**.
> 권장 전략 — ① **정적 게임데이터 JSON/이미지 CDN**(인증 없을 가능성)을 우선 활용, ② 도감은 `GetGameLibraryData`를
> **devtools로 실제 요청(헤더/서명) 1회 캡처**해 재현 가능한지 검증, ③ 서명 재현이 불안정/ToS 걸리면 **prydwen·나무위키를
> 회복탄력적 폴백으로 유지**. **니케 전체 파이프라인을 서명형 공식 API 하나에 의존시키지 말 것**(깨지기 쉬움).

> 📌 공통 다음 작업: 두 사이트 모두 **실제 XHR을 브라우저 devtools(Network)로 1회 캡처**해
> (everness=내부 JSON URL, blablalink=RPC 요청 본문·헤더·서명) 백엔드 스크래퍼에 그대로 이식하는 것이 가장 확실.

---

### 2-A. 이환 (NTE) — 폴백/보조 소스

| 우선 | 소스 | URL | 언어 | 구조 | 용도 |
|------|------|-----|------|------|------|
| ⭐**1** | **ntewiki.org** | ntewiki.org/en/characters/ | EN | 팬 제작 필터형 DB | 캐릭터 속성/등급/역할/무기 정형 데이터 |
| ⭐**1** | **ntegame.com** | ntegame.com/characters/ | EN | 팬 제작 필터형 DB | 교차검증·이미지·빌드 |
| 2 | nevernessnte.org / zeroluck.gg / neverness.gg | 각 /characters | EN | 팬 제작 DB | 보강·티어/레이팅 |
| 보조 | 나무위키 | namu.wiki/w/이환 · /민트(이환) | KR | 프로즈(문장형) | 표기(한글명) 매칭·출시일 보조 |
| 보조 | 이환 인벤 / 아카라이브 | inven.co.kr/board/nte · arca.live/b/nevernesstoeverness | KR | 게시판 | 이벤트·가챠 일정·신캐 소식 |

권장 조합: **ntewiki.org(주 데이터) + ntegame.com(교차검증) → 나무위키로 한글 표기 매핑 → 인벤/아카(이벤트)**.
(한글 캐릭터명은 팬 DB가 영문 위주이므로, 나무위키/인벤으로 영문↔한글 매핑 테이블을 별도 구성.)

### 2-B. 니케 (NIKKE) — 폴백/보조 소스 (blablalink은 §2-0 참조)

| 우선 | 소스 | URL | 언어 | 구조 | 평가 |
|------|------|-----|------|------|------|
| ⭐**1** | **prydwen.gg** | prydwen.gg/nikke/characters | EN | 팬 제작 DB(Gatsby, 대개 정적 빌드) | 정형 데이터 + JSON/HTML 파싱 가능성 높음 → **B0 검증 시 우선** |
| ⭐**1** | **nikke.gg** | nikke.gg/characters/ | EN | 팬 제작 DB(**JS 동적**) | 데이터 풍부하나 **내부 JSON API 역추적 / 헤드리스 필요** |
| 2 | dotgg.gg / lootandwaifus | dotgg.gg/nikke | EN | 팬 제작 DB | 보강·교차검증 |
| 보조 | 나무위키 | namu.wiki/w/승리의 여신: 니케/등장인물 | KR | 프로즈 | 한글 표기 매핑·보조 |
| 보조 | nikke-kr.com(공식) | nikke-kr.com | KR | 공식 | 이벤트/쿠폰 공지 |

권장: **prydwen(정적이면 최우선) + nikke.gg(내부 API 뚫리면 1순위, 아니면 헤드리스) → 나무위키로 한글 매핑.**

> 검증 메모: `nikke.gg/characters/`는 캐릭터 목록을 JS/API로 후로딩 → 단순 HTML 파서로는 빈 페이지.
> 우선순위가 팬 DB이므로 **헤드리스/내부 API 비용을 감수**하되, prydwen이 정적 빌드면 그쪽을 먼저 뚫어 비용 절감.

---

## 3. 작업 분해 (WBS)

### 프론트엔드 (이 저장소)

- [ ] **F1. 이환 Init 작성** — `src/app/model/game/NteInit.ts` (gameId `nte`).
      type: elementType(6)/arkType(5)/roleType(3), rarity string `S/A`, content/layout는 nikke 패턴 참고.
- [ ] **F2. 라우트 등록** — `routes/list/[slug]`, `content/[gameEnName]/[characterId]`,
      `calendar/[slug]`, `tier-list/[slug]`, `coupon/[slug]` 의 switch에 `nte` 추가.
- [ ] **F3. 캘린더 색상** — `CalendarConfig.ts` `GAME_CONFIG`에 `nte` 색상.
- [ ] **F4. 니케 점검** — 프론트는 완료 상태. 백엔드 데이터 들어오면 표시 확인만.
- [ ] **F5. `pnpm run check` / `lint` 통과.**

### 백엔드 (`kingduck-server`, 별도 repo)

- [x] **B0. 소스 렌더링/인증 1차 검증** — 완료(§2-0). everness=Next.js 클라이언트 렌더,
      blablalink=Vite SPA + RPC + intlgame 인증/서명.
- [ ] **B0-1. XHR 캡처** — devtools Network로 everness 캐릭터 JSON 엔드포인트 / blablalink
      `GetGameLibraryData` 요청(본문·헤더·서명)을 1회 캡처해 재현 가능성 확정.
- [ ] **B1. 이환 스크래퍼** — `crawlers/scrapers/nte/{CharacterScraper,EventScraper}.ts`.
      **everness.info/ko 주 데이터**(내부 JSON 직접 호출 우선, 안 되면 헤드리스). `/ko/espers` 슬러그 수집 → 상세 순회.
      한글은 `/ko` 로케일에서 그대로 취득(매핑 불필요). 보조: ntewiki/인벤(이벤트).
- [ ] **B2. 이환 Element 시드** — 속성6/아크5/등급2/역할3 → `Element` 행 생성(type 매핑).
- [ ] **B3. 니케 크롤러(blablalink)** — ① 정적 게임데이터 JSON/이미지 CDN(`sg-cdn`/`sg-tools-cdn`) 우선,
      ② 도감은 `GetGameLibraryData` 서명 재현 검증, ③ 불안정 시 prydwen/나무위키 폴백. 기존 크롤러 SSR/SR/R·5속성 채우는지 점검.
- [ ] **B4. DataSyncService** — 두 게임 upsert 매핑(originalId 중복제거, elementId/pathId 연결).
- [ ] **B5. 스케줄러 등록** — cron 주기 등록, `/admin/crawler/status`에 노출.

### 선결: 기존 크롤러 결함 (code-audit.md) — 새 크롤러 추가 전 권장

- [ ] **B-H8 중복 실행 락** — Puppeteer Browser 싱글톤을 동시 크롤이 공유 → close() 충돌·중복 upsert.
      게임이 늘수록 위험 증가. **새 크롤러 붙이기 전 락부터.**
- [ ] **B-C6 close() try/finally** — 실패 경로에서 크롬 미종료 → 좀비 프로세스/PID 고갈.
- [ ] **B-H6 에러 삼킴** — EventScraper가 실패를 `[]` SUCCESS로 기록. `PARTIAL` 상태 실제 사용.

---

## 4. 프록시 사용 검토 (요청 핵심)

**결론: 현재 규모에서 프록시는 불필요(오버킬). 진짜 병목은 프록시로 풀리지 않는다.**

### 4-1. "프록시 = 빠른 크롤"은 오해

- 프록시는 속도를 올리는 도구가 **아니라**, 단일 IP가 차단(429/IP ban)당하지 않으면서
  **동시성(concurrency)을 끌어올릴 수 있게** 해주는 도구다. 속도 향상의 본질은 동시성이고,
  프록시는 그 동시성을 "차단 없이" 쓰게 해줄 뿐이다.
- 즉 **요청 수가 적으면 프록시는 아무 이득이 없다.**

### 4-2. 이 프로젝트 규모

- 이환 캐릭터 ≈ 17~30개, 니케 ≈ 수백 개 수준. 이벤트/아이템 포함해도 **소규모**.
- 정중한 동시성(2~4) + 요청 간 딜레이로 **수 분 내 완료**. 차단당할 트래픽이 아니다.
- 갱신도 신캐/이벤트 단위(주~격주) → 폭발적 요청 없음.

### 4-3. 진짜 병목은 따로 있다

1. **JS 동적 팬 DB(nikke.gg 등)의 헤드리스 비용** — 팬 DB를 최우선으로 쓰기로 한 만큼 헤드리스
   비중이 커진다. Puppeteer 인스턴스가 네트워크보다 훨씬 비쌈 → **프록시가 아니라 내부 JSON API
   역추적(있으면 헤드리스 회피) / prydwen 같은 정적 빌드 우선 선택**으로 해결.
2. **중복 실행 락 부재(B-H8)** — 동시성 올리려다 오히려 싱글톤 Browser 충돌. → **락 먼저.**

### 4-4. 프록시가 정당화되는 경우 (지금은 아님)

- 타겟이 실제로 IP를 차단할 만큼 자주/대량 크롤할 때
- 지역 차단(geo-block) 우회가 필요할 때 (예: 중국 본토 전용 소스 `异环` 페이지)
- 이미 차단당한 상태에서 단기 우회가 필요할 때

→ **권장: 1단계는 프록시 없이 단일 IP + 동시성 2~4 + robots.txt 준수 + UA 명시 + 딜레이.**
   차단/429가 실제로 관측되면 그때 회전 프록시 도입 검토. (선도입 = 불필요한 비용·복잡도.)

---

## 5. 권장 진행 순서

1. **(확인)** 이환=NTE 식별 OK? (§0) → 아니면 Ananta로 재기획.
2. **(소스 검증)** B0: 팬 DB(ntewiki·ntegame·prydwen·nikke.gg) 정적/동적·내부 API 판별.
3. **(백엔드 선결)** B-H8 락 / B-C6 finally — 크롤러 늘리기 전 안정화.
4. **(이환 프론트)** F1~F3: `NteInit.ts` + 라우트/캘린더 등록.
5. **(이환 백엔드)** B1·B2: **팬 DB 기반** 캐릭터 스크래퍼 + Element 시드(+한글 매핑).
6. **(니케)** B3: 기존 크롤러 점검/보강(신규 캐릭터 누락 여부).
7. **(공통)** 프록시 없이 가동 → 로그/차단 모니터링 → 필요 시에만 프록시.

---

## 부록: 출처

**이환(NTE)**
- 나무위키 "이환" / "민트(이환)" — https://namu.wiki/w/민트(이환)
- ntewiki.org — https://ntewiki.org/en/characters/
- ntegame.com — https://www.ntegame.com/characters/
- 이환 인벤 — https://www.inven.co.kr/board/nte/6518/130
- bluestacks 캐릭터 가이드 — https://www.bluestacks.com/ko/blog/game-guides/neverness-to-everness/nte-characters-guide-ko.html
- gamsgo 티어표 — https://www.gamsgo.com/ko/blog/이환-티어표

**니케(NIKKE)**
- 나무위키 등장인물 — https://namu.wiki/w/승리의%20여신:%20니케/등장인물
- prydwen — https://www.prydwen.gg/nikke/characters
- nikke.gg(동적) — https://nikke.gg/characters/
- 공식(KR) — https://nikke-kr.com/
