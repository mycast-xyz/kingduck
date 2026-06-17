import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { toastStore } from '../../../app/service/ToastService';
import type { ElementType } from '../../../app/model/api/api';

// 캐릭터 리스트 서비스
import {
	CharacterListService,
	characterList
} from '../../../app/service/character/CharacterListService';

// 게임 라우트 공통 로드 (모바일 감지 + 게임정보 조회 + 설정 주입)
import { loadGameContext } from '../../../app/service/game/loadGameContext';

// 캐릭터 목록 서비스
export const load: PageLoad = async ({ params }) => {
	const { isMobile, gameInfo, url } = await loadGameContext(params.slug);
	const gameType: ElementType[] | undefined = undefined;

	CharacterListService.clearCharacterConfig();
	CharacterListService.getCharacterListConfig(gameInfo.id, '', '');
	const listStatus = await CharacterListService.getCharacterList(params.slug);
	// get()으로 현재 값만 읽는다 — subscribe는 unsubscribe 없이 load마다 누수했다 (F-B1).
	const characterListData = get(characterList);

	// 캐릭터 목록 실패는 게임 정보와 달리 페이지는 살리고 토스트로 알린다 (F-A3).
	// 'stale'(빠른 네비로 superseded된 응답)은 에러로 취급하지 않는다 (F-B2).
	if (browser && listStatus === 'error') {
		toastStore.error('캐릭터 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
	}

	return {
		params: params.slug,
		url,
		isMobile: !!isMobile,
		info: gameInfo,
		list: characterListData,
		listError: listStatus === 'error',
		type: gameType,
		title: `${gameInfo.name} - 게임 정보`,
		meta: {
			description: `${gameInfo.name}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo.name}, 게임, 정보, 가이드`
		}
	};
};
