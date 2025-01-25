import { writable } from 'svelte/store';
import { HonkaiStarRailInit } from '../model/HonkaiStarRailInit';
import { GirlsFrontline2Init } from '../model/GirlsFrontline2Init';

export class GameSettingService {
	private _defaultGameList = writable({});

	get showList() {
		return this._defaultGameList;
	}
	updateGameInit(gameInit: any) {
		// 게임 초기화 로직 구현
		this._defaultGameList.set(gameInit);
	}

	removeGameInit() {
		this._defaultGameList.set(this._defaultGameList);
	}
}

export const GameSettingInitService = new GameSettingService();
