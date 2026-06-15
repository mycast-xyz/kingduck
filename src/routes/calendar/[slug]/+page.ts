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
import { HonkaiStarRailInit } from '../../../app/model/game/HonkaiStarRailInit';
import { GirlsFrontline2Init } from '../../../app/model/game/GirlsFrontline2Init';
import { nikkeInit } from '../../../app/model/game/nikkeInit';
import { Reverse1999Init } from '../../../app/model/game/Reverse1999Init';
import { WutheringWavesInit } from '../../../app/model/game/WutheringWavesInit';
import { EndfieldInit } from '../../../app/model/game/EndfieldInit';

// Calendar & Weather Alert
import type { CalendarEvent } from '../../../app/model/calendar/CalendarTypes';
import { analyzeWeatherAlert } from '../../../app/model/calendar/WeatherAlertCalculator';

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
	let events: CalendarEvent[] = [];

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
		client.get<CouponGroup[]>('/api/v0/redeem/' + params.slug),
		client.get<any[]>('/api/v0/event/' + params.slug) // 실제 존재하는 API
	])
		.then(([resGame, resCoupons, resEvents]) => {
			if (resGame.status === 200) {
				gameInfo = resGame.data;
			} else {
				console.log('err: Server Error (Game Info)');
			}

			if (resCoupons.status === 200) {
				coupons = resCoupons.data;
			} else {
				console.log('err: Server Error (Coupons)');
			}

			if (resEvents.status === 200 && resEvents.data) {
				// Map API response to CalendarEvent format
				events = resEvents.data.map((e: any) => ({
					id: e.id,
					gameId: params.slug,
					name: e.title, // API returns 'title'
					type: e.type, // 'GACHA' | 'EVENT' | 'MAINTENANCE'
					startDate: new Date(e.startTime), // API returns 'startTime'
					endDate: new Date(e.endTime), // API returns 'endTime'
					image: e.image,
					characterName: e.description
				}));
			} else {
				console.log('err: Server Error (Events)');
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

	// Analyze weather alert for this game
	const weatherAlert = analyzeWeatherAlert(events, new Date());

	return {
		params: params.slug,
		url: getApiBaseUrl(),
		isMobile: !!isMobile,
		info: gameInfo,
		game: GameSettingInitService.getGameInit(),
		type: gameType,
		coupons: coupons,
		events: events,
		weatherAlert: weatherAlert,
		title: `${gameInfo.name} - Weather Forecast`,
		meta: {
			description: `Weather forecast and event timeline for ${gameInfo.name}.`,
			keywords: `${gameInfo.name}, Gacha, Forecast, Events, Calendar`
		}
	};
};
