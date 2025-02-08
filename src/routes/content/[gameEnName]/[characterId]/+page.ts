import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';
import { GirlsFrontline2Init } from '../../../../app/model/game/GirlsFrontline2Init';
import { HonkaiStarRailInit } from '../../../../app/model/game/HonkaiStarRailInit';
import { GameSettingInitService } from '../../../../app/service/game/GameSettingService';
import { nikkeInit } from '../../../../app/model/game/nikkeInit';
export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	let gameInfo;
	console.log(url.searchParams.get('type'));

	const currentUrl = 'http://' + url.hostname + ':3000';
	const characterListConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			id: params.characterId,
			type: url.searchParams.get('type'),
			rarity: url.searchParams.get('rarity')
		}
	};

	const gameInfoConfig = {
		headers: {
			//"x-access-token": userToken,
		},
		params: {
			//en: params.slug
		}
	};

	await axios
		.get(currentUrl + '/api/v0/game/' + params.gameEnName, gameInfoConfig)
		.then((res) => {
			if (res.data.resultCode === 200) {
				gameInfo = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	// 추후에 init를 들고 오면 처리 구현이 틀려짐
	let setInit;
	switch (params.gameEnName) {
		case 'HonkaiStarRail':
			GameSettingInitService.updateGameInit(new HonkaiStarRailInit().setInit());
			break;
		case 'GirlsFrontline2Exilium':
			GameSettingInitService.updateGameInit(new GirlsFrontline2Init().setInit());
			break;
		case 'nikke':
			GameSettingInitService.updateGameInit(new nikkeInit().setInit());
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
				error(500, { message: '서버 코드 에러' });
			}
		})
		.catch((err) => {
			error(500, { message: '서버 코드 에러' });
		});

	return {
		isMobile: isMobile,
		url: currentUrl,
		info: data,
		title: `${data.name.kr} - ${gameInfo.title.kr}`,
		meta: {
			description: `${data.name.kr}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo.title.kr}, 게임, 정보, 가이드, ${data.name.kr}`
		}
	};
};
