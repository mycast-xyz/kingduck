export class nikkeInit {
	init() {
		return {
			gameId: 'nikke',
			copyright: {
				title: 'KingDuck는 승리의 여신: 니케 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description: '해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 시프트업에 있습니다.',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성 정보
			type: {
				manufacturerType: {
					// 소속 속성
					name: '기업소속',
					isWhite: true,
					isTwoRow: true,
					isMenuOpen: false
				},
				weaponType: {
					// 무기 속성
					name: '무기',
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false
				},
				elementType: {
					// 속성 타입
					name: '코드',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false
				},
				classType: {
					// 속성 타입
					name: '클래스',
					isWhite: true,
					isTwoRow: true,
					isMenuOpen: false
				},
				burstType: {
					// 속성 타입
					name: '버스트',
					isWhite: true,
					isTwoRow: true,
					isMenuOpen: false
				}
			},
			// 등급 정보
			rarity: {
				// 기본은 1~5 단위로 숫자로 매길것
				default: false,
				type: 'string',
				list: {
					'5': 'SSR',
					'4': 'SR',
					'3': 'R'
				},
				attribute: {
					element: true, // 위상 속성
					path: true, // 무기 속성
					corp: true // 직업 정보
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
					video: true,
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
							view: true,
							color: '#373f46',
							level: false
						}
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
