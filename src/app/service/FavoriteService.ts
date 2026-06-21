import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 즐겨찾기한 게임 slug 목록을 localStorage에 보관한다.
// 게임 수가 늘어나면 메뉴(사이드바)가 길어지므로, 자주 보는 게임을 상단에 고정하기 위함.
const STORAGE_KEY = 'favorite_games';

class FavoriteServiceInit {
	// 즐겨찾기 slug 배열. 컴포넌트는 이 스토어를 구독해 상단 고정 목록을 렌더한다.
	readonly favorites = writable<string[]>([]);

	constructor() {
		if (browser) {
			this.favorites.set(this.load());
		}
	}

	private load(): string[] {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
		} catch {
			return [];
		}
	}

	private persist(slugs: string[]) {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
		} catch {
			// 저장 실패(프라이빗 모드·용량 초과 등)는 무시 — 즐겨찾기는 비핵심 편의 기능.
		}
	}

	// 즐겨찾기 추가/해제 토글.
	toggle(slug: string) {
		this.favorites.update((list) => {
			const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
			this.persist(next);
			return next;
		});
	}
}

export const FavoriteService = new FavoriteServiceInit();
