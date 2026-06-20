import type { PageLoad } from './$types';
import { getApiBaseUrl } from '../../app/service/api/client';

export const load: PageLoad = async () => {
	const currentUrl = getApiBaseUrl();

	return {
		url: currentUrl
	};
};
