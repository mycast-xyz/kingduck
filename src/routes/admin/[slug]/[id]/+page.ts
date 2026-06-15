import { browser } from '$app/environment';
import client, { getApiBaseUrl } from '../../../../app/service/api/client';
import { authTokenService } from '../../../../app/service/auth/AuthTokenService';
import type { PageLoad } from './$types';
import type { CharacterType, ResultCodeType } from '../../../../app/model/api/api';

export const load: PageLoad = async ({ params, url }) => {
	// 토큰이 있으면 메인 페이지로 리다이렉트
	if (browser) {
	}

	let infoData: CharacterType | object = {};

	switch (params.slug) {
		case 'character':
			try {
				const response = await client.get<CharacterType>('/api/v0/character/admin/' + params.id);
				if (response.data) {
					infoData = response.data;
				} else {
					console.error('서버 응답 에러');
				}
			} catch (e) {
				console.error('캐릭터 데이터 조회 중 오류:', e);
			}
			break;
	}

	return {
		url: getApiBaseUrl(),
		slug: params.slug,
		id: params.id,
		info: infoData
	};
};
