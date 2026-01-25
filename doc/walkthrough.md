# 백엔드 통합 워크스루

이 문서는 프론트엔드를 `kingduck-server` 백엔드와 통합하기 위해 수행된 변경 사항을 상세히 설명합니다.

## 변경 사항 개요

### 1. 중앙 집중식 API 클라이언트

- `src/service/api/client.ts` 생성: 환경 변수에서 기본 URL을 로드하는 설정된 Axios 인스턴스. (원래 `src/lib`에 있었으나 요청에 따라 이동됨)
- `.env` 및 `.env.example` 생성: `PUBLIC_API_BASE_URL=http://localhost:3000` 설정.

### 2. 서비스 리팩토링

기존 서비스 및 라우트 로드 함수가 하드코딩된 URL 대신 새 클라이언트를 사용하도록 리팩토링했습니다.

- **서비스**: `src/app/service/character/CharacterListService.ts`
- **라우트**:
  - `src/routes/+layout.ts` (전역 게임 목록)
  - `src/routes/+page.ts`
  - `src/routes/list/[slug]/+page.ts`
  - `src/routes/content/[gameEnName]/[characterId]/+page.ts`
  - `src/routes/admin/[slug]/[id]/+page.ts`

### 3. 관리자 컴포넌트

관리자 컴포넌트가 중앙 클라이언트를 사용하여 데이터를 가져오도록 업데이트했습니다.

- `src/app/view/admin/list/AdminGameList.svelte`
- `src/app/view/admin/list/AdminCharacterList.svelte` (페이지네이션 타입 추론 문제 수정)

## 검증 단계

통합을 검증하려면 다음 단계를 수행하세요:

1.  **백엔드 실행 확인**: `kingduck-server`를 3000번 포트에서 시작합니다.
2.  **프론트엔드 시작**: `pnpm run dev`를 실행합니다.
3.  **게임 목록 확인**: 사이드 메뉴에 게임 목록이 나타나는지 확인합니다 (`+layout.ts`에 의해 로드됨).
4.  **캐릭터 목록 확인**: 특정 게임 페이지(예: `/list/HonkaiStarRail`)로 이동하여 캐릭터 로딩을 확인합니다.
5.  **관리자 페이지 확인**: `/admin/game` 또는 `/admin/character`로 이동하여 목록 및 페이지네이션이 올바르게 로드되는지 확인합니다.

> [!TIP]
> 백엔드 URL을 변경해야 하는 경우 `.env` 파일의 `PUBLIC_API_BASE_URL`을 업데이트하고 개발 서버를 재시작하면 됩니다.
