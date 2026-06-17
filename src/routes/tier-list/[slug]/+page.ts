import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import client, { getApiBaseUrl } from '../../../app/service/api/client';
import { browser } from '$app/environment';

// Utility
import { MobileUtils } from '../../../utils/mobile/MobileUtils';
import type {
	CharacterType,
	ElementType,
	GameType,
	ResultCodeType
} from '../../../app/model/api/api';

// Character List Service
import {
	CharacterListService,
	characterList
} from '../../../app/service/character/CharacterListService';

// Game Init Services
import { GameSettingInitService } from '../../../app/service/game/GameSettingService';
import { getGameInit } from '../../../app/model/game/GameRegistry';

// Page Load
export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;
	let gameInfo: GameType | undefined;
	let gameType: ElementType[] | undefined;

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
				console.error('티어리스트 게임 정보 조회 실패: 서버 코드', res.status);
			}
		})
		.catch((err) => {
			console.error('티어리스트 게임 정보 조회 실패:', err);
		});

	// Check if gameInfo exists before proceeding
	if (!gameInfo) {
		throw error(404, 'Game not found');
	}

	// Game Initialization (slug → Init은 GameRegistry가 단일 관리)
	const gameInit = getGameInit(params.slug);
	if (gameInit) {
		GameSettingInitService.updateGameInit(gameInit);
	}
	CharacterListService.clearCharacterConfig();
	CharacterListService.getCharacterListConfig(gameInfo.id, '', '');
	await CharacterListService.getCharacterList(params.slug);

	// get()으로 현재 값만 읽는다 — subscribe는 unsubscribe 없이 load마다 누수했다 (F-B1).
	const characterListData = get(characterList);

	return {
		params: params.slug,
		url: getApiBaseUrl(),
		isMobile: !!isMobile,
		info: gameInfo,
		list: characterListData,
		type: gameType,
		title: `${gameInfo.name} - Tier List`, // Customized Title
		meta: {
			description: `Create your own tier list for ${gameInfo.name}.`,
			keywords: `${gameInfo.name}, Tier List, Maker, Guide, Strategy`
		}
	};
};
