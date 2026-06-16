import { SkillTreeViewModel, type SkillItem } from '../SkillTreeViewModel';

export class Reverse1999SkillViewModel extends SkillTreeViewModel {
	get items(): SkillItem[] {
		let rawItems = this.listData;
		if (rawItems && !Array.isArray(rawItems)) {
			// Attempt to conform to Reverse 1999 data structure based on usage patterns
			// Assuming similar structure where skills might be in metadata or just the object
			if (rawItems.metadata?.skill) {
				rawItems = rawItems.metadata.skill;
			} else if (rawItems.skill) {
				rawItems = rawItems.skill;
			} else {
				rawItems = Object.values(rawItems);
			}
		}

		if (!Array.isArray(rawItems)) return [];

		return rawItems.map((item: any, index: number) => ({
			id: item.id || item.name || `skill-${index}`,
			name: item.name || '',
			type: item.type || null,
			description: item.description || '',
			image: item.iconUrl || item.image || '', // Adjust based on actual data
			levelParams: item
		}));
	}

	getFormattedDescription(item: SkillItem, level: number): string {
		// Reverse 1999 descriptions often have scaling values based on level/rank
		// This is a placeholder implementation.
		// Assuming 'description' field holds the text.
		// Enhance this based on actual data structure if variable parsing is needed.
		return item.description || '설명이 없습니다.';
	}

	getMaxLevel(item: SkillItem): number {
		// Reverse 1999 skills typically have 3 ranks/levels
		return 3;
	}
}
