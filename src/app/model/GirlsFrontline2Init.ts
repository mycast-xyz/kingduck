export class GirlsFrontline2Init {
	init() {
		return {
			gameId: 'GirlsFrontline2Exilium',
			// 등급 정보
			rarity: {
				// 기본은 1~5 단위로 숫자로 매길것
				default: false,
				type: 'string',
				list: {
					'5': '정예',
					'4': '표준',
					'3': '구형',
					'2': '초기',
					'1': '초기'
				},
				attribute: {
					element: true, // 위상 속성
					path: true, // 무기 속성
					corp: true // 직업 정보
				}
			},
			// 목록 표시 설정
			list: {
				// 캐릭터 목록 설정
				character: {
					view: true,
					type: {
						element: true, // 위상 속성
						path: true, // 무기 속성
						corp: true // 직업 정보
					},
					search: {
						text: true,
						attribute: {
							element: true, // 위상 속성
							path: true, // 무기 속성
							corp: true, // 직업 정보
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
							path: false, // 무기 속성
							corp: false, // 소속 정보
							rarity: true // 등급 정보
						}
					}
				}
			},
			// 상세 내용 표시 설정
			content: {
				// 이미지/영상 표시 설정
				image: {
					video: false,
					image: true
				},
				name: true,
				// 캐릭터 속성 표시 설정
				attribute: {
					element: true, // 위상 속성
					path: true, // 무기 속성
					corp: true // 소속 정보
				},
				releaseDate: true,
				// 상세 정보 표시 설정
				info: {
					// 주 장비 정보
					mainItem: {
						name: '인형 무기',
						view: true
					},
					// 아이템 정보
					item: {
						view: false,
						name: '',
						list: {},
						option: {}
					},
					// 스킬 정보
					skill: {
						main: {
							name: '스킬',
							option: true,
							view: true
						},
						sub: {
							name: '뉴럴 헬릭스',
							option: true,
							view: true
						}
					},
					// 돌파 정보
					gacha: {
						name: '마인드보강',
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
