import type { GameInitConfig } from './GameInitConfig';

export class HonkaiStarRailInit {
	init(): GameInitConfig {
		return {
			gameId: 'HonkaiStarRail',
			copyright: {
				title: 'KingDuck는 붕괴: 스타레일 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 HoYoverse에 있습니다. 참조 사이트 ',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성 정보 (damageType -> elementId, baseTypeChar -> elementId handled by service)
			type: {
				DamageType: {
					name: '속성',
					apiPoint: 'elementId',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false
				},
				baseTypeChar: {
					name: '운명의 길',
					apiPoint: 'pathId',
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
			}
		};
	}

	setInit() {
		return this.init();
	}
}
