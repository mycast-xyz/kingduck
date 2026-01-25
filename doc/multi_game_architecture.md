# 다중 게임 지원 아키텍처 계획 (Multi-Game Architecture Plan)

이 문서는 **원신, 붕괴: 스타레일, 명조, 니케, 리버스: 1999** 등 5종 이상의 게임 정보를 단일 플랫폼에서 서비스하기 위한 아키텍처 계획입니다.
이미 구축된 `kingduck-server`의 데이터베이스 스키마를 기반으로 프론트엔드 연동 전략을 수립합니다.

## 1. 개요 (Overview)

- **Frontend**: SvelteKit (SPA/CSR)
- **Backend**: Kingduck-Server (Node.js/Express)
- **Database**: PostgreSQL (구축 완료)
- **ORM**: Prisma (스키마 확인 완료)

## 2. 데이터베이스 스키마 분석 (Prisma)

`kingduck-server/prisma/schema.prisma` 파일을 분석한 결과, 다음과 같은 구조로 다중 게임을 지원합니다.

### 2.1 Game 모델 (기준 정보)

모든 데이터의 뿌리가 되는 게임 정보입니다.

- **주요 필드**: `slug` (URL 경로용), `name`, `iconUrl` (`icon_url` 매핑)
- **전략**: 프론트엔드 앱 실행 시(또는 `+layout.ts`) 전체 게임 목록을 가져와 GNB(Global Navigation Bar)를 구성합니다.

### 2.2 Element 및 Path (속성/경로)

게임마다 다른 속성 시스템(원신: 원소, 스타레일: 운명의 길/속성, 니케: 코드/버스트 등)을 `Element` 테이블 하나로 통합 관리합니다.

- **필드**: `gameId`, `name`, `type` ("DamageType", "Path" 등 구분), `iconUrl`
- **전략**: 게임별 필터 메뉴 생성 시 이 테이블을 조회하여 동적으로 필터를 생성합니다.

### 2.3 Character 모델 (유연한 구조)

- **공통 필드**: `name`, `rarity`, `weaponType`, `role`, `description`, `imageUrl`
- **관계**: `gameId`, `elementId`, `pathId`
- **가변 데이터 (`metadata Json?`)**: 게임별로 상이한 데이터는 JSON 필드에 저장됩니다.
  - 예) 원신: `{ "constellation": [...] }` (운명의 자리)
  - 예) 니케: `{ "burstType": "III", "manufacturer": "Missilis" }`

### 2.4 Item 모델

- **필드**: `name`, `type`, `rarity`, `description`, `imageUrl`, `metadata` (JSON)
- **전략**: 무기, 장비, 재료 등을 통합 관리하며 `type`으로 구분합니다.

## 3. 프론트엔드 아키텍처 전략

### 3.1 라우팅 및 URL

DB의 `Game.slug`를 URL 파라미터로 적극 활용합니다.

- `/[gameSlug]` (예: `/genshin`) -> 게임 대시보드
- `/[gameSlug]/character` -> 캐릭터 목록
- `/[gameSlug]/character/[id]` -> 캐릭터 상세
- `/[gameSlug]/item` -> 아이템 목록

### 3.2 데이터 페칭 및 타입 (Types)

백엔드 응답 `metadata`가 `JSON` 타입이므로, 프론트엔드에서 제네릭을 활용하여 타입을 안전하게 처리해야 합니다.

```typescript
// 공통 인터페이스
interface Character<T = any> {
	id: number;
	name: string;
	gameId: number;
	metadata: T; // 게임별 인터페이스 주입
	// ...
}

// 게임별 메타데이터 인터페이스
interface GenshinMeta {
	vision: string;
	constellation: string[];
}

interface NikkeMeta {
	burstCd: number;
	manufacturer: string;
}
```

### 3.3 동적 상세 페이지 (Dynamic Detail Page)

캐릭터 상세 페이지(`[id]/+page.svelte`)는 하나지만, 내부 콘텐츠는 게임별로 달라야 합니다.

- **방법**: `gameSlug` 또는 `gameId`에 따라 다른 컴포넌트를 렌더링하도록 `Component Map`을 구성합니다.
  ```svelte
  <!-- CharacterDetail.svelte -->
  {#if gameSlug === 'genshin'}
  	<GenshinDetailInfo data={character.metadata} />
  {:else if gameSlug === 'nikke'}
  	<NikkeDetailInfo data={character.metadata} />
  {/if}
  ```

## 4. 구현 로드맵

### Phase 1: 라우팅 및 공통 데이터 연동

- [ ] 메인 메뉴(`DesktopListMenu`)가 `Game` 테이블 데이터를 기반으로 렌더링되도록 수정 (완료됨)
- [ ] 캐릭터 목록 페이지가 `slug`에 따라 해당 게임의 캐릭터만 필터링해서 가져오도록 `CharacterListService` 수정 (완료됨)

### Phase 2: 상세 페이지 및 메타데이터 처리

- [ ] `metadata` JSON 필드를 파싱하여 표시하는 로직 구현
- [ ] 게임별 특수 정보(니케 버스트, 원신 운명의 자리 등)를 보여줄 하위 컴포넌트 개발

### Phase 3: 관리자 기능 확장

- [ ] 관리자 페이지에서 `metadata` JSON을 편리하게 입력할 수 있는 동적 폼(Form) 개발
