import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
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

// Coupon Interfaces
export interface Coupon {
	id: number;
	groupId: number;
	code: string;
	reward: string;
}

export interface CouponGroup {
	id: number;
	gameId: number;
	title: string;
	periodText: string;
	startTime: string;
	endTime: string;
	reward: string;
	codes: Coupon[];
}

// Page Load
export const load: PageLoad = async ({ params, url }) => {
	let isMobile = false;
	let gameInfo: GameType | undefined;
	let gameType: ElementType[] | undefined;
	let coupons: CouponGroup[] = [];

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	const gameInfoConfig = {
		params: {
			//en: params.slug
		}
	};

	// Parallel Fetching
	await Promise.all([
		client.get<GameType>('/api/v0/game/' + params.slug, gameInfoConfig),
		client.get<CouponGroup[]>('/api/v0/redeem/' + params.slug)
	])
		.then(([resGame, resCoupons]) => {
			if (resGame.status === 200) {
				gameInfo = resGame.data;
			} else {
				console.error('쿠폰 페이지 게임 정보 조회 실패: 서버 코드', resGame.status);
			}

			if (resCoupons.status === 200) {
				coupons = resCoupons.data;
			} else {
				console.error('쿠폰 조회 실패: 서버 코드', resCoupons.status);
			}
		})
		.catch((err) => {
			console.error('쿠폰 페이지 데이터 조회 실패:', err);
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

	return {
		params: params.slug,
		url: getApiBaseUrl(),
		isMobile: !!isMobile,
		info: gameInfo,
		game: GameSettingInitService.getGameInit(),
		type: gameType,
		coupons: coupons,
		title: `${gameInfo.name} - Coupon`,
		meta: {
			description: `Create your own tier list for ${gameInfo.name}.`,
			keywords: `${gameInfo.name}, Coupon, Maker, Guide, Strategy`
		}
	};
};
