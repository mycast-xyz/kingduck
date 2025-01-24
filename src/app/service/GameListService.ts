import { writable } from 'svelte/store';

export class GameListService {
	private _defaultGameList = writable({});

	get showList() {
		return this._defaultGameList;
	}
	updateGameList(newData: any) {
		this._defaultGameList.update((currentData: any) => {
			return { ...currentData, ...newData };
		});
	}

	resetGameList() {
		this._defaultGameList.set(this._defaultGameList);
	}
}
