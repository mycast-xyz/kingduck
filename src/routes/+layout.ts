import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import axios from 'axios';
import { MobileUtils } from '../utils/mobile/MobileUtils';

export const load: LayoutLoad = async ({ url }) => {
	let isMobile = false;
	let isAuthPage = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}
	if (url.pathname.includes('login')) {
		isAuthPage = true;
	}

	let data: any = {};

	const currentUrl = 'http://' + url.hostname + ':3000';
	await axios
		.get(currentUrl + '/api/v0/game/list')
		.then((res) => {
			if (res.data.resultCode === 200) {
				data = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	console.log(isAuthPage);

	return {
		isAuthPage: isAuthPage,
		isMobile: isMobile,
		url: currentUrl,
		info: data
	};
};
