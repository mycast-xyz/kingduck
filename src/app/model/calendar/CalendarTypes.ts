export type EventType = 'GACHA' | 'EVENT' | 'MAINTENANCE';

export interface CalendarEvent {
	id: string;
	gameId: string;
	name: string;
	type: EventType;
	startDate: Date;
	endDate: Date;
	image?: string;
	characterName?: string;
}

export type LayoutEvent = CalendarEvent & { row: number };

export interface Game {
	id: string;
	name: string;
	color: string;
	icon?: string;
}
