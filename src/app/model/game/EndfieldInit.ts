import type { GameInitConfig } from './GameInitConfig';

export class EndfieldInit {
	init(): GameInitConfig {
		return {
			gameId: 'endfield',
			copyright: {
				title: 'KingDuck는 명일방주: 엔드필드 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description: '해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 Hypergryph에 있습니다.',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성 정보
			type: {
				DamageType: {
					name: '속성',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Physical: '물리',
						Heat: '화염',
						Electric: '전기',
						Cryo: '얼음',
						Nature: '자연'
					}
				},
				baseTypeChar: {
					name: '무기유형',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: true,
					isTwoRow: false,
					isMenuOpen: false,
					cols: 2,
					list: {
						Sword: '한손검',
						Greatsword: '양손검',
						Polearm: '장병기',
						Handcannon: '핸드캐논',
						'Arts Unit': '아츠 유닛'
					}
				}
			},
			// 등급 정보
			rarity: {
				default: true,
				type: 'number',
				list: {
					'6': '6',
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
					rarityIcon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="OperatorEditCard__Rank-ilQzgD dcsdby"><g fill-rule="evenodd" clip-path="url(#rank_svg__a)" clip-rule="evenodd"><path fill="#ffffff" d="m5.845 17.424 6.369-3.667L9.605 9.25.87 14.28zm17.249.69-6.37-3.678-2.608 4.519 8.736 5.043zM20.417 0 15.2 2.686v7.07h5.217z" opacity="0.6"></path><path fill="#ffffff" d="m8.298 16.03 3.765-2.174-2.609-4.518-1.957 1.13s2.051 4.325.8 5.562m12.343.668-3.765-2.174-2.61 4.518 1.959 1.13s2.72-3.939 4.416-3.474m-.224-9.202S15.49 7.266 15.2 5.41v4.348h5.217z" opacity="0.502"></path><path fill="#ffffff" d="m13.922 9.77-.136-6.147L9.42 6.145l.008 6.622c.29 2.125-1.28 3.35-1.28 3.35l4.519-2.61c1.53-1.238 1.256-3.737 1.256-3.737m3.887 3.639 5.391 2.957v-5.044l-5.74-3.304c-2.141-.655-2.26-2.783-2.26-2.783v5.217c.15 2.103 2.609 2.957 2.609 2.957m-5.4 1.547-5.257 3.191 4.368 2.522 5.731-3.318c1.695-1.314 3.54-.567 3.54-.567l-4.518-2.608c-1.839-.707-3.865.78-3.865.78"></path></g><defs><clipPath id="rank_svg__a"><path fill="#fff" d="M0 0h24v24H0z"></path></clipPath></defs></svg>`,
					rarityColors: {
						'6': {
							border: '#ba580f',
							background: '#ff8012',
							text: '#ff8012',
							gradient: {
								from: '#ba580f',
								to: '#ff8012',
								stop: '53%'
							}
						},
						'5': {
							border: '#d69f13',
							background: '#ffc412',
							text: '#d69f13',
							gradient: {
								from: '#d69f13',
								to: '#ffc412',
								stop: '53%'
							}
						},
						'4': {
							border: '#7a49bc',
							background: '#a562ff',
							text: '#7a49bc',
							gradient: {
								from: '#a562ff',
								to: '#7a49bc',
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
						name: '무기',
						view: true
					},
					item: {
						name: '장비',
						view: true,
						list: {
							relics: {
								name: '장비',
								view: true
							}
						},
						option: {
							main: true,
							sub: true
						}
					},
					skill: {
						name: '스킬',
						option: { default: true },
						view: true,
						level: true
					},
					gacha: {
						name: '돌파',
						option: { default: true },
						view: true,
						color: '#242a4d',
						level: false
					}
				}
			},
			layout: [
				{ component: 'StatsView', dataKey: 'metadata', props: { title: '기초 속성' } },
				{
					component: 'SkillTreeView',
					dataKey: 'metadata',
					props: {
						title: '전투 스킬',
						vmType: 'combat'
					}
				},
				{
					component: 'SkillTreeView',
					dataKey: 'metadata',
					props: {
						title: '스킬',
						vmType: 'passive'
					}
				},
				{
					component: 'TraceListView',
					dataKey: 'factorySkills',
					props: {
						title: '기지스킬',
						cols: 2,
						vmType: 'factory'
					}
				},
				{
					component: 'RankListView', // Reusing RankListView for Potentials
					dataKey: 'metadata',
					props: {
						title: '잠재력 및 패시브',
						vmType: 'potential'
					}
				},
				// Note: Recommendations might be empty if data isn't available
				{
					component: 'BuildRecommendationView',
					dataKey: 'recommendations',
					props: { title: '추천 세팅' }
				},
				{ component: 'CalculatorView', dataKey: 'talentNodeMap', props: { title: '성장 계산기' } }, // XP/Ascension Calc
				// NteMaterialView = 범용 {name,icon,amount} 그리드(게임 무관). 선호 선물 노출.
				{ component: 'NteMaterialView', dataKey: 'bestGifts', props: { title: '선호 선물' } },
				{ component: 'EndfieldProfileView', dataKey: 'metadata', props: { title: '캐릭터 정보' } }
			]
		};
	}

	setInit() {
		return this.init();
	}
}
