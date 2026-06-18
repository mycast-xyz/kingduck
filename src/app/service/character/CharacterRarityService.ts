import { GameSettingInitService } from '../game/GameSettingService';

export class CharacterRarityService {
	private static instance: CharacterRarityService;
	private gameInit: any;

	constructor(gameInit?: any) {
		this.gameInit = gameInit;
	}

	public static getInstance(gameInit?: any): CharacterRarityService {
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
			// default가 true일 때, item을 그대로 사용하되 타입에 맞게 변환
			if (setting.type === 'number') {
				rarity.data = typeof item === 'string' ? parseInt(item, 10) : Number(item);
			} else {
				rarity.data = item;
			}
			rarity.type = setting.type;
		} else {
			rarity.type = setting.type;
			const rarityList = setting.list;
			// list는 { '5':'SSR', '4':'SR' }(키=숫자, 값=라벨) 형태.
			// DB rarity가 라벨('SSR')로 오면 value 매칭, 숫자(5)로 오면 key 매칭 — 둘 다 허용.
			// (nikke/zzz는 DB에 숫자로 저장돼 기존엔 value 비교만 해서 매칭 실패 → 색/등급 미적용 버그)
			for (const [key, value] of Object.entries(rarityList)) {
				if (value === item || key === String(item)) {
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
