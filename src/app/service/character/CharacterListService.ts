import { writable } from 'svelte/store';
import axios from 'axios';

class CharacterListServiceInit {
	static _characterConfig: {
		headers: {};
		params: { gameId: number; type: string; rarity: string };
	};
	static _characterData: any;

	private _characterConfig = {};
	private _characterRarity = writable('');
	private _characterType = writable('');

	public clearCharacterConfig() {
		this._characterRarity.set('');
		this._characterType.set('');
	}

	public getCharacterListConfig(gameId: number, type: string | null, rarity: string | null) {
		const params: Record<string, any> = {
			gameId: gameId
		};

		console.log(rarity);

		if (type && type !== '' && type !== null) {
			console.log('set2');
			this._characterType.set(type);
		}
		if (rarity && rarity !== '' && rarity !== null) {
			console.log('set');
			this._characterRarity.set(rarity);
		}

		this._characterType.subscribe((value) => {
			params.type = value;
		});
		this._characterRarity.subscribe((value) => {
			params.rarity = value;
		});

		console.log(params.rarity);

		this._characterConfig = {
			headers: {},
			params: {
				gameId: params.gameId,
				type: params.type || '',
				rarity: params.rarity || ''
			}
		};
	}

	public async getCharacterList(currentUrl: string, slug: string) {
		try {
			const response = await axios.get(
				`${currentUrl}/api/v0/character/${slug}`,
				this._characterConfig
			);

			if (response.data && response.data.resultCode == 200) {
				characterList.set(response.data.items || []);
			} else {
				console.log('err: 서버 코드 에러');
				characterList.set([]);
			}
		} catch (error) {
			console.error('캐릭터 리스트 조회 중 오류 발생:', error);
			characterList.set([]);
		}
	}
}

export const CharacterListService = new CharacterListServiceInit();

export const characterList = writable([]);
