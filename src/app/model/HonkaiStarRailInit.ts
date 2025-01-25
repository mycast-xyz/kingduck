export class HonkaiStarRailInit {
	init() {
		return {
			// 등급 정보
			rarity: {
				// 기본은 1~5 단위로 숫자로 매길것
				default: true,
				type: 'number',
				list: {
					'5': '정예',
					'4': '표준',
					'3': '구형',
					'2': '초기',
					'1': '초기'
				}
			},
			// 목록 표시 설정
			list: {
				// 캐릭터 목록 설정
				character: {
					view: true,
					type: {
						element: true, // 위상 속성
						path: true // 무기 속성
					},
					search: {
						text: true,
						attribute: {
							element: true, // 위상 속성
							path: true, // 무기 속성
							rarity: true // 등급 정보
						}
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
							name: '스킬',
							option: true,
							view: true
						},
						sub: {
							name: '',
							option: false,
							view: false
						}
					},
					// 돌파 정보
					gacha: {
						name: '성흔 돌파',
						option: true,
						view: true
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
