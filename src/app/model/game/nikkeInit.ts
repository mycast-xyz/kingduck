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
			// 필터 — elementId/pathId 기준(서버 필터)과 metadata 투영 필드(클라이언트 필터) 혼용.
			// clientFilter:true 타입은 백엔드가 $queryRaw로 metadata->>'key' 3필드를 투영하고
			// applyFilter()가 char.class/corp/burst 로 메모리 필터한다.
			// DB Element 기반 필터(elementType/weaponType)의 list 키는 Element.name 과 일치해야 한다.
			type: {
				elementType: {
					// 코드(속성)
					name: '코드',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Fire: '작열',
						Water: '수냉',
						Wind: '풍압',
						Iron: '철갑',
						Electric: '전격'
					}
				},
				weaponType: {
					// 무기
					name: '무기',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: true,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						AR: '돌격소총',
						SMG: '기관단총',
						SG: '샷건',
						MG: '미니건',
						RL: '런처',
						SR: '저격소총'
					}
				},
				classType: {
					// 클래스 (metadata.class — 클라이언트 필터)
					name: '클래스',
					apiPoint: 'class',
					clientFilter: true,
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Attacker: '화력형',
						Defender: '방어형',
						Supporter: '지원형'
					}
				},
				corpType: {
					// 기업 (metadata.corp — 클라이언트 필터)
					name: '기업',
					apiPoint: 'corp',
					clientFilter: true,
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						ELYSION: '엘리시온',
						MISSILIS: '미실리스',
						TETRA: '테트라',
						PILGRIM: '필그림',
						ABNORMAL: '어비스'
					}
				},
				burstType: {
					// 버스트 단계 (metadata.burst — 클라이언트 필터)
					name: '버스트',
					apiPoint: 'burst',
					clientFilter: true,
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						Step1: 'Ⅰ',
						Step2: 'Ⅱ',
						Step3: 'Ⅲ',
						AllStep: '전단계'
					}
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
				},
				// 카드 표시 설정 — 니케 등급 색상(SSR 금 / SR 보라 / R 파랑)
				card: {
					path: { display: false },
					rarityColors: {
						'5': {
							border: '#fcba49',
							background: '#fcba49',
							text: '#fcba49',
							gradient: { from: '#885550', to: '#c9a36a', stop: '53%' }
						},
						'4': {
							border: '#9f66c8',
							background: '#9f66c8',
							text: '#9f66c8',
							gradient: { from: '#343659', to: '#8a5fcc', stop: '53%' }
						},
						'3': {
							border: '#4175bb',
							background: '#4175bb',
							text: '#4175bb',
							gradient: { from: '#303051', to: '#4175bb', stop: '53%' }
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
			},
			layout: [
				{ component: 'NikkeProfileView', dataKey: 'metadata', props: { title: '캐릭터 정보' } },
				{ component: 'StatsView', dataKey: 'stats', props: { title: '기초 스탯' } },
				{ component: 'SkillTreeView', dataKey: 'skills', props: { title: '스킬' } },
				{ component: 'CostumeView', dataKey: 'costumes', props: { title: '코스튬' } }
			]
		};
	}

	setInit() {
		return this.init();
	}

	constructor() {
		// 초기화 로직
	}
}
