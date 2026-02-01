export interface RankItem {
	id: string | number;
	name: string;
	description: string;
	image: string;
	index: number;
}

export abstract class RankListViewModel {
	constructor(
		protected listData: any,
		protected gameSlug: string,
		protected currentUrl: string
	) {}

	abstract get items(): RankItem[];
}
