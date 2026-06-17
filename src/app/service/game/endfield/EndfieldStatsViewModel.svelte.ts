import { StatsViewModelBase } from '../common/StatsViewModelBase.svelte';

export class EndfieldStatsViewModel extends StatsViewModelBase {
	attributes: any[] = [];
	talentNodeMap: any = {};
	levels = [1, 20, 40, 60, 80, 90]; // Breakpoints: 20 / 40 / 60 / 80 / 90

	constructor(listData: any, gameId: string, currentUrl: string) {
		super(listData, gameId, currentUrl);
		this.attributes = this.listData.attributes || [];
		this.talentNodeMap = this.listData.talents?.talentNodeMap || {};
		this.currentLevel = 90;
	}

	// Endfield의 requiredItem 엔트리는 originalId(없으면 id)를 쓴다
	protected getCostItemId(cost: any): string {
		return String(cost.originalId || cost.id);
	}

	stats = $derived.by(() => {
		if (!this.attributes || this.attributes.length === 0) return [];

		// Attributes array usually contains entries for all levels.
		// We find the one that matches currentLevel.
		const targetEntry = this.attributes.find((entry: any) => {
			const levelAttr = entry.Attribute?.attrs?.find((a: any) => a.attrType === 'Level');
			return levelAttr && levelAttr.attrValue === this.currentLevel;
		});

		if (!targetEntry || !targetEntry.Attribute || !targetEntry.Attribute.attrs) return [];

		const attrs = targetEntry.Attribute.attrs;
		const getVal = (key: string) => {
			const a = attrs.find((x: any) => x.attrType === key);
			return a ? Number(a.attrValue) : 0;
		};

		const finalKeys = [
			{ key: 'MaxHp', name: '체력' },
			{ key: 'Atk', name: '공격력' },
			{ key: 'Def', name: '방어력' },
			{ key: 'Str', name: '체질' },
			{ key: 'Agi', name: '반응' },
			{ key: 'Wisd', name: '지능' },
			{ key: 'Will', name: '의지' },
			{ key: 'CriticalRate', name: '치명타 확률', isPercent: true }
		];

		return finalKeys.map((k) => {
			const val = getVal(k.key);
			const formatted = k.isPercent
				? `${(val * 100).toFixed(1)}%`
				: Math.floor(val).toLocaleString();

			return {
				key: k.key,
				name: k.name,
				value: formatted,
				icon: this.getStatIcon(k.key)
			};
		});
	});

	costList = $derived.by(() => {
		// Calculate cumulative costs for ascension up to currentLevel.
		// Breakpoints: 20(->21), 40(->41), 60(->61), 80(->81..90).
		// Mapping: 80 uses "charBreak70". 90 is max so it implies 80 break is passed.

		const breakNodes = [
			{ level: 20, key: 'charBreak20' },
			{ level: 40, key: 'charBreak40' },
			{ level: 60, key: 'charBreak60' },
			{ level: 80, key: 'charBreak70' } // 80 maps to charBreak70
		];
		const costs: Record<string, any> = {};

		breakNodes.forEach((nodeConfig) => {
			// Check if we are at or above the break level.
			// This ensures cost is shown when slider is AT the level (e.g. 20).
			if (this.currentLevel >= nodeConfig.level) {
				const node = this.talentNodeMap[nodeConfig.key];
				if (node && node.requiredItem) {
					node.requiredItem.forEach((req: any) => {
						this.addMaterial(costs, req);
					});
				}
			}
		});

		return Object.values(costs);
	});

	costPromise = $derived.by(() => this.loadCostItems(this.costList));
	// loadCostItems는 StatsViewModelBase로 이동(공통).

	private getStatIcon(key: string): string {
		const k = key.toLowerCase();
		if (k === 'maxhp') return 'icon/hp.webp';
		if (k === 'atk') return 'icon/attack.webp';
		if (k === 'def') return 'icon/defense.webp';
		if (k === 'criticalrate') return 'icon/crit.webp';
		if (k === 'str') return 'icon/hp.webp';
		if (k === 'agi') return 'icon/speed.webp';
		if (k === 'wisd') return 'icon/break_effect.webp';
		if (k === 'will') return 'icon/effect_hit.webp';
		return '';
	}

	private addMaterial(dict: Record<string, any>, item: any) {
		const id = String(item.originalId || item.id);
		if (!dict[id]) {
			dict[id] = { ...item, count: 0, Value: 0, id: id };
		}
		dict[id].count += item.count;
		dict[id].Value += item.count;
	}
}
