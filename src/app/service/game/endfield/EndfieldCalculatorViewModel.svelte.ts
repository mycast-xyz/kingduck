export class EndfieldCalculatorViewModel {
	items = $derived.by(() => {
		// Calculate materials needed for maxing out
		// Input listData is likely 'talentNodeMap'

		if (!this.data) return [];

		const nodes = Object.values(this.data);
		const materials: Record<string, any> = {};

		// 1. Ascension (CharBreak)
		const charBreaks = nodes.filter((n: any) => n.nodeType === 'CharBreak');
		charBreaks.forEach((node: any) => {
			if (node.requiredItem) {
				node.requiredItem.forEach((req: any) => {
					this.addMaterial(materials, req);
				});
			}
		});

		// 2. Skill Level Up (From 'talents' -> 'skillLevelUp' if this class had access to full metadata)
		// But currently mapped to 'talentNodeMap'.
		// Ideally we want to show "Ascension Materials" and "Skill Materials" separately or combined?
		// For a simple view, let's just show Ascension for now as 'talentNodeMap' has it.

		return Object.values(materials).map((item: any) => ({
			id: item.id,
			name: item.name || item.id, // Need name mapping?
			count: item.count,
			image: item.id.includes('gold')
				? `/assets/image/endfield/item/gold.webp`
				: `/assets/image/endfield/item/${item.id}.webp` // Placeholder path
		}));
	});

	data: any;
	currentUrl: string;

	constructor(data: any, currentUrl: string) {
		this.data = data;
		this.currentUrl = currentUrl;
	}

	addMaterial(dict: Record<string, any>, item: any) {
		if (!dict[item.id]) {
			dict[item.id] = { ...item, count: 0 };
		}
		dict[item.id].count += item.count;
	}
}
