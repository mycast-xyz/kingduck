import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client from '../../../app/service/api/client';
import { browser } from '$app/environment';

// 유틸
import { MobileUtils } from '../../../utils/mobile/MobileUtils';
import type {
	CharacterType,
	ElementType,
	GameType,
	ResultCodeType
} from '../../../app/model/api/api';

// 캐릭터 리스트 서비스
import {
	CharacterListService,
	characterList
} from '../../../app/service/character/CharacterListService';

// 게임 초기화
import { GameSettingInitService } from '../../../app/service/game/GameSettingService';

// 게임 초기화 모델
import { HonkaiStarRailInit } from '../../../app/model/game/HonkaiStarRailInit';
import { GirlsFrontline2Init } from '../../../app/model/game/GirlsFrontline2Init';
import { nikkeInit } from '../../../app/model/game/nikkeInit';
import { Reverse1999Init } from '../../../app/model/game/Reverse1999Init';

// 캐릭터 목록 서비스
export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;
	let gameInfo: GameType | undefined;
	let gameType: ElementType[] | undefined;
	let setInit;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	const gameInfoConfig = {
		params: {
			//en: params.slug
		}
	};

	await client
		.get<GameType>('/api/v0/game/' + params.slug, gameInfoConfig)
		.then((res) => {
			if (res.status === 200) {
				gameInfo = res.data;
			} else {
				console.log('err: 서버 코드 에러');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	// CharacterListService의 메서드 호출 전에 gameInfo가 있는지 확인
	if (!gameInfo) {
		throw error(404, 'Game not found');
	}

	// 추후에 init를 들고 오면 처리 구현이 틀려짐
	switch (params.slug) {
		case 'starrail':
			GameSettingInitService.updateGameInit(new HonkaiStarRailInit().setInit());
			break;
		case 'GirlsFrontline2Exilium':
			GameSettingInitService.updateGameInit(new GirlsFrontline2Init().setInit());
			break;
		case 'nikke':
			GameSettingInitService.updateGameInit(new nikkeInit().setInit());
			break;
		case 'reverse1999':
			GameSettingInitService.updateGameInit(new Reverse1999Init().setInit());
			break;
		default:
			break;
	}
	CharacterListService.clearCharacterConfig();
	CharacterListService.getCharacterListConfig(gameInfo.id, '', '');
	await CharacterListService.getCharacterList(params.slug);
	let characterListData;
	characterList.subscribe((value) => (characterListData = value));

	return {
		params: params.slug,
		url: client.defaults.baseURL,
		isMobile: !!isMobile,
		info: gameInfo,
		list: characterListData,
		type: gameType,
		title: `${gameInfo.name} - 게임 정보`,
		meta: {
			description: `${gameInfo.name}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo.name}, 게임, 정보, 가이드`
		}
	};
};
