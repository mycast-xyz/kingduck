import client from '../../api/client';

export class HsrItemService {
	// 아이템 리스트 조회
	async getItemList(originalId: string) {
		const params = {
			originalId: originalId
		};
		return await client.get('/api/v0/item/list', { params });
	}
}

export const hsrItemService = new HsrItemService();
