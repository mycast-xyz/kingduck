import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import type { ElementType } from '../../../app/model/api/api';

// Character List Service
import {
	CharacterListService,
	characterList
} from '../../../app/service/character/CharacterListService';

// 게임 라우트 공통 로드 (모바일 감지 + 게임정보 조회 + 설정 주입)
import { loadGameContext } from '../../../app/service/game/loadGameContext';

// Page Load
export const load: PageLoad = async ({ params }) => {
	const { isMobile, gameInfo, url } = await loadGameContext(params.slug);
	const gameType: ElementType[] | undefined = undefined;

	CharacterListService.clearCharacterConfig();
	CharacterListService.getCharacterListConfig(gameInfo.id, '', '');
	await CharacterListService.getCharacterList(params.slug);

	// get()으로 현재 값만 읽는다 — subscribe는 unsubscribe 없이 load마다 누수했다 (F-B1).
	const characterListData = get(characterList);

	return {
		params: params.slug,
		url,
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
