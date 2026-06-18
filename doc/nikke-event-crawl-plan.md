# 기획안 — 니케 이벤트 크롤 (blablalink activity-calendar)

> 작성일: 2026-06-19
> 요청: 니케 이벤트를 https://www.blablalink.com/activity-calendar 에서 크롤. **기획안만** 먼저.

---

## 0. 배경
- 현재 니케는 캐릭터/상세/아이콘/영상 크롤은 있으나 **이벤트(캘린더) 크롤이 없다.**
- 다른 게임(genshin/starrail/wuwa/endfield)은 `EventScraper`로 `CalendarEvent` 테이블에 이벤트를 적재 → 캘린더 화면에 노출.
- 소스: `https://www.blablalink.com/activity-calendar` (공식, Vite SPA — 데이터는 API/JSON fetch).

## 1. 데이터 취득 방식 (니케 다른 크롤과 동일 패턴)
- blablalink는 SPA라 HTML에 데이터 없음 → **헤드리스(puppeteer) 렌더 + response 가로채기**로 이벤트 JSON 캡처.
  (캐릭터/상세에서 검증된 방식: `Browser.getInstance().getPage()`, `page.on('response')`로 `sg-tools-cdn.*\.json` 또는 activity API 응답 캡처.)
- **스파이크 필요**: activity-calendar 페이지가 받는 이벤트 JSON의 URL 패턴·필드 구조 확인
  (이벤트명, 시작/종료일, 타입(픽업/이벤트/점검), 배너 이미지, 링크).

## 2. 매핑 → CalendarEvent
`CalendarEvent`(기존 스키마) 필드로 매핑:
- `title` ← 이벤트명(한글)
- `startTime`/`endTime` ← 기간
- `type` ← EventType enum 매핑(GACHA=픽업/모집, EVENT=인게임 이벤트, MAINTENANCE=점검/업데이트, SPECIAL=방송/행사). blablalink 카테고리 → enum 매핑표.
- `imageUrl` ← 배너(있으면 `ImageDownloader`로 webp 저장 또는 절대 URL)
- `officialLink` ← 상세/공지 링크
- `gameId` ← nikke
- `targetId`/`metadata` ← 원본 식별자/부가정보(중복 upsert 키)

## 3. 구현 단계
1. **스파이크**: activity-calendar 렌더 → 이벤트 JSON 구조·필드·기간 포맷·타입 카테고리 확정.
2. **`BlablalinkEventScraper`**(`src/crawlers/scrapers/nikke/`): 렌더→캡처→파싱→`CalendarEvent` 형태 반환.
   - 중복 방지: `targetId`(blablalink 이벤트 id) 기준 upsert(다른 게임 EventScraper의 save 패턴 참고).
   - 기간 파싱(시간대 주의 — KST), 진행/예정/종료 구분은 startTime/endTime로.
3. **스케줄러 `nikke/event` 태스크** 등록(서버 크롤로 동일 작동).
4. **검증**: 실행 → CalendarEvent에 니케 이벤트 적재 → 캘린더 화면(`/calendar/nikke`)에 노출 확인.

## 4. 주의/리스크
- SPA·해시 URL → response 가로채기(다른 blablalink 크롤과 동일). DOM/JSON 구조 변경 취약 → 방어적 파싱.
- EventType 매핑(blablalink 카테고리 → 우리 enum)은 스파이크로 카테고리 목록 확인 후 확정.
- 배너 이미지는 sg-tools-cdn 핫링크 가능하나, static 저장 권장(서버 재현·일관). `static/image/**`는 gitignore라 **서버 크롤이 생성**.
- 기간 시간대(KST) 정확히. 종료된 이벤트 보존/정리 정책(다른 게임 EventScraper와 통일).
- 전부 **크롤러 코드**(서버 동일 작동), 일회용 금지.

---

### 요약
> 니케 이벤트는 blablalink activity-calendar(SPA)에서 **헤드리스 렌더 + JSON 가로채기**로 수집 가능.
> `BlablalinkEventScraper` → `CalendarEvent`(title/기간/type/배너/링크) 매핑 + `nikke/event` 스케줄러 태스크.
> JSON 구조·타입 카테고리는 스파이크로 먼저 확정. (기획만 — 구현은 후속.)
