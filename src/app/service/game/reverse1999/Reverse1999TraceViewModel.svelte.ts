export class Reverse1999TraceViewModel {
	listData: any; // metadata object

	constructor(listData: any) {
		this.listData = listData;
	}

	get items() {
		// Data path: metadata -> builds -> resonance
		// listData passed here is likely 'metadata' based on our Init change plan
		const builds = this.listData?.builds || this.listData; // Handle if builds is passed directly or root
		const resonance = builds?.resonance;

		if (!Array.isArray(resonance)) return [];

		return resonance.map((item: any) => ({
			name: item.name,
			description: item.priority || '', // Use priority as description
			image: item.iconUrl || '', // No image in data mostly, leave empty
			// Original data for fallback
			...item
		}));
	}
}
