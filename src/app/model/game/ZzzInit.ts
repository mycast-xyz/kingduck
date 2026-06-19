import type { GameInitConfig } from './GameInitConfig';

/**
 * 젠레스 존 제로(ZZZ) 게임 설정.
 *
 * 데이터 소스: zzz.gg/ko (한국어). 백엔드 ZzzCharacterScraper가 속성/특성을 **한국어 그대로** 저장한다
 * → 필터 list 키도 한글(Element.name과 정확히 일치해야 함).
 *
 * 필터는 서버 list API가 지원하는 elementId(속성)/pathId(특성)만 둔다. 공격타입·소속은 metadata라
 * 카드/상세에 표시만 한다. 스킬은 후속.
 */
export class ZzzInit {
	init(): GameInitConfig {
		return {
			gameId: 'zzz',
			copyright: {
				title: 'KingDuck는 젠레스 존 제로 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 HoYoverse에 있습니다. 참조 사이트 : https://zzz.gg/',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성(원소) / 특성 필터
			type: {
				DamageType: {
					name: '속성',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						물리: '물리',
						불: '불',
						얼음: '얼음',
						서리: '서리',
						전기: '전기',
						에테르: '에테르',
						현묵: '현묵'
					}
				},
				specialtyType: {
					name: '특성',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: true,
					isTwoRow: true,
					isMenuOpen: false,
					list: {
						강공: '강공',
						격파: '격파',
						이상: '이상',
						지원: '지원',
						방어: '방어',
						명파: '명파'
					}
				}
			},
			// 등급 정보 (S / A)
			rarity: {
				default: false,
				type: 'string',
				list: {
					'5': 'S',
					'4': 'A'
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
					search: { text: true, attribute: {} }
				},
				// 카드 등급 색상(S 금 / A 보라)
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
						}
					}
				}
			},
			// 상세 표시 — 속성/특성은 헤더, 공격타입/소속은 캐릭터 정보 섹션.
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
				releaseDate: false,
				info: {}
			},
			layout: [
				{ component: 'ZzzProfileView', dataKey: 'metadata', props: { title: '캐릭터 정보' } },
				// 추천 빌드(genshin.gg/zzz 큐레이션) — 백엔드 ZzzBuildScraper가 채운다.
				// W-엔진(무기 자리)=MainItemView, 드라이브 디스크(유물 자리)=BuildRecommendationView, 팀.
				{
					component: 'MainItemView',
					dataKey: 'recommendedWEngines',
					props: { title: '추천 W-엔진' }
				},
				{
					component: 'BuildRecommendationView',
					dataKey: 'driveDiscs',
					props: { title: '추천 드라이브 디스크' }
				},
				{ component: 'TeamRecommendationView', dataKey: 'teams', props: { title: '추천 파티' } },
				{ component: 'SkillTreeView', dataKey: 'skills', props: { title: '스킬' } },
				{ component: 'RankListView', dataKey: 'talents', props: { title: '심상 영식' } }
			],
			coupon: {
				name: '리딤코드'
			}
		};
	}

	setInit() {
		return this.init();
	}
}
