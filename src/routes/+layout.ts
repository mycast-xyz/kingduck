import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import axios from 'axios';
import { MobileUtils } from '../utils/mobile/MobileUtils';

export const load: LayoutLoad = async ({ url }) => {
	let isMobile = false;

	if (browser) {
		isMobile = MobileUtils.isMobile();
	}

	const currentUrl = 'http://' + url.hostname + ':3000';

	return {
		url: currentUrl,
		isMobile: isMobile
	};
};
