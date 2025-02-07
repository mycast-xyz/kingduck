import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import axios from 'axios';
import { browser } from '$app/environment';

// 유틸
import { MobileUtils } from '../../../utils/mobile/MobileUtils';

// 캐릭터 리스트 서비스
import CharacterListService from '../../../app/service/character/CharacterListService';

// 게임 초기화
import { GameSettingInitService } from '../../../app/service/game/GameSettingService';

// 게임 초기화 모델
import { HonkaiStarRailInit } from '../../../app/model/HonkaiStarRailInit';
import { GirlsFrontline2Init } from '../../../app/model/GirlsFrontline2Init';
import { nikkeInit } from '../../../app/model/nikkeInit';

// 캐릭터 목록 서비스
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
				gameInfo = res.data.items;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	const characterListConfig = CharacterListService.getCharacterListConfig(
		gameInfo.id,
		url.searchParams.get('type'),
		url.searchParams.get('rarity')
	);

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
		case 'nikke':
			GameSettingInitService.updateGameInit(new nikkeInit().setInit());
			break;
		default:
			break;
	}

	let data: any = await CharacterListService.getCharacterList(
		currentUrl,
		params.slug,
		characterListConfig
	);

	return {
		params: params.slug,
		url: currentUrl,
		isMobile: !!isMobile,
		info: gameInfo,
		list: data,
		type: gameType,
		title: `${gameInfo.title.kr} - 게임 정보`,
		meta: {
			description: `${gameInfo.title.kr}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo.title.kr}, 게임, 정보, 가이드`
		}
	};
};
