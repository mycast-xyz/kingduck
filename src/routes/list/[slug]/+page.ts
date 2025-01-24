import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../utils/mobile/MobileUtils';

export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	const currentUrl = 'http://' + url.hostname + ':3000';

	const gameInfoConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			//en: params.slug
		}
	};

	let gameInfo;

	await axios
		.get(currentUrl + '/api/v0/game/' + params.slug, gameInfoConfig)
		.then((res) => {
			if (res.data.resultCode === 200) {
				//console.log(res.data.items);
				gameInfo = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	const characterListConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			gameId: gameInfo.id
		}
	};

	let data: any = {};

	await axios
		.get(currentUrl + '/api/v0/character/' + params.slug, characterListConfig)
		.then((res) => {
			if (res.data.resultCode === 200) {
				//console.log(res.data.items);
				data = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	return {
		params: params.slug,
		url: currentUrl,
		isMobile: !!isMobile,
		info: gameInfo,
		list: data
	};
};
