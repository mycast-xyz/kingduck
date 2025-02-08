export class HonkaiStarRailInit {
	init() {
		return {
			gameId: 'HonkaiStarRail',
			copyright: {
				title: 'KingDuck는 붕괴: 스타레일 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description: '해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 HoYoverse에 있습니다.',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성 정보
			type: {
				damageType: {
					name: '속성',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false
				}, // 위상 속성
				baseTypeChar: {
					name: '운명의 길',
					isWhite: true,
					isTwoRow: false,
					isMenuOpen: false
				} // 위상 속성 // 무기 속성
			},
			// 등급 정보
			rarity: {
				// 기본은 1~5 단위로 숫자로 매길것
				default: true,
				type: 'number',
				list: {
					'5': '5',
					'4': '4',
					'3': '3'
				},
				isMenuOpen: false
			},
			// 목록 표시 설정
			list: {
				// 캐릭터 목록 설정
				character: {
					view: true,
					search: {
						text: true
					}
				},
				// 아이템 목록 설정
				item: {
					view: true,
					search: {
						text: true,
						attribute: {
							element: false, // 위상 속성
							path: true // 무기 속성
						}
					}
				}
			},
			// 상세 내용 표시 설정
			content: {
				// 이미지/영상 표시 설정
				image: {
					video: true,
					image: true
				},
				name: true,
				// 캐릭터 속성 표시 설정
				attribute: {
					element: true, // 위상 속성
					path: true, // 무기 속성
					corp: false // 소속 정보
				},
				releaseDate: true,
				// 상세 정보 표시 설정
				info: {
					// 주 장비 정보
					mainItem: {
						name: '광추',
						view: true
					},
					// 아이템 정보
					item: {
						view: true,
						name: '유물',
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
					// 스킬 정보
					skill: {
						main: {
							name: '캐릭터 스킬',
							option: true,
							view: true,
							level: true
						}
					},
					// 돌파 정보
					gacha: {
						name: '성흔 돌파',
						option: true,
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

	constructor() {
		// 초기화 로직
	}
}
