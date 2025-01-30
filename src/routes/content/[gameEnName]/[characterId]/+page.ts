import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';
import { GirlsFrontline2Init } from '../../../../app/model/GirlsFrontline2Init';
import { HonkaiStarRailInit } from '../../../../app/model/HonkaiStarRailInit';
import { GameSettingInitService } from '../../../../app/service/GameSettingService';

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

	// 추후에 init를 들고 오면 처리 구현이 틀려짐
	let setInit;
	switch (params.gameEnName) {
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
