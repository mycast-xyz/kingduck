import type { GameInitConfig } from './GameInitConfig';

/**
 * 블루 아카이브(Blue Archive) 게임 설정.
 *
 * 데이터 소스: SchaleDB 공개 JSON(한국어). 백엔드 BlueArchiveCharacterScraper가
 *  - 공격속성(BulletType): Explosion/Pierce/Mystic/Sonic → Element(type 'DamageType', elementId)
 *  - 방어속성(ArmorType):  LightArmor/HeavyArmor/Unarmed/ElasticArmor/CompositeArmor → Element(type 'Path', pathId)
 *  - 역할(TacticRole):     Character.role 컬럼 + metadata.role → 클라이언트 필터(char.role)
 *  - 학교(School):         metadata.school → 클라이언트 필터(char.school, 백엔드가 JSON path 투영)
 * 로 저장한다(니케 다축 필터 패턴).
 *
 * 영문 enum은 type.list 번역맵으로 한글 라벨을 준다.
 * 공격/방어 타입은 SchaleDB에 개별 아이콘이 없어 공용 Type_Attack/Type_Defense.png를 Element.iconUrl로 쓴다.
 * 역할 필터 아이콘만 개별 존재(game.attrIcons.role 경유, ListFilterMenu가 clientFilter 옵션에 적용).
 */
export class BlueArchiveInit {
	init(): GameInitConfig {
		return {
			gameId: 'bluearchive',
			copyright: {
				title:
					'KingDuck는 블루 아카이브(Blue Archive) 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 NEXON Games / Yostar에 있습니다. 참조 사이트 : https://schaledb.com/',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 4축 필터: 공격속성/방어속성(DB Element, 서버 필터) + 역할/학교(metadata, 클라이언트 필터)
			type: {
				DamageType: {
					name: '공격 속성',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						Explosion: '폭발',
						Pierce: '관통',
						Mystic: '신비',
						Sonic: '진동'
					}
				},
				baseTypeChar: {
					name: '방어 속성',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						LightArmor: '경장갑',
						HeavyArmor: '중장갑',
						Unarmed: '특수장갑',
						ElasticArmor: '탄력장갑',
						CompositeArmor: '복합장갑'
					}
				},
				roleType: {
					name: '역할',
					apiPoint: 'role',
					clientFilter: true,
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						DamageDealer: '딜러',
						Tanker: '탱커',
						Healer: '힐러',
						Supporter: '서포터',
						Vehicle: 'T.S'
					}
				},
				schoolType: {
					name: '학교',
					apiPoint: 'school',
					clientFilter: true,
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						Abydos: '아비도스',
						Arius: '아리우스',
						Gehenna: '게헨나',
						Highlander: '하이랜더',
						Hyakkiyako: '백귀야행',
						Millennium: '밀레니엄',
						RedWinter: '붉은겨울',
						Sakugawa: '사쿠가와 중학교',
						Shanhaijing: '산해경',
						SRT: 'SRT',
						Tokiwadai: '토키와다이 중학교',
						Trinity: '트리니티',
						Valkyrie: '발키리',
						WildHunt: '와일드헌트',
						ETC: '그 외'
					}
				}
			},
			// 등급(StarGrade 1~3성) — 카드에 별 개수로 표시.
			rarity: {
				default: true,
				type: 'number',
				list: {
					'3': '3',
					'2': '2',
					'1': '1'
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
				// 카드: 공격/방어 아이콘은 Element.iconUrl(공용 Type_Attack/Type_Defense). 등급 별 색상(3성 금/2성 보라/1성 파랑).
				card: {
					element: { display: 'iconUrl' },
					path: { display: true },
					rarityColors: {
						'3': {
							border: '#fcba49',
							background: '#fcba49',
							text: '#fcba49',
							gradient: { from: '#6b4f2a', to: '#c9a36a', stop: '53%' }
						},
						'2': {
							border: '#9f66c8',
							background: '#9f66c8',
							text: '#9f66c8',
							gradient: { from: '#343659', to: '#8a5fcc', stop: '53%' }
						},
						'1': {
							border: '#4175bb',
							background: '#4175bb',
							text: '#4175bb',
							gradient: { from: '#303051', to: '#4175bb', stop: '53%' }
						}
					}
				}
			},
			// 상세 표시 — 공격/방어속성은 헤더, 학교/역할/CV/생일 등은 정보 섹션(BlueArchiveProfileView).
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
				releaseDate: false,
				info: {}
			},
			layout: [
				{ component: 'BlueArchiveProfileView', dataKey: 'metadata', props: { title: '학생 정보' } },
				{ component: 'SkillTreeView', dataKey: 'skills', props: { title: '스킬' } }
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
