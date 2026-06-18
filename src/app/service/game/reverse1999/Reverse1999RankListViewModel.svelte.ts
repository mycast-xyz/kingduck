import { RankListViewModel, type RankItem } from '../RankListViewModel';

export class Reverse1999RankListViewModel extends RankListViewModel {
	get items(): RankItem[] {
		let rawItems = this.listData;

		// If listData is metadata, look for efficiency
		if (rawItems && rawItems.efficiency) {
			const efficiency = rawItems.efficiency;
			// Handle table data
			if (efficiency.table && Array.isArray(efficiency.table)) {
				return efficiency.table.map((item: any, index: number) => ({
					id: String(index),
					index: index + 1,
					name: `형상 ${item.level || index + 1}`,
					description: `효율: ${item.value}`,
					image: '', // Efficiency table usually doesn't have images per row, maybe generic?
					params: item
				}));
			}
		}

		// Fallback to old logic if no efficiency data
		if (rawItems && !Array.isArray(rawItems)) {
			if (rawItems.gacha) {
				rawItems = rawItems.gacha;
			} else {
				rawItems = Object.values(rawItems);
			}
		}

		if (!Array.isArray(rawItems)) return [];

		// null/빈 엔트리 방어(일부 캐릭터의 rank 배열에 null이 섞여 있음).
		return rawItems
			.filter((item: any) => item != null)
			.map((item: any, index: number) => ({
				id: String(item.index ?? index + 1),
				index: item.index ?? index + 1,
				name: item.name || `형상 ${index + 1}`,
				description: item.description || '',
				image: item.iconUrl || item.image || '',
				params: item
			}));
	}
}
