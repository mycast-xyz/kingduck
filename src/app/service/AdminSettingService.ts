import client from './api/client';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { toastStore } from './ToastService';

export interface SiteSetting {
	homeHeroBackground: string;
	homeRecentGamesLimit: number;
}

const DEFAULT_SETTING: SiteSetting = {
	homeHeroBackground: 'random',
	homeRecentGamesLimit: 6
};

class AdminSettingServiceInit {
	private _setting = writable<SiteSetting>({ ...DEFAULT_SETTING });
	private _loading = writable<boolean>(false);

	get setting() {
		return this._setting;
	}

	get loading() {
		return this._loading;
	}

	async fetchSetting(): Promise<SiteSetting | null> {
		try {
			this._loading.set(true);
			// 어드민 봉투: res.data.resultCode / res.data.data
			const res = await client.get('/api/v0/admin/setting');
			if (res.data.resultCode === 200 && res.data.data) {
				this._setting.set(res.data.data);
				return res.data.data;
			}
			return null;
		} catch (err) {
			console.error('사이트 설정 조회 실패:', err);
			if (browser) toastStore.error('설정을 불러오지 못했습니다.');
			return null;
		} finally {
			this._loading.set(false);
		}
	}

	async updateSetting(patch: Partial<SiteSetting>): Promise<SiteSetting | null> {
		try {
			// 어드민 봉투: res.data.resultCode / res.data.data
			const res = await client.put('/api/v0/admin/setting', patch);
			if (res.data.resultCode === 200 && res.data.data) {
				this._setting.set(res.data.data);
				return res.data.data;
			}
			toastStore.error('설정 저장에 실패했습니다.');
			return null;
		} catch (err) {
			console.error('사이트 설정 저장 실패:', err);
			if (browser) toastStore.error('설정 저장 중 오류가 발생했습니다.');
			return null;
		}
	}

	// hero-image 업로드: multipart/form-data, field name 'file'
	// Authorization Bearer 헤더는 client 인터셉터가 자동 첨부.
	async uploadHeroImage(file: File): Promise<string | null> {
		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await client.post('/api/v0/admin/setting/hero-image', formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			// 봉투: res.data.resultCode / res.data.data.imageUrl
			if (res.data.resultCode === 200 && res.data.data?.imageUrl) {
				return res.data.data.imageUrl as string;
			}
			toastStore.error('이미지 업로드에 실패했습니다.');
			return null;
		} catch (err) {
			console.error('hero-image 업로드 실패:', err);
			if (browser) toastStore.error('이미지 업로드 중 오류가 발생했습니다.');
			return null;
		}
	}
}

export const adminSettingService = new AdminSettingServiceInit();
