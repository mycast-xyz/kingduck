export interface GameInitConfig {
	gameId: string;
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
			apiPoint: string;
			isMenuOpen: boolean;
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
		| 'CalculatorView';
	dataKey: string;
	initDataKey?: string;
	props?: Record<string, any>;
}
