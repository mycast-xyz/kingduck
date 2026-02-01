import { SkillTreeViewModel, type SkillItem } from '../SkillTreeViewModel';
import { hsrSkillService } from './HsrSkillService';

export class HsrSkillTreeViewModel extends SkillTreeViewModel {
	get items(): SkillItem[] {
		let rawItems = this.listData;
		if (rawItems && !Array.isArray(rawItems)) {
			// If it's the full character object, look into metadata
			if (rawItems.metadata?.skills) {
				rawItems = rawItems.metadata.skills;
			} else {
				rawItems = Object.values(rawItems);
			}
		}

		if (!Array.isArray(rawItems)) return [];

		return rawItems.map((item: any) => ({
			id: item.id || item.Id || Math.random(),
			name: this.getFormattedName(item),
			type: item.type || null,
			description: item.desc || '',
			image: item.iconUrl || '',
			levelParams: item // Keep reference for processing
		}));
	}

	private getFormattedName(item: any) {
		if (item.name?.kr) return item.name.kr.replace(/<[^>]*>/g, '');
		return item.name || '';
	}

	getFormattedDescription(item: SkillItem, level: number): string {
		// HSR description scaling is usually handled via params in the raw item
		const rawItem = item.levelParams;
		if (!rawItem || !rawItem.desc) return '설명이 없습니다.';

		try {
			const processed = hsrSkillService.processSkill(rawItem);
			return processed.processedDesc
				.replace(/<color=#[^>]+>/g, '<span style="color: #f29e38;">')
				.replace(/<\/color>/g, '</span>')
				.replace(/<unbreak>/g, '')
				.replace(/<\/unbreak>/g, '')
				.replace(/<u>/g, '<span style="text-decoration: underline;">')
				.replace(/<\/u>/g, '</span>');
		} catch (e) {
			console.error('HSR skill processing error:', e);
			return rawItem.desc;
		}
	}

	getMaxLevel(item: SkillItem): number {
		return item.levelParams?.maxLevel || 10;
	}
}
