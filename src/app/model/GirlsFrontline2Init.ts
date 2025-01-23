const GirlsFrontline2Init = {
	// 게임 기본 정보
	title: '소녀전선2: 망명',
	href: '/list/GirlsFrontline2',
	image: '/assets/game/GirlsFrontline2.webp',
	// 등급 정보
	rarity: {
		// 기본은 1~5 단위로 숫자로 매길것
		default: false,
		list: {
			'5': '정예',
			'4': '표준',
			'3': '구형'
		}
	},
	// 목록 표시 설정
	list: {
		// 캐릭터 목록 설정
		character: {
			view: true,
			search: {
				text: true,
				attribute: {
					element: true, // 위상 속성
					path: true, // 무기 속성
					corp: true // 직업 정보
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
					corp: false // 소속 정보
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
