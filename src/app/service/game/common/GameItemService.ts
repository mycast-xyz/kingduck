import client from '../../api/client';

/**
 * 게임 공용 아이템 서비스.
 *
 * `/api/v0/item/list`를 originalId + gameId로 조회한다. 게임에 무관한 로직이라
 * 과거 `starrail/HsrItemService`에 있던 것을 공용 위치로 옮겼다(redesign-plan E2).
 * Endfield·WutheringWaves 뷰모델이 starrail 모듈을 cross-import하던 문제를 해소한다.
 */
export class GameItemService {
	/** 아이템 리스트 조회 */
	async getItemList(originalId: string, gameId: string) {
		return await client.get('/api/v0/item/list', {
			params: { originalId, gameId }
		});
	}

	/** 아이템 상세 조회(originalId 기준) */
	async getItem(itemId: string | number, gameId: string) {
		return await client.get('/api/v0/item/list', {
			params: { originalId: itemId, gameId }
		});
	}
}

export const gameItemService = new GameItemService();
