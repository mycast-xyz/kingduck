import { writable, type Writable } from 'svelte/store';

export class GameSettingService {
	private _defaultGameList: Writable<any>;

	constructor() {
		this._defaultGameList = writable({});
	}

	get showList() {
		return this._defaultGameList;
	}

	updateGameInit(gameInit: any) {
		// 게임 초기화 로직 구현
		this._defaultGameList.set(gameInit);
	}

	removeGameInit() {
		this._defaultGameList.set({});
	}
}

export const GameSettingInitService = new GameSettingService();
