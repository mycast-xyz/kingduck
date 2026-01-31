import client from '../../api/client';

export class HsrItemService {
	// 아이템 리스트 조회
	async getItemList(originalId: string, gameId: string) {
		console.log(gameId);

		const params = {
			originalId: originalId,
			gameId: gameId
		};
		return await client.get('/api/v0/item/list', { params });
	}
	// 아이템 상세 조회
	async getItem(itemId: string | number, gameId: string) {
		console.log(gameId);
		const params = {
			originalId: itemId,
			gameId: gameId
		};
		return await client.get('/api/v0/item/list', { params });
	}
}

export const hsrItemService = new HsrItemService();
