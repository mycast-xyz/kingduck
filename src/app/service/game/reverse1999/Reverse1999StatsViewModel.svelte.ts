export class Reverse1999StatsViewModel {
	listData: any;
	currentUrl: string;

	// Needed for interface compatibility with StatsView
	stats: any[] = [];
	levels: number[] = [];
	currentLevel: number = 0;

	constructor(listData: any, gameId: string, currentUrl: string) {
		this.listData = listData; // This will be the full metadata object or euphoria_info directly
		this.currentUrl = currentUrl;

		// If we want to display Name and Image, we can mock it as "stats"
		// OR, StatsView is designed for numerical stats.
		// But for "Euphoria Info", it seems it's a special card.
		// However, looking at StatsView, it iterates `displayStats`.
		// We can create a dummy stat or rely on a different UI.
		// But the user asked to put it in "광상 정보" which maps to StatsView.

		// Actually, looking at the JSON, euphoria_info has Name, Effect, imageUrl.
		// StatsView expects { key, name, value, icon }.

		// Strategy:
		// We will misuse 'StatsView' slightly to display this info,
		// OR we might need to modify StatsView to handle a "Card" mode?
		// But the user said "일단 이름 / 이미지만 추가 해둘거야" (Add Name/Image only for now).

		// Let's create a "stat" entry that holds the info,
		// but maybe we should just modify StatsView to show a custom block if it detects this VM?
		// Or just map it to the existing loop.

		// Actually, StatsView has a loop for statistics.
		// If we want to show a large image and title, StatsView's current grid layout (small boxes) might not be ideal.
		// But let's follow the instruction "Add Name / Image".

		const euphoria = this.listData.euphoria_info || this.listData;

		if (euphoria) {
			this.stats = [
				{
					key: 'Name',
					name: '이름',
					value: euphoria.name,
					icon: '' // No icon needed if we just show text
				}
				// Image is usually not part of the 'stats' list which are key-value pairs.
				// But StatsView has a 승급 재료 (Ascension Material) section which shows images.
				// Maybe we can leverage that?

				// Construct a fake "costList" item to show the image?
				// costList items have { info: { imageUrl, name }, ItemNum/Value }
			];

			// Mock costList to display the image
			this.costList = [
				{
					info: {
						name: euphoria.name,
						imageUrl: euphoria.imageUrl || euphoria.iconImageUrl // Check JSON
					},
					Value: 1, // Dummy count
					ItemNum: 1
				}
			];
			// Mock promise for costList
			this.costPromise = Promise.resolve(this.costList);
		}
	}

	costList: any[] = [];
	costPromise: Promise<any[]> = Promise.resolve([]);
}
