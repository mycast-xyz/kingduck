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
	originalId?: string; // 원본(외부 소스) 식별자. /character/{slug}/original/{originalId} 조회용
	gameId: number;
	elementId?: number;
	pathId?: number;
	name: string;
	rarity?: number;
	weaponType?: string;
	role?: string;
	description?: string;
	imageUrl?: string; // mapped from image_url
	// 니케 metadata 에서 백엔드가 JSON path 추출로 투영하는 3개 필드.
	// 다른 게임은 null. applyFilter의 class/corp/burst 분기가 이 필드를 사용한다.
	class?: string | null;
	corp?: string | null;
	burst?: string | null;

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

// 게임별 metadata 타입과 typed 별칭(HsrCharacter 등)은 `../game/metadata`에 정의되어 있다.
// (CharacterType<T>/ItemType<T>의 T로 주입해 점진 채택. redesign-plan F-T4.)

export interface CrawlerStatusType {
	gameId: number;
	gameSlug: string; // "honkai-star-rail"
	gameName: string; // "Honkai: Star Rail"
	type: string; // "CHARACTER" | "EVENT"
	status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
	lastRunAt?: string;
	lastSuccessAt?: string;
	nextRunAt?: string;
	message?: string;
	metrics?: {
		totalRuns: number;
		successCount: number;
		failCount: number;
	};
}

export interface CrawlerLogType {
	id: number;
	gameId: number;
	gameName?: string;
	crawlerType: string;
	status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
	itemsCollected: number;
	startedAt: string;
	endedAt?: string;
	duration?: number;
	message?: string;
}

export interface CrawlerRunRequest {
	gameSlug: string;
	crawlerType: string;
}
