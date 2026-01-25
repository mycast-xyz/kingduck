export interface ResultCodeType<T> {
	resultCode: number;
	items: T;
	message?: string;
}

export interface GameType {
	id: number;
	slug: string;
	name: string;
	description?: string;
	iconUrl?: string; // mapped from icon_url
	createdAt: string; // DateTime string
	updatedAt: string; // DateTime string
}

export interface ElementType {
	id: number;
	gameId: number;
	name: string;
	type: string; // "DamageType" | "Path" etc.
	iconUrl?: string; // mapped from icon_url
	createdAt: string;
	updatedAt: string;
}

// Generic interface for Character to support game-specific metadata
export interface CharacterType<T = any> {
	id: number;
	gameId: number;
	elementId?: number;
	pathId?: number;
	name: string;
	rarity?: number;
	weaponType?: string;
	role?: string;
	description?: string;
	imageUrl?: string; // mapped from image_url

	metadata?: T; // Game-specific data (JSON)

	createdAt: string;
	updatedAt: string;

	// Relations (Optional based on API response depth)
	game?: GameType;
	element?: ElementType;
	path?: ElementType;
}

// Generic interface for Item
export interface ItemType<T = any> {
	id: number;
	gameId: number;
	name: string;
	type: string;
	rarity?: number;
	description?: string;
	imageUrl?: string; // mapped from image_url

	metadata?: T; // Game-specific data (JSON)

	createdAt: string;
	updatedAt: string;
}

// Example Metadata Interfaces (To be expanded)
export interface GenshinCharacterMetaType {
	constellation: string[];
	vision: string;
	// ...
}

export interface NikkeCharacterMetaType {
	manufacturer: string;
	burstType: string;
	// ...
}
