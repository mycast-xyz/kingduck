import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const currentUrl = 'http://' + url.hostname + ':3000';

	return {
		url: currentUrl
	};
};
