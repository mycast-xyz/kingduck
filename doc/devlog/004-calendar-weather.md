# [kingduck #4] 가챠 일정을 "날씨 경보"로 — 캘린더와 픽업 기상특보

<!--
네이버 발행 메모:
- 추천 제목(검색용): "가챠 픽업 일정을 날씨예보처럼 보여주기 — 캘린더 만들기 (4)"
- 태그: 개인프로젝트, 가챠게임, 캘린더, 프론트엔드, SvelteKit, 원신, 니케, 스타레일, 개발일지, UX
- 기상특보 등급 표/코드는 '소스코드' 컴포넌트로.
-->

## 이번 편에서 할 것

데이터(2편)와 라우팅(3편)이 섰으니 이제 **사용자가 실제로 보는 기능**이다.
여러 게임의 가챠/이벤트 일정을 한 타임라인에 모은 캘린더, 그리고 그 위에 얹은
조금 장난스러운 기능 — **픽업 상황을 "기상특보"로 알려주기**.

## 배경 / 문제 — 일정표는 많다. 그런데 와닿질 않는다

가챠 유저가 캘린더에서 진짜 궁금한 건 날짜 자체가 아니다.

- 지금 지갑을 지켜야 하나, 풀어도 되나?
- 픽업이 몰려서 "재난" 수준인가?
- 곧 끝나니 막차를 타야 하나?

날짜를 나열한 표는 이 질문에 즉답을 주지 못한다. 그래서 일정 데이터를 **한 줄 상태**로
요약해주고 싶었다. 마침 가챠 커뮤니티엔 "픽업 태풍", "지갑 침수" 같은 날씨 밈이 있다.
그대로 가져왔다 — **일정 → 기상특보**.

## 접근 — 캘린더 도메인을 작은 모델로 쪼갠다

`src/app/model/calendar/`에 도메인을 분리했다.

| 파일 | 역할 |
|------|------|
| `CalendarConfig.ts` | 표시 범위(앞 30일/뒤 3일), 하루당 픽셀, 게임별 색상 |
| `CalendarTypes.ts` | `EventType = GACHA \| EVENT \| MAINTENANCE`, `CalendarEvent` |
| `WeatherAlertTypes.ts` | 경보 등급 `SAFE \| ADVISORY \| WARNING \| DISSIPATION \| DISASTER \| RECOVERY` |
| `WeatherAlertCalculator.ts` | 이벤트 목록 → 경보 등급 계산 |
| `WeatherAlertMessages.ts` | 등급별 밈 메시지 풀(한국어) |

타임라인 좌표(이벤트 막대 위치/너비, 겹침 없이 행 배치)는 `utils/calendar/CalendarUtils.ts`로
순수 함수화했다. **"계산"과 "표시"를 분리**해야 테스트도 쉽고 글로 설명하기도 쉽다.

## 구현 — 일정을 등급으로 환산하는 규칙

핵심은 `analyzeWeatherAlert(events, now)` 하나다. 가챠 이벤트를 보고 우선순위대로 등급을 정한다.

```ts
// 재난급: 3개 이상 동시 픽업
if (simultaneousPickups >= 3)         level = 'DISASTER';
// 소멸: 진행중이면서 7일 이내 종료 (막차)
else if (endingSoon.length > 0)       level = 'DISSIPATION';
// 경보: 진행중이거나 3일 이내 시작
else if (activePickups.length > 0 || upcomingSoon.length > 0) level = 'WARNING';
// 주의보: 7일 이내 시작 예정
else if (upcomingWeek.length > 0)     level = 'ADVISORY';
// 복구: 최근 점검 있었음
else if (hasRecentMaintenance)        level = 'RECOVERY';
// 평시
else                                  level = 'SAFE';
```

각 단계의 입력은 모두 날짜 산술로 뽑는다 — 예를 들어 "진행중 픽업"은:

```ts
const activePickups = gachaEvents.filter((e) => e.startDate <= now && e.endDate >= now);
```

등급이 정해지면 그 등급의 메시지 풀에서 하나를 골라 보여준다.
같은 "경보"라도 매번 같은 문구면 재미가 없어서 풀에서 랜덤으로 뽑는다:

```ts
const messages = WEATHER_ALERTS[level];
const alert = messages[Math.floor(Math.random() * messages.length)];
```

결과는 `{ level, alert, metadata }` — 등급, 표시용 메시지(아이콘·색), 그리고
`activePickups`/`upcomingInDays`/`simultaneousPickups` 같은 숫자 근거까지 함께 돌려준다.
UI는 이 한 덩어리만 받으면 "픽업 태풍 ⛈️ — 동시 진행 3건"을 그릴 수 있다.

## 막혔던 지점 / 삽질

**1. 날짜는 문자열로 오고, 비교는 Date로 해야 한다.**
백엔드 응답의 `startDate/endDate`는 ISO 문자열이다. 그대로 `<=`로 비교하면
사전식 비교가 돼서 가끔 맞고 가끔 틀린다. 캘린더 데이터를 받는 즉시 `Date`로 변환하는
경계를 명확히 두지 않아 초반에 "어떤 픽업은 진행중인데 안 잡히는" 버그를 만들었다.
→ 로드 단계에서 한 번에 파싱하도록 정리.

**2. "동시 픽업"의 정의가 애매했다.**
지금 코드는 `simultaneousPickups = activePickups.length`, 즉 "지금 이 순간 진행중인 픽업 수"로
재난급을 판정한다. 그런데 정작 유저가 체감하는 "몰림"은 *같은 날 시작*이나 *기간 겹침*에 더 가깝다.
일단 단순 버전으로 내보냈지만, 이건 정의를 더 다듬어야 할 지점으로 남겨뒀다(주석에도 표시).

**3. 랜덤 메시지 + 정적 빌드.**
`Math.random()`을 쓰는 부분이라 서버 렌더였으면 hydration 불일치가 났을 텐데,
이 프로젝트는 CSR(adapter-static)이라 클라이언트에서만 도므로 문제는 없었다.
다만 "왜 괜찮은지"를 알고 쓰는 것과 모르고 운 좋은 건 다르다 — 기록해둔다.

## 결과

- 여러 게임 이벤트를 한 타임라인에 모으고, 그 위에 **한 줄 기상특보**로 상황을 요약.
- 판정 로직이 순수 함수라 입력(이벤트 배열)만 주면 어디서든 재사용/테스트 가능.
- "계산(model) ↔ 표시(view) ↔ 좌표(utils)" 분리로 각 조각이 작게 유지됨.

> 기능 자체는 장난 같지만, 만들면서 얻은 건 진지하다: **도메인 규칙을 UI에서 떼어내
> 순수 함수로 두면, 글로 설명하기 쉬운 코드가 곧 테스트하기 쉬운 코드더라.**

## 다음 편 예고

다음은 사용자가 직접 만지는 기능 — 캐릭터를 드래그해서 순위를 매기는 **티어 리스트**.
SortableJS를 Svelte 5와 엮으면서 겪은 일을 쓴다.

**코드**: (GitHub 저장소 링크 — 발행 시 첨부)
