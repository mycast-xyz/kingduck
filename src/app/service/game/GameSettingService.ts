import { get, writable, type Writable } from 'svelte/store';

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

	getGameInit(): any {
		// get()으로 즉시 읽는다 — 과거 subscribe는 unsubscribe 없이 매 호출 누수했다 (F-B1).
		return get(this._defaultGameList);
	}
}

export const GameSettingInitService = new GameSettingService();
