import { get, writable } from 'svelte/store';
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

	// 마지막으로 요청한 slug. 빠른 네비게이션 시 stale 응답을 가려낸다 (F-B2).
	private _activeSlug = '';

	// 세션 내 게임별 리스트 캐시 — 같은 게임 리스트 재진입(뒤로가기 등) 시 네트워크 생략.
	// raw 리스트만 캐시하고 필터는 매번 applyFilter로 재적용한다. TTL 내에서만 유효.
	private _listCache = new Map<string, { data: CharacterType[]; at: number }>();
	private readonly LIST_CACHE_TTL = 5 * 60 * 1000;

	// 'ok'/'error'는 호출부(load)가 장애를 표면화하는 데 쓰고 (F-A3),
	// 'stale'은 superseded된 응답이라 현재 게임 데이터를 건드리지 않는다 (F-B2).
	public async getCharacterList(slug: string): Promise<'ok' | 'error' | 'stale'> {
		this._activeSlug = slug;

		// 캐시 적중(TTL 내) → 네트워크 없이 즉시 렌더.
		const cached = this._listCache.get(slug);
		if (cached && Date.now() - cached.at < this.LIST_CACHE_TTL) {
			this._allCharacters = cached.data;
			this.applyFilter();
			return 'ok';
		}

		try {
			// Always fetch fresh data on initial load of the page/component call
			const response = await client.get<CharacterType[]>(`/api/v0/character/${slug}/list`);

			// 응답 도착 사이에 다른 게임으로 네비게이션했다면 덮어쓰지 않고 폐기한다.
			if (this._activeSlug !== slug) return 'stale';

			if (response.data) {
				this._allCharacters = response.data || [];
				this._listCache.set(slug, { data: this._allCharacters, at: Date.now() });
				this.applyFilter();
				return 'ok';
			}
			console.error('캐릭터 리스트 조회 실패: 응답 본문 없음');
			this._allCharacters = [];
			characterList.set([]);
			return 'error';
		} catch (error) {
			if (this._activeSlug !== slug) return 'stale';
			console.error('캐릭터 리스트 조회 중 오류 발생:', error);
			this._allCharacters = [];
			characterList.set([]);
			return 'error';
		}
	}

	public getCharacterById(id: number | string): CharacterType | undefined {
		return this._allCharacters.find(
			(char) => char.id == Number(id) || char.originalId == String(id)
		);
	}

	private applyFilter() {
		const currentType = get(this._characterType);
		const currentRarity = get(this._characterRarity);

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
		const currentSearchQuery = get(this._searchQuery);

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
