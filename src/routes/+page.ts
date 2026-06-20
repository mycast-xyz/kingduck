import { browser } from '$app/environment';
import type { PageLoad } from './$types';
import client, { getApiBaseUrl } from '../app/service/api/client';
// 유틸
import { MobileUtils } from '../utils/mobile/MobileUtils';
import type { GameType } from '../app/model/api/api';

export interface SiteSetting {
	homeHeroBackground: string;
	homeRecentGamesLimit: number;
}

const DEFAULT_SETTING: SiteSetting = {
	homeHeroBackground: 'random',
	homeRecentGamesLimit: 6
};

// 홈은 프리렌더하지 않는다(CSR 셸 유지). adapter-static의 SPA 폴백이 index.html을 쓰는데,
// '/'를 프리렌더하면 같은 index.html을 폴백 셸이 덮어써 무의미하다. 홈까지 프리렌더하려면
// fallback 파일명을 200.html 등으로 바꾸고 웹서버가 미매치 경로에 그걸 주도록 설정해야 한다.

// 캐릭터 목록 서비스
export const load: PageLoad = async () => {
	let isMobile = false;
	let data: GameType[] = [];
	let loadFailed = false;
	let setting: SiteSetting = { ...DEFAULT_SETTING };

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

	// 사이트 설정 로드 — 실패 시 기본값 유지
	await client
		.get<SiteSetting>('/api/v0/setting')
		.then((res) => {
			if (res.data) setting = res.data;
		})
		.catch((err) => {
			console.warn('사이트 설정 조회 실패, 기본값 사용:', err);
		});

	return {
		url: getApiBaseUrl(),
		isMobile: isMobile,
		info: data,
		infoError: loadFailed,
		setting
	};
};
