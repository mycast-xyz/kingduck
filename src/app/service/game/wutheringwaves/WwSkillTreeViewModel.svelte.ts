import { SkillTreeViewModel, type SkillItem } from '../SkillTreeViewModel';
import { wwSkillService } from './WwSkillService';

export class WwSkillTreeViewModel extends SkillTreeViewModel {
	get items(): SkillItem[] {
		let rawItems = this.listData;
		if (rawItems && !Array.isArray(rawItems)) {
			// If it's the full character object, look into metadata
			if (rawItems.metadata?.Skills) {
				rawItems = rawItems.metadata.Skills;
			} else {
				rawItems = Object.values(rawItems);
			}
		}

		if (!Array.isArray(rawItems)) return [];

		return rawItems.map((item: any) => ({
			id: item.SkillId || Math.random(),
			name: item.SkillName || '',
			type: item.SkillType || null,
			description: item.SkillDescribe || '',
			image: item.Icon || '',
			levelParams: item
		}));
	}

	getFormattedDescription(item: SkillItem, level: number): string {
		const rawItem = item.levelParams;
		if (!rawItem) return '설명이 없습니다.';

		let description = wwSkillService.cleanDescription(rawItem.SkillDescribe || '');

		if (rawItem.SkillAttributes && rawItem.SkillAttributes.length > 0) {
			const attrs = wwSkillService.formatAttributes(rawItem.SkillAttributes, level);
			let attrText =
				'<div class="mt-4 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">';
			attrs.forEach((attr) => {
				attrText += `<div class="flex justify-between text-xs"><span class="text-gray-500">${attr.name}</span><span class="font-medium text-indigo-500">${attr.value}</span></div>`;
			});
			attrText += '</div>';
			description += attrText;
		}

		return description || '설명이 없습니다.';
	}

	getMaxLevel(item: SkillItem): number {
		const attributes = item.levelParams?.SkillAttributes;
		if (attributes && attributes[0]?.values) {
			return attributes[0].values.length;
		}
		return 10;
	}
}
