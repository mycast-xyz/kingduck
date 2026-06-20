import client, { getApiBaseUrl } from '../../../../app/service/api/client';
import type { PageLoad } from './$types';
import type { CharacterType } from '../../../../app/model/api/api';

export const load: PageLoad = async ({ params }) => {
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
