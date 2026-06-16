import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import client, { getApiBaseUrl } from '../app/service/api/client';
import { MobileUtils } from '../utils/mobile/MobileUtils';
import { error } from '@sveltejs/kit';
import { toastStore } from '../app/service/ToastService';
import type { GameType, ResultCodeType } from '../app/model/api/api';

export const load: LayoutLoad = async ({ params, url }) => {
	let isMobile = false;
	let isNotLayoutPage = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}
	if (url.pathname.includes('login')) {
		isNotLayoutPage = true;
	}
	if (url.pathname.includes('admin')) {
		isNotLayoutPage = true;
	}

	let data: GameType[] = [];
	let loadFailed = false;

	await client
		.get<GameType[]>('/api/v0/game/list')
		.then((res) => {
			data = res.data || [];
		})
		.catch((err) => {
			console.error('게임 목록 조회 실패:', err);
			loadFailed = true;
		});

	// 장애를 "데이터 없음"으로 위장하지 않고 사용자에게 알린다 (F-A3).
	if (browser && loadFailed) {
		toastStore.error('게임 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
	}

	return {
		params: params.slug,
		isNotLayoutPage: isNotLayoutPage,
		isMobile: isMobile,
		url: getApiBaseUrl(),
		info: Array.isArray(data) ? data : [],
		infoError: loadFailed
	};
};
