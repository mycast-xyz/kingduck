import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client from '../../../../app/service/api/client';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';
import { GirlsFrontline2Init } from '../../../../app/model/game/GirlsFrontline2Init';
import { HonkaiStarRailInit } from '../../../../app/model/game/HonkaiStarRailInit';
import { GameSettingInitService } from '../../../../app/service/game/GameSettingService';
import { nikkeInit } from '../../../../app/model/game/nikkeInit';
import { Reverse1999Init } from '../../../../app/model/game/Reverse1999Init';
import { WutheringWavesInit } from '../../../../app/model/game/WutheringWavesInit';
import { hsrItemService } from '../../../../app/service/game/starrail/HsrItemService';
import type { CharacterType, GameType, ResultCodeType } from '../../../../app/model/api/api';

export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	// 추후에 init를 들고 오면 처리 구현이 틀려짐
	let gameInitConfig;
	switch (params.gameEnName) {
		case 'HonkaiStarRail':
		case 'starrail':
			gameInitConfig = new HonkaiStarRailInit().setInit();
			break;
		case 'GirlsFrontline2Exilium':
			gameInitConfig = new GirlsFrontline2Init().setInit();
			break;
		case 'nikke':
			gameInitConfig = new nikkeInit().setInit();
			break;
		case 'reverse1999':
			gameInitConfig = new Reverse1999Init().setInit();
			break;
		case 'wutheringwaves':
		case 'WutheringWaves':
			gameInitConfig = new WutheringWavesInit().setInit();
			break;
		default:
			break;
	}

	// Legacy support: still update service for any components outside of this flow
	if (gameInitConfig) {
		GameSettingInitService.updateGameInit(gameInitConfig);
	}

	let gameInfo: GameType | undefined;
	console.log(url.searchParams.get('type'));

	const characterListConfig = {
		params: {
			id: params.characterId,
			type: url.searchParams.get('type'),
			rarity: url.searchParams.get('rarity')
		}
	};

	const gameInfoConfig = {
		params: {
			//en: params.slug
		}
	};

	await client
		.get<GameType>('/api/v0/game/' + params.gameEnName, gameInfoConfig)
		.then((res) => {
			if (res.data) {
				gameInfo = res.data;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	let data: CharacterType | undefined;
	await client
		.get<CharacterType>('/api/v0/character/' + params.gameEnName + '/' + params.characterId)
		.then((res) => {
			if (res.data) {
				data = res.data;
			} else {
				error(500, { message: '서버 코드 에러' });
			}
		})
		.catch((err) => {
			error(500, { message: '서버 코드 에러' });
		});

	return {
		isMobile: isMobile,
		url: client.defaults.baseURL,
		info: data,
		title: `${data?.name} - ${gameInfo?.name}`,
		meta: {
			description: `${data?.name}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo?.name}, 게임, 정보, 가이드, ${data?.name}`
		},
		gameInit: gameInitConfig
	};
};
