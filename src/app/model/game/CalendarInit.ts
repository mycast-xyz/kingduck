import type { GameInitConfig } from './GameInitConfig';

export class CalendarInit {
	init(): GameInitConfig {
		return {
			gameId: 'Calendar',
			copyright: {
				title: 'KingDuck는 서브 컬쳐 게임을 위해서 만들어진 사이트입니다.',
				description: '해당 사이트 내 쓰여진 이미지 중 일부는 저작권이 있는 이미지일 수 있습니다.',
				author: 'KingDuck',
				authorEmail: '@gmail.com',
				authorName: 'KingDuck'
			},
			type: {},
			rarity: {
				default: false,
				type: 'number',
				list: {},
				isMenuOpen: false
			},
			list: {
				character: {
					view: false,
					search: {
						text: false
					}
				},
				item: {
					view: false,
					search: {
						text: false,
						attribute: {}
					}
				}
			},
			content: {
				image: {
					video: false,
					image: false
				},
				name: false,
				attribute: {},
				releaseDate: false,
				info: {}
			}
		};
	}
}
