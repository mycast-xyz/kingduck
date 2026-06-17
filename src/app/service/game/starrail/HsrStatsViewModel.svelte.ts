import { StatsViewModelBase } from '../common/StatsViewModelBase.svelte';

export class HsrStatsViewModel extends StatsViewModelBase {
	levels = [1, 20, 30, 40, 50, 60, 70, 80];

	constructor(listData: any, gameId: string) {
		super(listData, gameId);
		// HSR은 기본적으로 80레벨
		this.currentLevel = 80;
	}

	// HSR cost 엔트리는 { ItemID, ItemNum } 형태
	protected getCostItemId(cost: any): string {
		return String(cost.ItemID);
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
	// loadCostItems는 StatsViewModelBase로 이동(공통). getCostItemId만 위에서 구현.
}
