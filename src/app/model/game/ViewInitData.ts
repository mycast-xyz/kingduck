import type { GameSlug } from './GameInitConfig';

/**
 * 콘텐츠 뷰(ContentView)가 각 섹션 컴포넌트(MainItemView, SkillTreeView 등)에 넘기는
 * 초기화 컨텍스트. `getInitData()`가 게임 공통 필드 + 섹션별 `content.info[key]` 설정을
 * 병합해 만든다(redesign-plan F-T4).
 *
 * 섹션·게임마다 동적으로 붙는 필드가 있어 index signature(`any`)를 둔다. 자주 쓰이는
 * 공통 필드는 명시 타입으로 선언해 오타·자동완성 안전성을 확보한다.
 */
export interface ViewInitData {
	gameId?: GameSlug | 'Calendar';
	gameSlug?: string;
	name?: string;
	title?: string;
	color?: string;
	tabLabels?: string[];
	hasTabs?: boolean;
	// 섹션/게임별 동적 필드(rarity·rarityColors·list·props 등)
	[key: string]: any;
}
