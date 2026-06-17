import type { GameInitConfig } from './GameInitConfig';

export class Reverse1999Init {
	init(): GameInitConfig {
		return {
			gameId: 'reverse1999',
			copyright: {
				title: 'KingDuck는 리버스: 1999 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description: '해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 Bluepoch에 있습니다.',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성 정보
			type: {
				elementType: {
					name: '속성',
					apiPoint: 'elementId',
					apiType: 'element',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false
				},
				positionType: {
					name: '포지션',
					apiPoint: 'positionId',
					apiType: 'position',
					isWhite: true,
					isTwoRow: false,
					isMenuOpen: false
				}
			},
			// 등급 정보
			rarity: {
				default: true,
				type: 'number',
				list: {
					'6': '6',
					'5': '5',
					'4': '4',
					'3': '3'
				},
				isMenuOpen: false
			},
			// 목록 표시 설정
			list: {
				character: {
					view: true,
					search: {
						text: true
					}
				},
				item: {
					view: true,
					search: {
						text: true,
						attribute: {
							element: true,
							position: true
						}
					}
				},
				card: {
					element: {
						display: 'iconUrl'
					},
					path: {
						display: true
					},
					rarityColors: {
						'6': {
							border: '#fcba49',
							background: '#fcba49',
							text: '#fcba49',
							gradient: {
								from: '#885550',
								to: '#fcba49',
								stop: '53%'
							}
						},
						'5': {
							border: '#9f66c8',
							background: '#9f66c8',
							text: '#9f66c8',
							gradient: {
								from: '#343659',
								to: '#9f66c8',
								stop: '53%'
							}
						},
						'4': {
							border: '#4175bb',
							background: '#4175bb',
							text: '#4175bb',
							gradient: {
								from: '#303051',
								to: '#4175bb',
								stop: '53%'
							}
						},
						'3': {
							border: '#6b7280',
							background: '#6b7280',
							text: '#6b7280',
							gradient: {
								from: '#1f2937',
								to: '#6b7280',
								stop: '53%'
							}
						}
					}
				}
			},
			// 상세 내용 표시 설정
			content: {
				image: {
					video: true,
					image: true
				},
				name: true,
				attribute: {
					element: true,
					position: true,
					corp: false
				},
				releaseDate: true,
				info: {
					mainItem: {
						name: '심상',
						view: true
					},
					item: {
						name: '유물',
						view: true,
						list: {
							psychube: {
								name: '심상',
								view: true
							}
						},
						option: {
							main: true,
							sub: true
						}
					},
					skill: {
						name: '캐릭터 스킬',
						option: { default: true },
						view: true,
						level: true
					},
					insight: {
						name: '통찰',
						option: { default: true },
						view: true,
						color: '#242a4d',
						level: true
					}
				}
			},
			layout: [
				{
					component: 'RankListView',
					dataKey: 'metadata',
					initDataKey: 'gacha',
					props: { title: '형상효율' }
				},
				{
					component: 'StatsView',
					dataKey: 'metadata',
					initDataKey: 'stats',
					props: { title: '광상 정보' }
				},
				{
					component: 'TraceListView',
					dataKey: 'builds',
					initDataKey: 'builds',
					props: { title: '공명변조' }
				},
				{
					component: 'EquipmentItemView',
					dataKey: 'builds',
					initDataKey: 'psychube',
					props: { title: '의지추천' }
				},
				{
					component: 'TeamRecommendationView',
					dataKey: 'teams',
					initDataKey: 'teams',
					props: { title: '사용 조합' }
				},
				/*
				{
					component: 'BuildRecommendationView',
					dataKey: 'resonance_recommendation',
					initDataKey: 'resonance_recommendation',
					props: { title: '공명추천' }
				},*/
				{
					component: 'CostumeView',
					dataKey: 'costume',
					initDataKey: 'costume',
					props: { title: '스킨정보' }
				}
			]
		};
	}

	setInit() {
		return this.init();
	}
}
