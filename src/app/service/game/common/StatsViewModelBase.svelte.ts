import { gameItemService } from './GameItemService';

/**
 * 캐릭터 스탯 뷰모델 공용 베이스.
 *
 * HSR·Endfield·WutheringWaves의 StatsViewModel은 `currentLevel`/`itemCache` 상태와
 * 승급 비용 아이템 조회(`loadCostItems`)가 거의 동일(85%+ 중복)했다(redesign-plan E2).
 * 공통 상태·로직을 여기로 올리고, 게임별로 다른 부분만 서브클래스가 구현한다:
 *   - `stats` / `costList` ($derived)
 *   - `getCostItemId(cost)`: cost 엔트리에서 아이템 id를 꺼내는 방법(게임마다 필드명이 다름)
 *   - 스탯 아이콘/이름 등 헬퍼
 */
export abstract class StatsViewModelBase {
	listData: any;
	gameId: string;
	currentUrl: string;
	currentLevel = $state(1);
	itemCache = $state<Record<string, any>>({});

	constructor(listData: any, gameId: string, currentUrl = '') {
		this.listData = listData || {};
		this.gameId = gameId;
		this.currentUrl = currentUrl;
	}

	/** cost 엔트리에서 아이템 조회 id를 추출한다(게임별 필드명 차이 흡수). */
	protected abstract getCostItemId(cost: any): string;

	/** cost 목록의 각 아이템 상세를 조회·캐시해 `info`를 붙여 반환한다. (게임 공통) */
	async loadCostItems(costs: any[]) {
		if (!costs || costs.length === 0) return [];

		const promises = costs.map(async (item) => {
			const id = this.getCostItemId(item);
			if (this.itemCache[id]) {
				return { ...item, info: this.itemCache[id] };
			}
			try {
				const res: any = await gameItemService.getItem(id, this.gameId);
				let info: any = res.data ?? res;
				// 응답이 배열/페이지네이션 래퍼인 경우 첫 항목 사용
				if (Array.isArray(info)) {
					info = info[0];
				} else if (info && Array.isArray(info.data)) {
					info = info.data[0];
				}
				this.itemCache[id] = info;
				return { ...item, info };
			} catch (e) {
				console.error(`Failed to load item ${id}`, e);
				return { ...item, info: null };
			}
		});

		return Promise.all(promises);
	}
}
