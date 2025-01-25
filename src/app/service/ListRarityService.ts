import { writable } from 'svelte/store';

interface RarityConfig {
	[key: string]: {
		getRarityData: (item: any) => { data: number; type: string };
	};
}

interface TypeConfig {
	[key: string]: {
		getTypeData: (item: any) => { data: string; type: string };
	};
}

export class ListRarityService {
	private _rarityConfigs = writable<RarityConfig>({
		HonkaiStarRail: {
			getRarityData: (item) => ({
				data: item,
				type: 'number'
			})
		},
		GirlsFrontline2Exilium: {
			getRarityData: (item) => {
				const rarityMap: { [key: string]: number } = {
					정예: 5,
					표준: 4
				};
				return {
					data: rarityMap[item] || 3,
					type: 'string'
				};
			}
		}
	});

	private _typeConfigs = writable<TypeConfig>({
		HonkaiStarRail: {
			getTypeData: (item) => ({
				data: item,
				type: 'number'
			})
		}
	});

	get rarityConfigs() {
		return this._rarityConfigs;
	}

	get typeConfigs() {
		return this._typeConfigs;
	}

	rarityType(params: string, item: any) {
		let result = { data: 0, type: '' };
		this._rarityConfigs.subscribe((configs) => {
			const config = configs[params];
			if (config) {
				result = config.getRarityData(item);
			}
		})();
		return result;
	}

	typeList(params: string, item: any) {
		let result = { data: '', type: '' };
		this._typeConfigs.subscribe((configs) => {
			const config = configs[params];
			if (config) {
				result = config.getTypeData(item);
			}
		})();
		return result;
	}
}
