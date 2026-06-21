import type { GameInitConfig } from './GameInitConfig';

/**
 * 브라운더스트2(BrownDust II) 게임 설정.
 *
 * 개발사: 네오위즈(Neowiz). 2D 다크 판타지 턴제 전략 RPG.
 * slug: 'browndust2'
 *
 * 필터:
 *  - elementType: 속성(화염/냉기/전격/빛/어둠) — DB Element(DamageType) 기반. Element 시드 필요.
 *  - classType: 직업(전사/궁수/마법사/사제/격투가) — clientFilter(metadata.jobClass → char.class 투영).
 *
 * 희귀도: SSR(4) / SR(3) / R(2) / N(1) 4단계.
 * 코스튬이 핵심 수익 모델 → CostumeView를 레이아웃 최상단에 배치.
 *
 * Phase 0 — 빈 껍데기 등록. 백엔드 Game 행·크롤러·Element 시드는 별도 태스크.
 * Phase 2 TODO: BrownDust2ProfileView 전용 뷰(직업·속성·기본 스탯) — doc/browndust2-new-game-plan.md §3-1.
 */
export class BrownDust2Init {
	init(): GameInitConfig {
		return {
			gameId: 'browndust2',
			copyright: {
				title:
					'KingDuck는 브라운더스트2(BrownDust II) 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 네오위즈(Neowiz)에 있습니다.',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성(DamageType, DB Element 기반) + 직업(clientFilter — char.class 투영)
			type: {
				elementType: {
					name: '속성',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					// 키 = Element.name(영문), 값 = 한글 라벨. 백엔드 Element 시드 키와 일치해야 한다.
					list: {
						Fire: '화염',
						Ice: '냉기',
						Thunder: '전격',
						Light: '빛',
						Dark: '어둠'
					}
				},
				classType: {
					// 직업 (metadata.jobClass → 백엔드 $queryRaw 투영 → char.class)
					// clientFilter=true: DB elements 미사용. Init.list 키로 옵션 생성 + applyFilter 클라이언트 필터.
					name: '직업',
					apiPoint: 'class',
					clientFilter: true,
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					// 키는 백엔드 CharacterScraper가 metadata.jobClass에 적재할 영문 값과 1:1 매핑.
					// (스파이크 단계에서 실제 소스 키 확정 후 필요 시 조정 — Phase 1)
					list: {
						Warrior: '전사',
						Archer: '궁수',
						Mage: '마법사',
						Priest: '사제',
						Fighter: '격투가'
					}
				}
			},
			// 희귀도: SSR(4) / SR(3) / R(2) / N(1)
			rarity: {
				default: false,
				type: 'string',
				list: {
					'4': 'SSR',
					'3': 'SR',
					'2': 'R',
					'1': 'N'
				},
				isMenuOpen: false
			},
			// 목록·카드 표시 설정
			list: {
				character: {
					view: true,
					search: { text: true }
				},
				item: {
					view: false,
					search: { text: true, attribute: {} }
				},
				// 카드 등급 색상 (기획안 §3-1 카드 색상 표)
				card: {
					path: { display: false },
					rarityColors: {
						'4': {
							// SSR — 금
							border: '#fcba49',
							background: '#fcba49',
							text: '#fcba49',
							gradient: { from: '#885550', to: '#c9a36a', stop: '53%' }
						},
						'3': {
							// SR — 보라
							border: '#9f66c8',
							background: '#9f66c8',
							text: '#9f66c8',
							gradient: { from: '#343659', to: '#8a5fcc', stop: '53%' }
						},
						'2': {
							// R — 파랑
							border: '#4175bb',
							background: '#4175bb',
							text: '#4175bb',
							gradient: { from: '#303051', to: '#4175bb', stop: '53%' }
						},
						'1': {
							// N — 회색
							border: '#6b7280',
							background: '#6b7280',
							text: '#6b7280',
							gradient: { from: '#1f2937', to: '#6b7280', stop: '53%' }
						}
					}
				}
			},
			// 상세 페이지 표시 설정
			content: {
				image: { video: false, image: true },
				name: true,
				attribute: { element: true },
				releaseDate: true,
				info: {
					skill: {
						name: '스킬',
						view: true,
						level: false
					}
				}
			},
			coupon: { name: '리딤코드' },
			// Phase 0 레이아웃 — 존재하는 컴포넌트만 사용.
			// TODO(BD2 Phase 2): BrownDust2ProfileView 추가(직업·속성·기본 스탯 전용 UI) — doc/browndust2-new-game-plan.md §3-1
			layout: [
				{ component: 'CostumeView', dataKey: 'costumes', props: { title: '코스튬' } },
				{ component: 'ProfileView', dataKey: 'metadata', props: { title: '캐릭터 정보' } },
				{ component: 'SkillTreeView', dataKey: 'skills', props: { title: '스킬' } },
				{ component: 'StoryView', dataKey: 'stories', props: { title: '캐릭터 스토리' } }
			]
		};
	}

	setInit() {
		return this.init();
	}
}
