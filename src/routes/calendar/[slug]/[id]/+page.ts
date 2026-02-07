import type { PageLoad } from './$types';
import client from '../../../../app/service/api/client';
import type { CalendarEvent, Game } from '../../../../app/model/calendar/CalendarTypes';
import { GAME_CONFIG } from '../../../../app/model/calendar/CalendarConfig';

export const load: PageLoad = async ({ params, fetch }) => {
	const { gameId } = params;

	// Fetch Game Info (mock or from config for now, ideally API would return game details)
	const gameConfig = GAME_CONFIG[gameId] || { color: 'bg-gray-500' };
	const game: Game = {
		id: gameId,
		name: gameId.charAt(0).toUpperCase() + gameId.slice(1), // Simple capitalization fallback
		color: gameConfig.color,
		icon: gameConfig.icon
	};

	let events: CalendarEvent[] = [];

	try {
		const res = await client.get<any[]>(`/api/v0/event/${gameId}`);
		if (res.data) {
			events = res.data.map((e: any) => ({
				id: e.id,
				gameId: gameId,
				name: e.title,
				type: e.type,
				startDate: new Date(e.startTime), // Convert to Date here? Or string in load and Date in component?
				// Let's return strings in load to satisfy serialization if needed, but SvelteKit can handle Dates in `data` if not using pure JSON serialization for server->client.
				// However, `+page.ts` runs on client too. Let's return raw strings and parse in component to be consistent with main calendar approach,
				// OR parse here if we want `data.events` to have Dates.
				// The main calendar parsed in `+page.svelte`. Let's do the same pattern or clean it up.
				// Actually, standard SvelteKit `load` can return Dates.
				endDate: new Date(e.endTime),
				image: e.image,
				characterName: e.description
			}));
		}
	} catch (e) {
		console.error(`Failed to fetch events for ${gameId}`, e);
	}

	return {
		game,
		events
	};
};
