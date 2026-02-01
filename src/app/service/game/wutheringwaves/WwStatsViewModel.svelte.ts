import { hsrItemService } from '../starrail/HsrItemService';

export class WwStatsViewModel {
	listData: any; // Full metadata object
	currentLevel = $state(90);
	isAscended = $state(true); // 해당 레벨에서 돌파 여부
	levels = [1, 20, 40, 50, 60, 70, 80, 90];
	itemCache = $state<Record<string, any>>({});
	currentUrl: string;
	gameId: string;

	constructor(listData: any, gameId: string, currentUrl: string) {
		this.listData = listData || {};
		this.gameId = gameId;
		this.currentUrl = currentUrl;
		this.currentLevel = 90;
	}

	// 레벨별 인덱스 매핑 (명조는 1-90 레벨 + 돌파 단계 포함 96개 항목)
	private getEntryIndex(level: number, isAscended: boolean): number {
		// 명조 데이터 구조: 1, 2, ..., 20(pre), 20(post), 21, ..., 40(pre), 40(post), ...
		// 20, 40, 50, 60, 70, 80 레벨에서 분기 발생
		const transitionLevels = [20, 40, 50, 60, 70, 80];
		let index = level - 1;

		for (const tLevel of transitionLevels) {
			if (level > tLevel) {
				index += 1; // 이미 지난 돌파 단계 하나 추가
			} else if (level === tLevel) {
				if (isAscended) index += 1; // 현재 레벨이 돌파 레벨이고 돌파 후라면 +1
				break;
			} else {
				break;
			}
		}
		return index;
	}

	stats = $derived.by(() => {
		const props = this.listData?.Properties;
		if (!props || props.length === 0) return [];

		// 슬라이더에서 선택한 레벨이 1이 아니면 기본적으로 돌파 후 상태로 표시
		const ascended = this.currentLevel === 1 ? false : this.isAscended;
		const idx = this.getEntryIndex(this.currentLevel, ascended);

		return props.map((prop: any) => {
			const growth = prop.GrowthValues?.[idx] || prop.GrowthValues?.[prop.GrowthValues.length - 1];
			let value = growth ? growth.value : (prop.BaseValue ?? 0);

			const name = prop.Name || '';
			const nameLower = name.toLowerCase();
			const isCritRate =
				(nameLower.includes('crit') && (nameLower.includes('rate') || nameLower === 'crit')) ||
				(name.includes('치명타') && name.includes('확률')) ||
				name === '크리티컬';
			const isCritDmg =
				(nameLower.includes('crit') &&
					(nameLower.includes('dmg') || nameLower.includes('damage'))) ||
				(name.includes('치명타') && name.includes('피해')) ||
				(name.includes('크리티컬') && name.includes('피해'));
			const isEnRegen =
				nameLower.includes('energy') ||
				nameLower.includes('regen') ||
				name.includes('에너지') ||
				name.includes('충전');
			const isHeal = nameLower.includes('heal') || name.includes('치료') || name.includes('치유');

			// 특수한 경우 (치명타 등) 기본값 처리
			if (isNaN(value) || value === 0) {
				if (isCritRate) value = 5;
				if (isCritDmg) value = 150;
			}

			const isPercent = isCritRate || isCritDmg || isEnRegen || isHeal;
			const formattedValue = isPercent ? `${value}%` : Math.floor(value).toLocaleString();

			return {
				key: prop.Name,
				name: this.translateStatName(prop.Name),
				value: formattedValue,
				icon: this.getStatIcon(prop.Name)
			};
		});
	});

	costList = $derived.by(() => {
		if (!this.listData?.Breaches) return [];

		const transitionLevels = [20, 40, 50, 60, 70, 80];
		let spentBreachCount = 0;
		// 슬라이더에서 특정 레벨을 선택했을 때, 해당 레벨까지의 총 비용을 계산
		for (const tLevel of transitionLevels) {
			if (this.currentLevel > tLevel || (this.currentLevel === tLevel && this.isAscended)) {
				spentBreachCount++;
			} else {
				break;
			}
		}

		const aggregatedCosts: Record<string, any> = {};
		for (let i = 0; i < spentBreachCount; i++) {
			const breach = this.listData.Breaches[i];
			if (breach?.Items) {
				breach.Items.forEach((item: any) => {
					const id = String(item.Key);
					if (aggregatedCosts[id]) {
						aggregatedCosts[id].Value += item.Value;
					} else {
						aggregatedCosts[id] = { ...item };
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
			const id = String(item.Key);
			if (this.itemCache[id]) {
				return { ...item, info: this.itemCache[id] };
			}
			try {
				const res = await hsrItemService.getItem(id, this.gameId);
				let info = res.data || res;
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

	private translateStatName(name: string): string {
		const n = (name || '').toLowerCase();
		if (
			name.includes('치명타') ||
			name === '크리티컬' ||
			name.includes('확률') ||
			name.includes('피해')
		)
			return name;
		if (name.includes('에너지') || name.includes('충전')) return '에너지 충전 효율';
		if (name.includes('치료') || name.includes('치유')) return '치료 효과 보너스';

		const dict: Record<string, string> = {
			hp: 'HP',
			attack: '공격력',
			defense: '방어력',
			critrate: '치명타 확률',
			critdamage: '치명타 피해',
			critdmg: '치명타 피해',
			crit: '치명타 확률',
			energyregen: '에너지 충전 효율',
			healingbonus: '치료 효과 보너스'
		};
		return dict[n] || name;
	}

	private getStatIcon(name: string): string {
		const n = name.toLowerCase();
		if (n.includes('hp'))
			return (
				this.currentUrl +
				'/assets/resource/wutheringwaves/Data/Game/Aki/UI/UIResources/Common/Image/IconAttribute/T_Iconpropertygreenlife_UI.webp'
			);
		if (n.includes('attack') || n.includes('공격력'))
			return (
				this.currentUrl +
				'/assets/resource/wutheringwaves/Data/Game/Aki/UI/UIResources/Common/Image/IconAttribute/T_Iconpropertyredattack_UI.webp'
			);
		if (n.includes('defense') || n.includes('방어력'))
			return (
				this.currentUrl +
				'/assets/resource/wutheringwaves/Data/Game/Aki/UI/UIResources/Common/Image/IconAttribute/T_Iconpropertygreendefense_UI.webp'
			);
		if (
			(n.includes('crit') && (n.includes('rate') || n === 'crit')) ||
			(name.includes('치명타') && name.includes('확률')) ||
			name === '크리티컬'
		)
			return (
				this.currentUrl +
				'/assets/resource/wutheringwaves/Data/Game/Aki/UI/UIResources/Common/Image/IconAttribute/T_Iconpropertyredcrit_UI.webp'
			);
		if (
			(n.includes('crit') && (n.includes('dmg') || n.includes('damage'))) ||
			(name.includes('치명타') && name.includes('피해')) ||
			(name.includes('크리티컬') && name.includes('피해'))
		)
			return (
				this.currentUrl +
				'/assets/resource/wutheringwaves/Data/Game/Aki/UI/UIResources/Common/Image/IconAttribute/T_Iconpropertyredcrit_UI.webp'
			);
		if (
			n.includes('energy') ||
			n.includes('regen') ||
			name.includes('에너지') ||
			name.includes('충전')
		)
			return 'icon/speed.webp';
		if (n.includes('heal') || name.includes('치료') || name.includes('치유'))
			return 'icon/taunt.webp';

		return '';
	}
}
