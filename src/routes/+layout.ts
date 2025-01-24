import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import axios from 'axios';
import { MobileUtils } from '../utils/mobile/MobileUtils';

export const load: LayoutLoad = async ({ url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
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

	return {
		isMobile: isMobile,
		url: currentUrl,
		info: data
	};
};
