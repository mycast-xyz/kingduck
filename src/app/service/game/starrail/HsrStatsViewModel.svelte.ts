import { hsrItemService } from './HsrItemService';

export class HsrStatsViewModel {
	listData: any;
	gameId: string;
	currentLevel = $state(80);
	itemCache = $state<Record<string, any>>({});
	levels = [1, 20, 30, 40, 50, 60, 70, 80];

	constructor(listData: any, gameId: string) {
		this.listData = listData;
		this.gameId = gameId;
		// HSR은 기본적으로 80레벨
		this.currentLevel = 80;
	}

	ascensionKey = $derived.by(() => {
		let index = this.levels.indexOf(this.currentLevel);
		let keyIndex = index <= 1 ? 0 : index - 1;
		return String(keyIndex);
	});

	stats = $derived.by(() => {
		if (this.listData && this.listData['0'] && typeof this.listData['0'] === 'object') {
			const data = this.listData[this.ascensionKey];

			if (!data) return [];

			const hsrStats = [
				{ key: 'HPBase', addKey: 'HPAdd', label: 'HP', icon: 'icon/hp.webp' },
				{ key: 'AttackBase', addKey: 'AttackAdd', label: '공격력', icon: 'icon/attack.webp' },
				{ key: 'DefenceBase', addKey: 'DefenceAdd', label: '방어력', icon: 'icon/defense.webp' },
				{ key: 'SpeedBase', addKey: null, label: '속도', icon: 'icon/speed.webp' },
				{
					key: 'CriticalChance',
					addKey: null,
					label: '치명타 확률',
					icon: 'icon/crit_rate.webp',
					isPercent: true
				},
				{
					key: 'CriticalDamage',
					addKey: null,
					label: '치명타 피해',
					icon: 'icon/crit_dmg.webp',
					isPercent: true
				},
				{ key: 'BaseAggro', addKey: null, label: '도발', icon: 'icon/taunt.webp' }
			];

			return hsrStats
				.map((stat) => {
					let base = data[stat.key] || 0;
					let add = data[stat.addKey || ''] || 0;

					let val = base;
					if (stat.addKey && add) {
						val = base + add * (this.currentLevel - 1);
					}

					if (base === 0 && !stat.addKey) return null;

					let displayValue: string;
					if (stat.isPercent) {
						displayValue = (val * 100).toFixed(1) + '%';
					} else {
						displayValue = Math.floor(val).toLocaleString();
					}

					return {
						key: stat.key,
						name: stat.label,
						value: displayValue,
						icon: stat.icon
					};
				})
				.filter((item) => item !== null);
		}
		return [];
	});

	costList = $derived.by(() => {
		const currentKeyIdx = parseInt(this.ascensionKey);
		const aggregatedCosts: Record<string, any> = {};

		for (let i = 0; i <= currentKeyIdx; i++) {
			const key = String(i);
			const data = this.listData[key];
			if (data?.Cost) {
				data.Cost.forEach((item: any) => {
					if (aggregatedCosts[item.ItemID]) {
						aggregatedCosts[item.ItemID].ItemNum += item.ItemNum;
					} else {
						// Clone to avoid mutating original data
						aggregatedCosts[item.ItemID] = { ...item };
					}
				});
			}
		}
		return Object.values(aggregatedCosts);
	});

	costPromise = $derived.by(() => this.loadCostItems(this.costList));

	async loadCostItems(costs: any[]) {
		if (!costs || costs.length === 0) return [];

		const promises = costs.map(async (item) => {
			if (this.itemCache[item.ItemID]) {
				return { ...item, info: this.itemCache[item.ItemID] };
			}
			try {
				const res = await hsrItemService.getItem(item.ItemID, this.gameId);
				// API returns a list, so we take the first item if available, or the response itself if struct differs
				// User changed getItem to return client.get('/api/v0/item/list', ...).
				// Assuming client.get returns the data payload directly or { data: ... }
				// We'll check both. If it's a list, take the first item.
				let info = res.data || res;
				if (Array.isArray(info)) {
					info = info[0];
				} else if (info && Array.isArray(info.data)) {
					// Pagination wrapper check
					info = info.data[0];
				}

				this.itemCache[item.ItemID] = info;
				return { ...item, info };
			} catch (e) {
				console.error(`Failed to load item ${item.ItemID}`, e);
				return { ...item, info: null };
			}
		});

		return Promise.all(promises);
	}
}
