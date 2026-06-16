import client from './api/client';
import { writable } from 'svelte/store';

export interface GameCompleteness {
	gameId: string;
	gameName: string;
	totalCharacters: number;
	completedCharacters: number;
	completeness: number;
}

export interface SystemSummary {
	os: {
		platform: string;
		distro: string;
		release: string;
		hostname: string;
		arch: string;
	};
	cpu: {
		manufacturer: string;
		brand: string;
		cores: number;
		speed: number;
	};
	memory: {
		total: number;
		swaptotal: number;
	};
	time: {
		current: number;
		uptime: number;
		timezone: string;
	};
}

export interface SystemStats {
	timestamp: number;
	cpuLoad: {
		currentLoad: number;
		currentLoadUser: number;
		currentLoadSystem: number;
	};
	memory: {
		active: number;
		total: number;
		free: number;
		usePercentage: number;
	};
	network: {
		iface: string;
		rx_sec: number;
		tx_sec: number;
	};
	process: {
		memory: {
			rss: number;
			heapTotal: number;
			heapUsed: number;
			external: number;
			arrayBuffers: number;
		};
		uptime: number;
	};
}

export class AdminStatsService {
	private _completeness = writable<GameCompleteness[]>([]);
	private _systemSummary = writable<SystemSummary | null>(null);
	private _systemStats = writable<SystemStats | null>(null);

	get completeness() {
		return this._completeness;
	}

	get systemSummary() {
		return this._systemSummary;
	}

	get systemStats() {
		return this._systemStats;
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

	// 실패를 가짜 데이터로 위장하지 않는다 (F-T1). 성공 여부를 반환해 UI가 에러 상태를 표시한다.
	async fetchSystemSummary(): Promise<boolean> {
		try {
			const response = await client.get('/api/v0/admin/system/summary');
			if (response.status === 200 && response.data) {
				this._systemSummary.set(response.data);
				return true;
			}
			this._systemSummary.set(null);
			return false;
		} catch (error) {
			console.error('Failed to fetch system summary:', error);
			this._systemSummary.set(null);
			return false;
		}
	}

	async fetchSystemStats(): Promise<boolean> {
		try {
			const response = await client.get('/api/v0/admin/system/stats');
			if (response.status === 200 && response.data) {
				this._systemStats.set(response.data);
				return true;
			}
			this._systemStats.set(null);
			return false;
		} catch (error) {
			console.error('Failed to fetch system stats:', error);
			this._systemStats.set(null);
			return false;
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
