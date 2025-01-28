import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../utils/mobile/MobileUtils';
import { GameSettingInitService } from '../../../app/service/GameSettingService';
import { HonkaiStarRailInit } from '../../../app/model/HonkaiStarRailInit';
import { GirlsFrontline2Init } from '../../../app/model/GirlsFrontline2Init';

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

	const gameTypeConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			gameId: gameInfo.id
		}
	};

	let gameType;

	await axios
		.get(currentUrl + '/api/v0/type/get/' + params.slug, gameInfoConfig)
		.then((res) => {
			if (res.data.resultCode === 200) {
				//console.log(res.data.items);
				gameType = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	// 추후에 init를 들고 오면 처리 구현이 틀려짐
	let setInit;
	switch (params.slug) {
		case 'HonkaiStarRail':
			GameSettingInitService.updateGameInit(new HonkaiStarRailInit().setInit());
			break;
		case 'GirlsFrontline2Exilium':
			GameSettingInitService.updateGameInit(new GirlsFrontline2Init().setInit());
			break;
		default:
			break;
	}

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
		list: data,
		type: gameType
	};
};
