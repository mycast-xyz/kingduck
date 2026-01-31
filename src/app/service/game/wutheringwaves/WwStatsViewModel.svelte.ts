export class WwStatsViewModel {
	listData: any[]; // Properties array from metadata
	currentLevel = $state(90);
	isAscended = $state(true); // 해당 레벨에서 돌파 여부
	levels = Array.from({ length: 90 }, (_, i) => i + 1); // 1-90

	constructor(listData: any[]) {
		this.listData = listData || [];
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
		if (!this.listData || this.listData.length === 0) return [];

		const idx = this.getEntryIndex(this.currentLevel, this.isAscended);

		return this.listData.map((prop) => {
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
		if (n.includes('hp')) return 'icon/hp.webp';
		if (n.includes('attack') || n.includes('공격력')) return 'icon/attack.webp';
		if (n.includes('defense') || n.includes('방어력')) return 'icon/defense.webp';
		if (
			(n.includes('crit') && (n.includes('rate') || n === 'crit')) ||
			(name.includes('치명타') && name.includes('확률')) ||
			name === '크리티컬'
		)
			return 'icon/crit_rate.webp';
		if (
			(n.includes('crit') && (n.includes('dmg') || n.includes('damage'))) ||
			(name.includes('치명타') && name.includes('피해')) ||
			(name.includes('크리티컬') && name.includes('피해'))
		)
			return 'icon/crit_dmg.webp';
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
