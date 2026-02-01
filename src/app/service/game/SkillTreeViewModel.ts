export interface SkillItem {
	id: string | number;
	name: string;
	type: string | null;
	description: string;
	image: string;
	levelParams?: any; // To support level scaling details
}

export abstract class SkillTreeViewModel {
	constructor(
		protected listData: any,
		protected currentUrl: string,
		protected metaData?: any
	) {}

	abstract get items(): SkillItem[];
	abstract getFormattedDescription(item: SkillItem, level: number): string;
	abstract getMaxLevel(item: SkillItem): number;
}
