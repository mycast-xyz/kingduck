import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';

export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	const currentUrl = 'http://' + url.hostname + ':3000';
	const characterListConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			id: params.characterId
		}
	};

	let data: any = {};
	await axios
		.get(
			currentUrl + '/api/v0/character/' + params.gameEnName + '/' + params.characterId,
			characterListConfig
		)
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
