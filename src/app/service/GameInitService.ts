import { writable } from 'svelte/store';

export class GameInitService {
	private _defaultGameInit = writable({});

	get showInit() {
		return this._defaultGameInit;
	}
	updateGameInit(newData: any) {
		this._defaultGameInit.update((currentData: any) => {
			return { ...currentData, ...newData };
		});
	}

	resetGameInit() {
		this._defaultGameInit.set(this._defaultGameInit);
	}
}

export const GameListInitService = new GameInitService();
