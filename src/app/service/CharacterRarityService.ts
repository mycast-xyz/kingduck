import { GameSettingInitService } from '../service/GameSettingService';

export class CharacterRarityService {
	private static instance: CharacterRarityService;
	private gameInit: any;

	constructor(gameInit?: any) {
		this.gameInit = gameInit;
	}

	public static getInstance(gameInit?: any): CharacterRarityService {
		console.log(gameInit);

		if (!CharacterRarityService.instance) {
			if (!gameInit) {
				throw new Error('gameInit is required for first initialization');
			}
			CharacterRarityService.instance = new CharacterRarityService(gameInit);
		}
		return CharacterRarityService.instance;
	}

	private raritySetting(item: any, setting: any) {
		let rarity = {
			data: 0,
			type: ''
		};

		if (!setting) {
			return rarity;
		}

		if (setting.default) {
			rarity.data = item;
			rarity.type = setting.type;
		} else {
			rarity.type = setting.type;
			const rarityList = setting.list;
			for (const [key, value] of Object.entries(rarityList)) {
				if (value === item) {
					rarity.data = parseInt(key);
					break;
				}
			}
		}
		return rarity;
	}

	public rarityData(item: any) {
		return this.raritySetting(item, this.gameInit.rarity).data;
	}

	public rarityType(item: any) {
		return this.raritySetting(item, this.gameInit.rarity).type;
	}
}

// 전역에서 사용할 수 있도록 싱글톤 인스턴스 export
export const characterRarityService = {
	init: (gameInit: any) => CharacterRarityService.getInstance(gameInit),
	getRarityData: (item: any) => CharacterRarityService.getInstance().rarityData(item),
	getRarityType: (item: any) => CharacterRarityService.getInstance().rarityType(item)
};
