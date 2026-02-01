import { hsrItemService } from '../starrail/HsrItemService';

export class EndfieldStatsViewModel {
	listData: any; // Full metadata
	attributes: any[];
	talentNodeMap: any;

	currentLevel = $state(90);
	levels = [1, 20, 40, 60, 80, 90]; // Breakpoints: 20 / 40 / 60 / 80 / 90
	gameId: string;
	currentUrl: string;
	itemCache = $state<Record<string, any>>({});

	constructor(listData: any, gameId: string, currentUrl: string) {
		this.listData = listData || {};
		this.attributes = this.listData.attributes || [];
		this.talentNodeMap = this.listData.talents?.talentNodeMap || {};

		this.gameId = gameId;
		this.currentUrl = currentUrl;
		this.currentLevel = 90;
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

	costPromise = $derived.by(async () => {
		return this.loadCostItems(this.costList);
	});

	async loadCostItems(costs: any[]) {
		if (!costs || costs.length === 0) return [];

		const promises = costs.map(async (item) => {
			// User specified: requiredItem has originalId which is the id to fetch.
			// Fallback to item.id if originalId is missing.
			const id = String(item.originalId || item.id);

			if (this.itemCache[id]) {
				return { ...item, info: this.itemCache[id] };
			}
			try {
				const res = await hsrItemService.getItem(id, this.gameId);
				let info = res.data || res;

				// Handle potential array response wrappers
				if (Array.isArray(info)) {
					info = info[0];
				} else if (info && Array.isArray(info.data)) {
					info = info.data[0];
				}

				this.itemCache[id] = info;
				return { ...item, info };
			} catch (e) {
				console.error(`Failed to load item ${id}`, e);
				return { ...item, info: null };
			}
		});

		return Promise.all(promises);
	}

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
