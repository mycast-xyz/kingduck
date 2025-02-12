import { browser } from '$app/environment';
import axios from 'axios';
import { authTokenService } from '../../../../app/service/auth/AuthTokenService';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	const currentUrl = 'http://' + url.hostname + ':3000';

	// 토큰이 있으면 메인 페이지로 리다이렉트
	if (browser) {
	}

	let infoData = {};

	switch (params.slug) {
		case 'character':
			const response = await axios.get(currentUrl + '/api/v0/character/admin/' + params.id);
			if (response.data.resultCode === 200) {
				infoData = response.data.items;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
			break;
	}

	console.log(infoData);

	return {
		url: currentUrl,
		slug: params.slug,
		id: params.id,
		info: infoData
	};
};
