# 팀 에이전트 하네스 (kingduck)

이 폴더의 `*.md`는 Claude Code **서브에이전트** 정의다. 작업 성격에 맞는 전문 에이전트에게
일을 위임하면, 각자 자기 영역의 컨벤션(`CLAUDE.md` / `doc/ARCHITECTURE.md` 기반)을 지키며 작업한다.

## 팀 구성

| 에이전트 | 담당 | 언제 쓰나 |
|----------|------|-----------|
| **game-integrator** | 게임별 설정(`model/game/*Init.ts`), slug 등록 | 새 게임 추가, 필터/등급/레이아웃 수정 |
| **frontend-builder** | Svelte 5 컴포넌트, 페이지, Tailwind, 모달/토스트 | UI 만들기·수정, 반응형 |
| **api-service-dev** | 서비스, axios client, `+page.ts` load, API 타입, 인증 | 데이터 페치, 엔드포인트 연동, 타입 |
| **admin-builder** | `routes/admin/**`, 어드민 컴포넌트/서비스 | 어드민 패널(크롤러/이벤트/유저/모니터) |
| **kingduck-reviewer** | 컨벤션·아키텍처 리뷰 (읽기 전용) | 기능 완성 후 커밋 전 점검 |

## 권장 워크플로우

```
1) 데이터/API가 필요하면      → api-service-dev 가 +page.ts·서비스·타입 준비
2) 새 게임이면               → game-integrator 가 Init·slug 등록
3) 화면을 만든다             → frontend-builder (어드민이면 admin-builder)
4) 완성 후                   → kingduck-reviewer 로 리뷰 → 지적사항 반영 → 커밋
```

독립적인 작업은 여러 에이전트를 **병렬**로 띄워도 된다(예: 캐릭터 화면과 캘린더 화면).
서로 같은 파일을 건드리는 작업은 순차로.

## 실행 모델 (Opus 오케스트레이션 + Sonnet 구현)
- 메인 세션(오케스트레이터)은 **Opus**가 맡아 계획·위임·검증을 한다.
- 위 5개 팀 에이전트는 frontmatter에 **`model: sonnet`** 으로 고정되어, 실제 구현은 Sonnet이 수행한다.
  (비용 효율 + Opus는 판단/검증에 집중)

## 호출 방법
- 메인 세션에서 작업을 설명하면, 위 description에 맞는 에이전트가 자동 선택되거나
  `@<agent-name>` 형태로 명시해 위임할 수 있다.
- 모든 에이전트는 작업 후 `pnpm run check`(프론트) / `pnpm build`(백엔드) 통과를 확인하고 변경 요약을 보고하도록 지시돼 있다.

> ⚠️ **로딩 주의**: 서브에이전트 정의는 Claude Code **세션 시작 시** 로드된다.
> 이 폴더의 파일을 새로 만들거나 고친 직후에는 **세션을 새로 시작해야** `subagent_type: game-integrator` 처럼
> 이름으로 호출된다. 그 전까지는 `general-purpose` + `model: sonnet`로 동일 모델·동일 지시를 인라인 위임하면 결과는 같다.

## 유지보수
- 아키텍처가 바뀌면 `CLAUDE.md`·`doc/ARCHITECTURE.md`를 먼저 갱신하라. 에이전트들이 이 둘을 근거로 동작한다.
- 새 도메인(예: 길드/랭킹)이 생기면 전용 에이전트를 추가하는 것을 고려.
