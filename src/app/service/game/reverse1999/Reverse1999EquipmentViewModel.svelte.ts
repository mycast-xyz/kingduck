export class Reverse1999EquipmentViewModel {
	listData: any;

	constructor(listData: any) {
		this.listData = listData;
	}

	get items() {
		let psychubes: any[] = [];

		// Check if listData matches expected structure or is the array itself
		if (Array.isArray(this.listData)) {
			psychubes = this.listData;
		} else if (this.listData?.psychubes) {
			psychubes = this.listData.psychubes;
		} else if (this.listData?.builds?.psychubes) {
			psychubes = this.listData.builds.psychubes;
		}

		if (!Array.isArray(psychubes)) return [];

		// Skip index 0 (header/disclaimer)
		return psychubes.slice(1).map((item: any, index: number) => {
			// rank is string like "...\n...\nName\n..."
			// User said [2] is name
			let name = item.rank;
			let rankTitle = '';
			if (item.rank && typeof item.rank === 'string') {
				const parts = item.rank.split('\n');
				if (parts.length > 2) {
					name = parts[2].trim();
					rankTitle = parts[0].trim(); // Maybe "1순위" etc?
				}
			}

			// Standardize item structure for EquipmentItemView
			return {
				name: { kr: name }, // Existing view expects name.kr
				title: rankTitle, // Use as extra info if needed
				info: item.details, // Description
				// For image, we'll try to use name or look for standard iconUrl if present?
				// The existing view uses item.itemReferences.image.src
				// We'll mock it for now similar to others, or rely on name-based matching if implemented.
				// Reverse 1999 usually has iconUrl in other parts, let's see if we can use it.
				// If not, we'll just pass empty or a placeholder to avoid breaking.
				itemReferences: {
					image: { src: item.iconUrl || '' }
				},
				...item
			};
		});
	}
}
