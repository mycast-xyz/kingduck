import { writable } from 'svelte/store';
import client from '../api/client';
import type { CharacterType, ResultCodeType } from '../../model/api/api';

class CharacterListServiceInit {
	static _characterConfig: {
		params: { gameId: number; type: string; rarity: string };
	};
	static _characterData: CharacterType[];

	private _allCharacters: CharacterType[] = [];

	private _characterRarity = writable('');
	private _characterType = writable('');
	private _searchQuery = writable('');

	public clearCharacterConfig() {
		this._characterRarity.set('');
		this._characterType.set('');
		this._searchQuery.set('');
		this._allCharacters = [];
	}

	public getCharacterListConfig(gameId: number, type: string | null, rarity: string | null) {
		// Update stores with new values if provided
		if (type !== null) {
			this._characterType.set(type);
		}
		if (rarity !== null) {
			this._characterRarity.set(rarity);
		}

		// Apply client-side filter
		this.applyFilter();
	}

	public setSearchQuery(query: string) {
		this._searchQuery.set(query);
		this.applyFilter();
	}

	// 성공 여부를 반환해 호출부(load)가 장애를 표면화할 수 있게 한다 (F-A3).
	public async getCharacterList(slug: string): Promise<boolean> {
		try {
			// Always fetch fresh data on initial load of the page/component call
			const response = await client.get<CharacterType[]>(`/api/v0/character/${slug}/list`);

			if (response.data) {
				this._allCharacters = response.data || [];
				this.applyFilter();
				return true;
			} else {
				console.error('캐릭터 리스트 조회 실패: 응답 본문 없음');
				this._allCharacters = [];
				characterList.set([]);
				return false;
			}
		} catch (error) {
			console.error('캐릭터 리스트 조회 중 오류 발생:', error);
			this._allCharacters = [];
			characterList.set([]);
			return false;
		}
	}

	public getCharacterById(id: number | string): CharacterType | undefined {
		return this._allCharacters.find(
			(char) => char.id == Number(id) || char.originalId == String(id)
		);
	}

	private applyFilter() {
		let currentType = '';
		let currentRarity = '';

		const unsubscribeType = this._characterType.subscribe((v) => (currentType = v));
		const unsubscribeRarity = this._characterRarity.subscribe((v) => (currentRarity = v));
		unsubscribeType();
		unsubscribeRarity();

		let filtered = [...this._allCharacters];

		// Filter by Type (Element, Path, etc.)
		if (currentType) {
			const typeList = currentType.split('*');

			// Filter logic: Pass if character matches ALL filter criteria specified.
			// Criteria come as key+value.
			filtered = filtered.filter((char) => {
				return typeList.every((t) => {
					const [k, v] = t.split('+');
					// 'elementId' -> check char.elementId
					// 'pathId' -> check char.pathId
					// 'damageType', 'baseTypeChar' -> maps to elementId/pathId usually, but strictly using correct keys now

					if (k === 'elementId' || k === 'damageType' || k === 'elementType') {
						return char.elementId == Number(v);
					}
					if (k === 'pathId' || k === 'baseTypeChar') {
						return char.pathId == Number(v);
					}
					if (k === 'weaponType') {
						return char.weaponType == v || char.metadata?.weaponType == v;
					}
					// Default fallback check?
					return true;
				});
			});
		}

		// Filter by Rarity
		if (currentRarity) {
			filtered = filtered.filter((char) => char.rarity == Number(currentRarity));
		}

		// Filter by Search Query
		let currentSearchQuery = '';
		const unsubscribeSearch = this._searchQuery.subscribe((v) => (currentSearchQuery = v));
		unsubscribeSearch();

		if (currentSearchQuery.trim()) {
			filtered = filtered.filter((char) =>
				char.name.toLowerCase().includes(currentSearchQuery.toLowerCase())
			);
		}

		characterList.set(filtered);
	}
}

export const CharacterListService = new CharacterListServiceInit();

export const characterList = writable<CharacterType[]>([]);
