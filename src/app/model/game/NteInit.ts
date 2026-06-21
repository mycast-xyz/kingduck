import type { GameInitConfig } from './GameInitConfig';

/**
 * 이환(異環 / Neverness to Everness, NTE) 게임 설정.
 *
 * 데이터 소스: everness.info GraphQL(한국어). 백엔드 NteCharacterScraper가
 *  - 속성(element): Incantation/Chaos/Cosmos/Lakshana/Anima/Psyche → Element(type 'DamageType')
 *  - 형질(arcs_tags): 고체/액체/플라스마/기체/결합(한국어) → Element(type 'Path')
 * 로 저장한다. 필터는 DB elements를 apiType('DamageType'/'Path')으로 추려 쓰며,
 * 라벨은 (1) DB displayName → (2) 아래 type.list 번역맵 → (3) 원본명 순으로 표시된다.
 *
 * 속성은 영문 키라 번역맵으로 한글 라벨을 준다. 형질은 이미 한글이라 키=값.
 * 카드의 속성/형질 아이콘은 크롤로 적재된 Element.iconUrl(display:'iconUrl')을 쓴다.
 */
export class NteInit {
	init(): GameInitConfig {
		return {
			gameId: 'nte',
			copyright: {
				title:
					'KingDuck는 이환(Neverness to Everness) 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 Hotta Studio / Perfect World에 있습니다. 참조 사이트 : https://everness.info/',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성(DamageType) / 형질(Path) 필터
			type: {
				DamageType: {
					name: '속성',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					// 키 = Element.name(영문 원본), 값 = 한글 표시 라벨(번역맵).
					list: {
						Incantation: '주문',
						Chaos: '혼돈',
						Cosmos: '코스모스',
						Lakshana: '락샤나',
						Anima: '아니마',
						Psyche: '프시케'
					}
				},
				pathType: {
					name: '형질',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					// 형질명은 크롤이 한글로 저장 → 키=값.
					list: {
						고체: '고체',
						액체: '액체',
						플라스마: '플라스마',
						기체: '기체',
						결합: '결합'
					}
				}
			},
			// 등급 정보 (5성 / 4성)
			rarity: {
				default: false,
				type: 'string',
				list: {
					'5': '5성',
					'4': '4성'
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
					view: false,
					search: { text: true, attribute: {} }
				},
				// 카드: 속성/형질 아이콘은 API Element.iconUrl 사용. 모바일에서는 로컬 캐시 경로 폴백.
				// 등급 색상(5성 금 / 4성 보라).
				card: {
					element: {
						display: 'iconUrl',
						mobilePath: '/assets/image/{gameSlug}/elements/{elementName}.webp'
					},
					path: { display: true },
					rarityColors: {
						'5': {
							border: '#fcba49',
							background: '#fcba49',
							text: '#fcba49',
							gradient: { from: '#6b4f2a', to: '#c9a36a', stop: '53%' }
						},
						'4': {
							border: '#9f66c8',
							background: '#9f66c8',
							text: '#9f66c8',
							gradient: { from: '#343659', to: '#8a5fcc', stop: '53%' }
						}
					}
				}
			},
			// 상세 표시 — 속성/형질은 헤더, 진영/생일/이능력은 정보 섹션.
			content: {
				image: {
					video: true,
					image: true
				},
				name: true,
				attribute: {
					element: true,
					path: true
				},
				releaseDate: true,
				info: {
					skill: {
						name: '캐릭터 스킬',
						view: true,
						level: false
					}
				}
			},
			// NteProfileView: 진영·이능력·형질·생일 등 기본 정보.
			// SkillTreeView: everness.info GraphQL 스킬 데이터(백엔드 CharacterScraper 구현 후 채워짐).
			layout: [
				{ component: 'NteProfileView', dataKey: 'metadata', props: { title: '캐릭터 정보' } },
				{
					component: 'SkillTreeView',
					dataKey: 'skills',
					initDataKey: 'skill',
					props: { title: '캐릭터 스킬' }
				}
			],
			coupon: {
				name: '쿠폰'
			}
		};
	}

	setInit() {
		return this.init();
	}
}
