import client from './api/client';
import { writable } from 'svelte/store';

export interface GameCompleteness {
	gameId: string;
	gameName: string;
	totalCharacters: number;
	completedCharacters: number;
	completeness: number;
}

export class AdminStatsService {
	private _completeness = writable<GameCompleteness[]>([]);

	get completeness() {
		return this._completeness;
	}

	async fetchCompleteness() {
		try {
			// 실제 구현에서는 캐릭터, 아이템 API 등을 호출하여 분석해야 함
			// 여기서는 예시 데이터를 반환하고, 추후 실제 API 연동 로직 추가
			// const response = await client.get('/admin/stats/completeness');

			// Mock data based on current context
			const mockData: GameCompleteness[] = [
				{
					gameId: 'starrail',
					gameName: 'Honkai: Star Rail',
					totalCharacters: 80,
					completedCharacters: 75,
					completeness: 93.75
				},
				{
					gameId: 'wutheringwaves',
					gameName: 'Wuthering Waves',
					totalCharacters: 40,
					completedCharacters: 32,
					completeness: 80
				},
				{
					gameId: 'reverse1999',
					gameName: 'Reverse: 1999',
					totalCharacters: 60,
					completedCharacters: 45,
					completeness: 75
				},
				{
					gameId: 'endfield',
					gameName: 'Arknights: Endfield',
					totalCharacters: 20,
					completedCharacters: 18,
					completeness: 90
				}
			];

			this._completeness.set(mockData);
		} catch (error) {
			console.error('Failed to fetch completeness stats:', error);
		}
	}

	// 방문자 통계 (Mock)
	getVisitorStats() {
		return {
			labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			data: [1200, 1900, 1500, 2100, 2400, 1800, 1300]
		};
	}

	// 인기 키워드 (Mock)
	getPopularKeywords() {
		return [
			{ keyword: '반디', count: 1250 },
			{ keyword: '카멜리아', count: 980 },
			{ keyword: '나이트메어', count: 850 },
			{ keyword: '가챠 일정', count: 720 },
			{ keyword: '티어표', count: 650 }
		];
	}
}

export const adminStatsService = new AdminStatsService();
