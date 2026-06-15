import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { authTokenService } from '../../../app/service/auth/AuthTokenService';
import type { PageLoad } from './$types';
import { getApiBaseUrl } from '../../../app/service/api/client';

export const load: PageLoad = async ({ params }) => {
	const currentUrl = getApiBaseUrl();

	// 토큰이 있으면 메인 페이지로 리다이렉트
	if (browser) {
		const token = authTokenService.getToken();
		if (token) {
			throw redirect(302, '/');
		}
	}

	return {
		url: currentUrl
	};
};
