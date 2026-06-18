import type { GameInitConfig } from './GameInitConfig';

export class HonkaiStarRailInit {
	init(): GameInitConfig {
		return {
			gameId: 'starrail',
			copyright: {
				title: 'KingDuck는 붕괴: 스타레일 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 HoYoverse에 있습니다. 참조 사이트 : https://hakush.in/',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성 정보 (damageType -> elementId, baseTypeChar -> elementId handled by service)
			type: {
				DamageType: {
					name: '속성',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Ice: '얼음',
						Wind: '바람',
						Fire: '화염',
						Imaginary: '허수',
						Thunder: '번개',
						Quantum: '양자',
						Physical: '물리'
					}
				},
				baseTypeChar: {
					name: '운명의 길',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: true,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Knight: '보존',
						Rogue: '수렵',
						Mage: '지식',
						Warlock: '공허',
						Warrior: '파멸',
						Shaman: '화합',
						Priest: '풍요',
						Memory: '기억',
						Elation: '환락'
					}
				}
			},
			// 등급 정보
			rarity: {
				default: true,
				type: 'number',
				list: {
					'5': '5',
					'4': '4'
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
							element: false,
							path: true
						}
					}
				},
				card: {
					element: {
						display: 'iconUrl',
						mobilePath: '/assets/image/{gameSlug}/elements/{elementName}.webp'
					},
					path: {
						display: true
					},
					rarityColors: {
						'5': {
							border: '#fcba49',
							background: '#fcba49',
							text: '#fcba49',
							gradient: {
								from: '#885550',
								to: '#c9a36a',
								stop: '53%'
							}
						},
						'4': {
							border: '#9f66c8',
							background: '#9f66c8',
							text: '#9f66c8',
							gradient: {
								from: '#343659',
								to: '#8a5fcc',
								stop: '53%'
							}
						},
						'3': {
							border: '#4175bb',
							background: '#4175bb',
							text: '#4175bb',
							gradient: {
								from: '#303051',
								to: '#4175bb',
								stop: '53%'
							}
						},
						'2': {
							border: '#4b6c67',
							background: '#4b6c67',
							text: '#4b6c67',
							gradient: {
								from: '#4b6c67',
								to: '#519072',
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
					path: true,
					corp: false
				},
				releaseDate: true,
				info: {
					mainItem: {
						name: '광추',
						view: true
					},
					item: {
						name: '유물',
						view: true,
						list: {
							relics: {
								name: '터널 유물',
								view: true
							},
							accessories: {
								name: '차원 유물',
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
					gacha: {
						name: '성흔 돌파',
						option: { default: true },
						view: true,
						color: '#242a4d',
						level: false
					}
				}
			},
			layout: [
				// 추천 빌드(genshin.gg/star-rail 큐레이션) — 백엔드 StarRailBuildScraper가 채운다.
				// metadata.lightcones(광추 originalId 배열) / relics({Set4IDList,Set2IDList}) / teams.
				{ component: 'MainItemView', dataKey: 'lightcones', props: { title: '추천 광추' } },
				{ component: 'BuildRecommendationView', dataKey: 'relics', props: { title: '추천 유물' } },
				{ component: 'TeamRecommendationView', dataKey: 'teams', props: { title: '추천 파티' } },
				{ component: 'StatsView', dataKey: 'stats', props: { title: '기초 속성' } },
				{
					component: 'SkillTreeView',
					dataKey: 'skills',
					props: {
						title: '캐릭터 스킬'
					}
				},
				{
					component: 'RankListView',
					dataKey: 'ranks_raw',
					initDataKey: 'gacha',
					props: { title: '성혼' }
				},
				{ component: 'TraceListView', dataKey: 'skill_tree', props: { title: '행적' } },
				{ component: 'CostumeView', dataKey: 'costumes', props: { title: '코스튬' } },
				{ component: 'StoryView', dataKey: 'stories', props: { title: '캐릭터 스토리' } },
				{ component: 'VoiceView', dataKey: 'voiceLines', props: { title: '음성 대사' } },
				{ component: 'CalculatorView', dataKey: 'calculator', props: { title: '재화 계산기' } }
			],
			coupon: {
				name: '리딤코드'
			}
		};
	}

	setInit() {
		return this.init();
	}
}
