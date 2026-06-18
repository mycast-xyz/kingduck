// 게임 식별자는 slug 하나로 통일한다(과거엔 enum 이름·숫자 DB id·slug가 혼용됐다 — F-B3).
// 새 게임을 추가하면 이 유니온과 GameRegistry에 등록한다.
export type GameSlug =
	| 'starrail'
	| 'genshin'
	| 'wutheringwaves'
	| 'reverse1999'
	| 'endfield'
	| 'nikke'
	| 'zzz'
	| 'GirlsFrontline2Exilium';

export interface GameInitConfig {
	// 게임 slug. 'Calendar'는 게임이 아닌 캘린더 전용 특수 설정.
	gameId: GameSlug | 'Calendar';
	copyright: {
		title: string;
		description: string;
		author: string;
		authorEmail: string;
		authorName: string;
	};
	type: {
		[key: string]: {
			name: string;
			isWhite: boolean;
			isTwoRow: boolean;
			// 일부 게임(예: nikke·GirlsFrontline2)은 필터가 API 파라미터에 매핑되지 않아 생략한다.
			// 소비처(ListFilterMenu)는 `?.apiPoint || key` 식으로 undefined를 이미 처리한다.
			apiPoint?: string;
			apiType?: string;
			isMenuOpen: boolean;
			cols?: number; // 필터 목록의 열 개수 (기본값: 자동 또는 CSS 지정값)
			list?: Record<string, string>;
		};
	};
	rarity: {
		default: boolean;
		type: 'number' | 'string';
		list: Record<string, string>;
		attribute?: Record<string, boolean>;
		isMenuOpen: boolean;
	};
	list: {
		character: {
			view: boolean;
			search: {
				text: boolean;
			};
		};
		item: {
			view: boolean;
			search: {
				text: boolean;
				attribute: Record<string, boolean>;
			};
		};
		card?: {
			// 카드 뷰 설정
			element?: {
				display: 'iconUrl' | 'path'; // iconUrl: API에서 받은 경로, path: 하드코딩된 경로
				mobilePath?: string; // 모바일에서 사용할 경로 패턴 (예: '/assets/image/{gameSlug}/elements/{elementName}.webp')
			};
			path?: {
				display: boolean; // path 속성 표시 여부
			};
			rarityColors?: Record<
				string,
				{
					border: string;
					background: string;
					text: string;
					gradient?: {
						from: string;
						to: string;
						stop: string;
					};
				}
			>;
			rarityIcon?: string;
		};
	};
	content: {
		image: {
			video: boolean;
			image: boolean;
		};
		name: boolean;
		attribute: Record<string, boolean>;
		releaseDate: boolean;
		info: Record<
			string,
			{
				name: string;
				view: boolean;
				list?: Record<string, { name: string; view: boolean }>;
				option?: Record<string, boolean>;
				color?: string;
				level?: boolean;
			}
		>;
	};
	coupon?: {
		name: string;
	};
	layout?: ComponentLayout[];
}

export interface ComponentLayout {
	component:
		| 'MainItemView'
		| 'EquipmentItemView'
		| 'CarouselListView'
		| 'SkillTreeView'
		| 'RankListView'
		| 'TraceListView'
		| 'BuildRecommendationView'
		| 'StatsView'
		| 'CostumeView'
		| 'CalculatorView'
		| 'TeamRecommendationView'
		| 'ProfileView'
		| 'StoryView'
		| 'VoiceView'
		| 'EndfieldProfileView'
		| 'Reverse1999ProfileView'
		| 'NikkeProfileView'
		| 'ZzzProfileView';
	dataKey: string;
	initDataKey?: string;
	props?: Record<string, any>;
}
