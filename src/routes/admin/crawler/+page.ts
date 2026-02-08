import type { PageLoad } from './$types';
import client from '../../../app/service/api/client';
import type { GameType } from '../../../app/model/api/api';

export const load: PageLoad = async ({ url }) => {
	let gameList: GameType[] = [];

	// 게임 목록 조회
	await client
		.get<GameType[]>('/api/v0/game/list')
		.then((res) => {
			gameList = res.data || [];
		})
		.catch((err) => {
			console.log('게임 목록 조회 실패:', err);
		});

	return {
		gameList
	};
};
