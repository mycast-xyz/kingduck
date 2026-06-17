import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client, { getApiBaseUrl } from '../../../../app/service/api/client';
import { browser } from '$app/environment';
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';
import { GameSettingInitService } from '../../../../app/service/game/GameSettingService';
import { getGameInit } from '../../../../app/model/game/GameRegistry';
import { hsrItemService } from '../../../../app/service/game/starrail/HsrItemService';
// import { CharacterListService } from '../../../../app/service/character/CharacterListService';
import type { CharacterType, GameType, ResultCodeType } from '../../../../app/model/api/api';

export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	// 캐릭터 리스트 데이터 로드 (팀 추천 등에서 ID 참조를 위해 필요)
	// CharacterListService.clearCharacterConfig(); // 필요한 경우 초기화
	// await CharacterListService.getCharacterList(params.gameEnName);

	// 게임 설정 주입 (slug/레거시 별칭 → Init은 GameRegistry가 단일 관리)
	const gameInitConfig = getGameInit(params.gameEnName);
	if (gameInitConfig) {
		GameSettingInitService.updateGameInit(gameInitConfig);
	}

	let gameInfo: GameType | undefined;

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
				console.error('캐릭터 콘텐츠 게임 정보 조회 실패: 서버 응답 없음');
			}
		})
		.catch((err) => {
			console.error('캐릭터 콘텐츠 게임 정보 조회 실패:', err);
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
		gameSlug: params.gameEnName,
		isMobile: isMobile,
		url: getApiBaseUrl(),
		info: data,
		title: `${data?.name} - ${gameInfo?.name}`,
		meta: {
			description: `${data?.name}의 상세 정보를 제공합니다.`,
			keywords: `${gameInfo?.name}, 게임, 정보, 가이드, ${data?.name}`
		},
		gameInit: gameInitConfig
	};
};
