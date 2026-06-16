import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import client, { getApiBaseUrl } from '../app/service/api/client';
// 유틸
import { MobileUtils } from '../utils/mobile/MobileUtils';
import type { GameType, ResultCodeType } from '../app/model/api/api';

// 캐릭터 목록 서비스
export const load: PageLoad = async () => {
	let isMobile = false;
	let data: GameType[] = [];
	let loadFailed = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}
	await client
		.get<GameType[]>('/api/v0/game/list')
		.then((res) => {
			data = res.data || [];
		})
		.catch((err) => {
			// 동일 엔드포인트 실패 토스트는 +layout.ts가 띄우므로 여기선 플래그만 노출(중복 방지).
			console.error('게임 목록 조회 실패:', err);
			loadFailed = true;
		});

	return {
		url: getApiBaseUrl(),
		isMobile: isMobile,
		info: data,
		infoError: loadFailed
	};
};
