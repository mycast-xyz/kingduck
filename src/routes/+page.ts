import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import client from '../app/service/api/client';
// 유틸
import { MobileUtils } from '../utils/mobile/MobileUtils';
import type { GameType, ResultCodeType } from '../app/model/api/api';

// 캐릭터 목록 서비스
export const load: PageLoad = async ({ url }) => {
	let isMobile = false;
	let data: GameType[] = [];

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}
	await client
		.get<GameType[]>('/api/v0/game/list')
		.then((res) => {
			data = res.data || [];
		})
		.catch((err) => {
			console.log(err);
		});

	return {
		url: client.defaults.baseURL,
		isMobile: isMobile,
		info: data
	};
};
