import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import client, { getApiBaseUrl } from '../../../../app/service/api/client';
import { browser } from '$app/environment';

// Utility
import { MobileUtils } from '../../../../utils/mobile/MobileUtils';
import type {
	CharacterType,
	ElementType,
	GameType,
	ResultCodeType
} from '../../../../app/model/api/api';

// Character List Service
import {
	CharacterListService,
	characterList
} from '../../../../app/service/character/CharacterListService';

// Game Init Services
import { GameSettingInitService } from '../../../../app/service/game/GameSettingService';
import { getGameInit } from '../../../../app/model/game/GameRegistry';

// Calendar & Weather Alert
import type { CalendarEvent } from '../../../../app/model/calendar/CalendarTypes';
import { analyzeWeatherAlert } from '../../../../app/model/calendar/WeatherAlertCalculator';

// Coupon Interfaces (Re-used from main page)
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

	const { slug: gameId, id: eventId } = params;

	const gameInfoConfig = {
		params: {
			//en: params.slug
		}
	};

	// Parallel Fetching
	await Promise.all([
		client.get<GameType>('/api/v0/game/' + gameId, gameInfoConfig),
		client.get<CouponGroup[]>('/api/v0/redeem/' + gameId),
		client.get<any>('/api/v0/event/detail/' + eventId)
	])
		.then(async ([resGame, resCoupons, resEvent]) => {
			if (resGame.status === 200) {
				gameInfo = resGame.data;
			} else {
				console.error('이벤트 상세 게임 정보 조회 실패: 서버 코드', resGame.status);
			}

			if (resCoupons.status === 200) {
				coupons = resCoupons.data;
			} else {
				console.error('이벤트 상세 쿠폰 조회 실패: 서버 코드', resCoupons.status);
			}

			if (resEvent.status === 200 && resEvent.data) {
				const e = resEvent.data;
				const detailedEvent = {
					id: e.id,
					gameId: gameId,
					name: e.title,
					type: e.type,
					startDate: new Date(e.startTime),
					endDate: new Date(e.endTime),
					image: e.image,
					characterName: e.description,
					metadata: e.metadata || {},
					officialLink: e.officialLink
				};

				// Helper to fetch details
				const fetchDetails = async (names: string[], type: 'character' | 'item') => {
					const promises = names.map((name) =>
						client
							.get(`/api/v0/${type}/${gameId}/name/${encodeURIComponent(name.trim())}`)
							.then((res) => (res.status === 200 ? { ...res.data, name } : { name }))
							.catch((err) => {
								console.error(`Failed to fetch ${type} detail for ${name}`, err);
								return { name };
							})
					);
					return Promise.all(promises);
				};

				// Process Metadata Details
				if (detailedEvent.metadata) {
					// Endfield Specific Handling
					if (gameId === 'endfield') {
						if (
							detailedEvent.metadata.featuredCharacters &&
							Array.isArray(detailedEvent.metadata.featuredCharacters)
						) {
							detailedEvent.metadata.featuredCharacters = await fetchDetails(
								detailedEvent.metadata.featuredCharacters,
								'character'
							);
						}
						if (
							detailedEvent.metadata.characters &&
							Array.isArray(detailedEvent.metadata.characters)
						) {
							detailedEvent.metadata.characters = await fetchDetails(
								detailedEvent.metadata.characters,
								'character'
							);
						}
					} else {
						// Standard Handling for other games
						// Characters
						if (
							detailedEvent.metadata.characters &&
							!Array.isArray(detailedEvent.metadata.characters)
						) {
							for (const [rarity, names] of Object.entries(detailedEvent.metadata.characters)) {
								if (Array.isArray(names)) {
									detailedEvent.metadata.characters[rarity] = await fetchDetails(
										names as string[],
										'character'
									);
								}
							}
						}
						// Weapons
						if (detailedEvent.metadata.weapons) {
							for (const [rarity, names] of Object.entries(detailedEvent.metadata.weapons)) {
								if (Array.isArray(names)) {
									detailedEvent.metadata.weapons[rarity] = await fetchDetails(names, 'item');
								}
							}
						}
						// Items
						if (detailedEvent.metadata.items) {
							for (const [rarity, names] of Object.entries(detailedEvent.metadata.items)) {
								if (Array.isArray(names)) {
									detailedEvent.metadata.items[rarity] = await fetchDetails(names, 'item');
								}
							}
						}
					}
				}

				// For compatibility with components expecting a list, we put the single event in the array
				events = [detailedEvent];
			} else {
				console.error('이벤트 상세 조회 실패: 서버 코드', resEvent.status);
			}
		})
		.catch((err) => {
			console.error('이벤트 상세 데이터 조회 실패:', err);
		});

	// Check if gameInfo exists before proceeding
	if (!gameInfo) {
		throw error(404, 'Game not found');
	}

	// Game Initialization (slug → Init은 GameRegistry가 단일 관리)
	const gameInit = getGameInit(gameId);
	if (gameInit) {
		GameSettingInitService.updateGameInit(gameInit);
	}

	// Analyze weather alert
	const weatherAlert = analyzeWeatherAlert(events, new Date());

	// Find the specific event
	const event = events.find((e) => String(e.id) === eventId);

	if (!event) {
		throw error(404, 'Event not found');
	}

	return {
		params: gameId,
		url: getApiBaseUrl(),
		isMobile: !!isMobile,
		info: gameInfo,
		game: GameSettingInitService.getGameInit(),
		type: gameType,
		coupons: coupons,
		events: events,
		weatherAlert: weatherAlert,
		title: `${event.name} - ${gameInfo.name}`, // Update title to include event name
		meta: {
			description: `Detailed information for ${event.name} in ${gameInfo.name}.`,
			keywords: `${gameInfo.name}, ${event.name}, Event, Calendar`
		},
		event // Add specific event to return data
	};
};
