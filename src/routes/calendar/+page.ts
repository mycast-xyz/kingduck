import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client, { getApiBaseUrl } from '../../app/service/api/client';
import { browser } from '$app/environment';

// 유틸
import { MobileUtils } from '../../utils/mobile/MobileUtils';
import type { CharacterType, ElementType, GameType, ResultCodeType } from '../../app/model/api/api';
import { CalendarInit } from '../../app/model/game/CalendarInit';
import { GameSettingInitService } from '../../app/service/game/GameSettingService';

export interface CalendarEvent {
	id: string;
	gameId: string;
	name: string;
	type: 'GACHA' | 'EVENT';
	startDate: string;
	endDate: string;
	image?: string;
	characterName?: string;
}

// 캐릭터 목록 서비스
export const load: PageLoad = async ({ url }) => {
	let isMobile = false;
	let games: GameType[] = [];
	let events: CalendarEvent[] = [];

	if (browser) {
		isMobile = MobileUtils.isMobile();

		// Initialize calendar page - clear footer copyright info
		const calendarInit = new CalendarInit();
		GameSettingInitService.updateGameInit(calendarInit.init());
	}

	// 1. Fetch Game List
	const gameRes = await client.get<GameType[]>('/api/v0/game/list');
	if (gameRes.data) {
		games = gameRes.data;
	}

	// 2. Fetch Events for all games (or a specific endpoint if available)
	// Since the user mentioned /api/v0/event/starrail, let's fetch for all games
	// For now, we'll try to fetch for each game in parallel
	try {
		// TODO: Optimize this with a single endpoint like /api/v0/event/all if possible in future
		const eventPromises = games.map((game) => client.get<any[]>(`/api/v0/event/${game.slug}`));
		const eventResults = await Promise.all(eventPromises);

		eventResults.forEach((res, index) => {
			if (res.data) {
				const gameEvents = res.data.map((e: any) => ({
					id: e.id,
					gameId: games[index].slug,
					name: e.title, // API returns title
					type: e.type, // Pass raw API type (GACHA/EVENT)
					startDate: e.startTime, // API returns startTime
					endDate: e.endTime, // API returns endTime
					image: e.image,
					characterName: e.description // Use description for now, or refine if needed
				}));
				events = [...events, ...gameEvents];
			}
		});
	} catch (e) {
		console.error('Failed to fetch events', e);
	}

	return {
		url: getApiBaseUrl(),
		isMobile: isMobile,
		info: games,
		events: events
	};
};
