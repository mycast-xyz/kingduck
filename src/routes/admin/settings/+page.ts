import type { PageLoad } from './$types';
import { getApiBaseUrl } from '../../../app/service/api/client';

export const load: PageLoad = async () => {
	return {
		url: getApiBaseUrl()
	};
};
