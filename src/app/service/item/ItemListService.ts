import { get, writable } from 'svelte/store';
import client from '../api/client';
import type { ItemType } from '../../model/api/api';

/**
 * standalone 아이템 화면(`/item/[slug]`)용 리스트 서비스.
 *
 * 백엔드 `/api/v0/item/list`는 `gameId`/`originalId` 필터만 지원하고 `type` 필터는 없다.
 * → gameId로 전체를 한 번 받아오고 타입/검색 필터는 클라이언트에서 적용한다.
 * (캐릭터 리스트의 CharacterListService와 동일한 싱글톤+스토어 패턴.)
 */
class ItemListServiceInit {
	private _allItems: ItemType[] = [];
	private _type = writable('');
	private _searchQuery = writable('');

	// 빠른 네비게이션 시 stale 응답을 가려낸다(CharacterListService F-B2와 동일).
	private _activeGameId = -1;

	public clear() {
		this._type.set('');
		this._searchQuery.set('');
		this._allItems = [];
		itemList.set([]);
	}

	public setType(type: string) {
		this._type.set(type);
		this.applyFilter();
	}

	public setSearchQuery(query: string) {
		this._searchQuery.set(query);
		this.applyFilter();
	}

	/**
	 * 큐레이션된 타입들을 각각 서버에서 받아 합친다(타입별 조회 → 백엔드 MAX_LIST 1000 잘림 방지).
	 * @param types 큐레이션 타입 목록(itemTabs). 미지정 시 gameId 전체(구버전 호환).
	 */
	public async getItemList(
		gameId: number,
		types?: string[]
	): Promise<'ok' | 'error' | 'stale'> {
		this._activeGameId = gameId;
		try {
			let items: ItemType[];
			if (types && types.length) {
				const responses = await Promise.all(
					types.map((type) =>
						client.get<ItemType[]>('/api/v0/item/list', { params: { gameId, type } })
					)
				);
				items = responses.flatMap((r) => r.data || []);
			} else {
				const response = await client.get<ItemType[]>('/api/v0/item/list', {
					params: { gameId }
				});
				items = response.data || [];
			}
			if (this._activeGameId !== gameId) return 'stale';
			this._allItems = items;
			this.applyFilter();
			return 'ok';
		} catch (error) {
			if (this._activeGameId !== gameId) return 'stale';
			console.error('아이템 리스트 조회 중 오류 발생:', error);
			this._allItems = [];
			itemList.set([]);
			return 'error';
		}
	}

	private applyFilter() {
		const currentType = get(this._type);
		const currentSearch = get(this._searchQuery).trim().toLowerCase();

		let filtered = [...this._allItems];

		if (currentType) {
			filtered = filtered.filter((it) => it.type === currentType);
		}
		if (currentSearch) {
			filtered = filtered.filter((it) => it.name.toLowerCase().includes(currentSearch));
		}

		itemList.set(filtered);
	}
}

export const ItemListService = new ItemListServiceInit();

export const itemList = writable<ItemType[]>([]);
