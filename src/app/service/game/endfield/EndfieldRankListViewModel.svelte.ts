export class EndfieldRankListViewModel {
	items: any[] = [];

	constructor(listData: any, gameSlug: string, currentUrl: string) {
		// listData corresponds to metadata.talentNodeMap (or similar)
		// We filter for nodes that correspond to "Potentials" / "Talents"
		// In the JSON, these seem to be `PassiveSkill` nodes ?

		if (!listData) return;

		const nodes = Object.values(listData);
		// Examples: chr_0011_seraph_passive_skill_0_1, chr_0011_seraph_1 (Attr)
		// Usually 'Potentials' in AK:E are distinct.
		// Let's assume we want to show the 'PassiveSkill' ones which act like constellations?
		// OR the 'Attr' nodes that have 'breakStage' or 'favorability'?

		// Let's filter for 'PassiveSkill' types that have an iconId and name
		const potentials = nodes
			.filter((n: any) => n.nodeType === 'PassiveSkill' && n.passiveSkillNodeInfo?.name)
			.sort((a: any, b: any) => a.passiveSkillNodeInfo.level - b.passiveSkillNodeInfo.level);

		this.items = potentials.map((node: any, index: number) => {
			const info = node.passiveSkillNodeInfo;
			const desc = info.effectData?.desc?.text || '';
			const processedDesc = this.formatDescription(desc, info.effectData);

			return {
				index: info.level || index + 1,
				name: info.name?.text,
				image: `/assets/image/endfield/skill/${info.iconId}.webp`, // Verify path
				description: processedDesc
			};
		});
	}

	formatDescription(desc: string, effectData: any) {
		if (!effectData || !effectData.dataList) return desc;

		// Simple parameter replacement if needed, similar to skills
		// For now just basic cleaning
		let formatted = desc.replace(
			/<@ba\.key>(.*?)<\/>/g,
			'<span class="text-orange-500 font-bold">$1</span>'
		);
		formatted = formatted.replace(/<[^>]+>/g, ''); // Strip other tags

		// Replace {placeholder} with values if available in dataList
		// dataList has skillBbModifier etc.
		// This might be too complex for now, we'll strip placeholders.
		formatted = formatted.replace(/{[^}]+}/g, '(?)');

		return formatted;
	}
}
