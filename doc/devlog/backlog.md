# 글 백로그 (다음 편 후보)

> 소재 고갈 방지용. 항상 2~3개를 채워둔다. 기능 개발하다 떠오른 글감도 여기에 즉시 메모.
> 발행 순서는 §dev_blog_plan §4-1 커리큘럼을 따르되, 그때그때 끝난 기능 우선으로 유연하게.

## 다음 발행 예정

### #2 — 다중 게임을 스키마 하나로: `metadata` 설계  ✅ 초안 완료 (`002-metadata-schema.md`)
- 원신·니케·스타레일은 속성 체계가 다 다른데 테이블을 게임마다 만들지 않은 이유
- `Game / Element / Character` 공통 구조 + 게임별 가변 데이터는 `metadata Json`
- 트레이드오프: 유연함 ↔ 타입 안전성 (제네릭으로 국소화)
- 글감 출처: `doc/multi_game_architecture.md`
- 관련 커밋: c999f0b, a58ffb1

### #3 — slug 기반 동적 라우팅과 게임별 컴포넌트 맵  ← 다음 초안 후보
- `/[gameSlug]/character/[id]` 하나로 모든 게임 상세를 처리
- 게임별로 다른 UI는 컴포넌트 맵(`{#if gameSlug === 'genshin'}`)으로 분기
- 막힌 지점 후보: SPA(CSR)에서 prerender/adapter-static 설정 이슈

## 아이디어 풀 (순서 미정)
- 티어리스트 드래그 정렬 — SortableJS 적용기 (`routes/tier-list`)
- 쿠폰 상태를 URL에 담기 — `lz-string` 압축 (`routes/coupon`)
- 크롤러로 게임 데이터 수집하기 (`admin/crawler`) ← 조회수 기대 소재
- 어드민 인증/권한 설계 (`routes/admin`, `app/service/auth`)
- 시스템 모니터링 대시보드 (`admin/monitor`, `doc/admin_system_monitoring.md`)
- AI(Claude/Gemini)에게 이 프로젝트를 어떻게 시켰나 + 무엇을 검증했나
