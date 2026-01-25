import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import client from '../app/service/api/client';
import { MobileUtils } from '../utils/mobile/MobileUtils';
import { error } from '@sveltejs/kit';
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

	await client
		.get<GameType[]>('/api/v0/game/list')
		.then((res) => {
			data = res.data || [];
		})
		.catch((err) => {
			console.log(err);
		});

	return {
		params: params.slug,
		isNotLayoutPage: isNotLayoutPage,
		isMobile: isMobile,
		url: client.defaults.baseURL,
		info: Array.isArray(data) ? data : []
	};
};
