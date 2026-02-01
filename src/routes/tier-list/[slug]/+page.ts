import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client from '../../../app/service/api/client';
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
import { HonkaiStarRailInit } from '../../../app/model/game/HonkaiStarRailInit';
import { GirlsFrontline2Init } from '../../../app/model/game/GirlsFrontline2Init';
import { nikkeInit } from '../../../app/model/game/nikkeInit';
import { Reverse1999Init } from '../../../app/model/game/Reverse1999Init';
import { WutheringWavesInit } from '../../../app/model/game/WutheringWavesInit';
import { EndfieldInit } from '../../../app/model/game/EndfieldInit';

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
				console.log('err: Server Error');
			}
		})
		.catch((err) => {
			console.log(err);
		});

	// Check if gameInfo exists before proceeding
	if (!gameInfo) {
		throw error(404, 'Game not found');
	}

	// Game Initialization
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
		case 'wutheringwaves':
			GameSettingInitService.updateGameInit(new WutheringWavesInit().setInit());
			break;
		case 'endfield':
			GameSettingInitService.updateGameInit(new EndfieldInit().setInit());
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
		url: `${url.protocol}//${url.hostname}:3000`,
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
