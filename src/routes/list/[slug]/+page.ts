import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import client, { getApiBaseUrl } from '../../../app/service/api/client';
import { browser } from '$app/environment';
import { toastStore } from '../../../app/service/ToastService';

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

// 게임 초기화 모델 — slug → Init은 GameRegistry가 단일 관리
import { getGameInit } from '../../../app/model/game/GameRegistry';

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

	let fetchFailed = false;

	await client
		.get<GameType>('/api/v0/game/' + params.slug, gameInfoConfig)
		.then((res) => {
			if (res.status === 200) {
				gameInfo = res.data;
			} else {
				console.error('게임 정보 조회 실패: 서버 코드', res.status);
				fetchFailed = true;
			}
		})
		.catch((err) => {
			console.error('게임 정보 조회 실패:', err);
			fetchFailed = true;
		});

	// 네트워크/서버 장애를 "게임 없음(404)"으로 위장하지 않는다 (F-A3).
	if (fetchFailed) {
		throw error(503, '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
	}
	// CharacterListService의 메서드 호출 전에 gameInfo가 있는지 확인
	if (!gameInfo) {
		throw error(404, 'Game not found');
	}

	// 게임 설정 주입 (slug → Init은 GameRegistry가 단일 관리)
	const gameInit = getGameInit(params.slug);
	if (gameInit) {
		GameSettingInitService.updateGameInit(gameInit);
	}
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
		url: getApiBaseUrl(),
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
