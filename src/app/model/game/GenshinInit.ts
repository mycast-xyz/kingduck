import type { GameInitConfig } from './GameInitConfig';

/**
 * 원신(Genshin Impact) 게임 설정.
 *
 * 데이터 소스: Ambr(gi.yatta.moe). 백엔드 GenshinCharacterScraper가
 * element/path(무기)를 **영문 키**로 저장하므로 아래 필터 list 키도 영문 키로 맞춘다
 * (starrail과 동일 관행 — 한글 키로 두면 필터 매칭이 깨진다).
 *
 * 1차 범위: 캐릭터 목록(원소/무기/등급 필터) + 기본 콘텐츠(이미지/이름/속성).
 * 스킬·별자리 등 상세 섹션 렌더는 genshin 전용 뷰모델이 필요해 후속(layout 비움).
 */
export class GenshinInit {
	init(): GameInitConfig {
		return {
			gameId: 'genshin',
			copyright: {
				title: 'KingDuck는 원신 플레이어를 위한 비공식 정보 웹사이트 입니다.',
				description:
					'해당 사이트 내 쓰여진 이미지, 영상에 대한 저작권은 HoYoverse에 있습니다. 참조 사이트 : https://gi.yatta.moe/',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			// 속성(원소) / 무기 필터
			type: {
				DamageType: {
					name: '원소',
					apiPoint: 'elementId',
					apiType: 'DamageType',
					isWhite: false,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Fire: '불',
						Water: '물',
						Wind: '바람',
						Elec: '번개',
						Grass: '풀',
						Ice: '얼음',
						Rock: '바위'
					}
				},
				weaponType: {
					name: '무기',
					apiPoint: 'pathId',
					apiType: 'Path',
					isWhite: true,
					isTwoRow: false,
					isMenuOpen: false,
					list: {
						Sword: '한손검',
						Claymore: '양손검',
						Polearm: '장병기',
						Bow: '활',
						Catalyst: '법구'
					}
				}
			},
			// 등급 정보 (원신: 5성 / 4성)
			rarity: {
				default: true,
				type: 'number',
				list: {
					'5': '5',
					'4': '4'
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
					search: {
						text: true,
						attribute: {
							element: false,
							path: true
						}
					}
				},
				card: {
					element: {
						display: 'iconUrl',
						mobilePath: '/assets/image/{gameSlug}/elements/{elementName}.webp'
					},
					path: {
						display: true
					},
					// 호요버스 공통 등급 색상(스타레일과 동일 팔레트)
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
			// 상세 내용 표시 설정 — 1차는 기본 정보만(스킬/별자리 렌더는 후속)
			content: {
				image: {
					video: false,
					image: true
				},
				name: true,
				attribute: {
					element: true,
					path: true,
					corp: false
				},
				releaseDate: true,
				info: {
					mainItem: {
						name: '돌파 재료',
						view: true
					},
					skill: {
						name: '캐릭터 스킬',
						view: true,
						level: true
					},
					gacha: {
						name: '별자리',
						view: true,
						color: '#3a3a5a',
						level: false
					}
				}
			},
			// starrail과 동일한 틀: 돌파 재료(MainItemView) / 스킬(SkillTreeView) / 별자리(RankListView).
			// 기초 스탯(StatsView)은 원신 성장 곡선 계산이 필요해 후속.
			layout: [
				{
					component: 'MainItemView',
					dataKey: 'recommendedWeapons',
					props: { title: '추천 무기' }
				},
				{
					component: 'BuildRecommendationView',
					dataKey: 'recommendedArtifacts',
					props: { title: '추천 성유물' }
				},
				{ component: 'MainItemView', dataKey: 'ascension', props: { title: '돌파 재료' } },
				{
					component: 'SkillTreeView',
					dataKey: 'skills',
					props: { title: '캐릭터 스킬' }
				},
				{
					component: 'RankListView',
					dataKey: 'ranks_raw',
					initDataKey: 'gacha',
					props: { title: '별자리' }
				}
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
