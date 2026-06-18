import { RankListViewModel, type RankItem } from '../RankListViewModel';

/**
 * ZZZ 심상 영식(재능) 뷰모델 — RankListView가 starrail 성혼과 동일하게 렌더하도록 어댑팅.
 * metadata.talents = [{ name, description }] (6개 = 심상 영식 1~6).
 */
export class ZzzRankListViewModel extends RankListViewModel {
	get items(): RankItem[] {
		const raw = Array.isArray(this.listData)
			? this.listData
			: Object.values(this.listData || {});
		return raw.map((t: any, i: number) => ({
			id: i,
			name: t.name || '',
			description: t.description || '',
			image: t.icon || '',
			index: i + 1
		}));
	}
}
