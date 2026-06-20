import client from './api/client';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { toastStore } from './ToastService';

export interface SearchCharacter {
	id: number;
	name: string;
	gameId: string;
}

export interface SearchItem {
	id: number;
	name: string;
	gameId: string;
	type: string;
}

export interface SearchEvent {
	id: number;
	title: string;
	gameId: string;
}

export interface SearchRedeemGroup {
	id: number;
	title: string;
	gameId: string;
}

export interface SearchNotice {
	id: number;
	title: string;
}

export interface SearchFaq {
	id: number;
	question: string;
}

export interface SearchResult {
	characters: SearchCharacter[];
	items: SearchItem[];
	events: SearchEvent[];
	redeemGroups: SearchRedeemGroup[];
	notices: SearchNotice[];
	faqs: SearchFaq[];
}

class AdminSearchServiceInit {
	private _result = writable<SearchResult | null>(null);
	private _loading = writable(false);

	get result() {
		return this._result;
	}

	get loading() {
		return this._loading;
	}

	async search(q: string): Promise<void> {
		if (q.length < 2) {
			this._result.set(null);
			return;
		}

		this._loading.set(true);
		try {
			// admin 엔드포인트는 봉투 미unwrap: response.data = { resultCode, resultMsg, data }
			const response = await client.get(`/api/v0/admin/search?q=${encodeURIComponent(q)}`);
			if (response.data?.resultCode === 200) {
				this._result.set(response.data.data as SearchResult);
			} else {
				this._result.set(null);
				if (browser) {
					toastStore.error('검색에 실패했습니다.');
				}
			}
		} catch (error) {
			console.error('Admin search failed:', error);
			this._result.set(null);
			if (browser) {
				toastStore.error('검색 중 오류가 발생했습니다.');
			}
		} finally {
			this._loading.set(false);
		}
	}

	clear() {
		this._result.set(null);
	}
}

export const adminSearchService = new AdminSearchServiceInit();
