import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { toastStore } from '../../../app/service/ToastService';
import { ItemListService, itemList } from '../../../app/service/item/ItemListService';
import { getItemTabs } from '../../../app/model/game/itemTabs';
import { loadGameContext } from '../../../app/service/game/loadGameContext';

export const load: PageLoad = async ({ params }) => {
	const { isMobile, gameInfo, url } = await loadGameContext(params.slug);

	// 큐레이션 맵에 없는 게임은 standalone 아이템 화면이 없다(장비 아이템이 없는 게임 등).
	const tabs = getItemTabs(params.slug);
	if (!tabs || tabs.length === 0) {
		throw error(404, '이 게임은 아이템 정보를 제공하지 않습니다.');
	}

	ItemListService.clear();
	const status = await ItemListService.getItemList(
		gameInfo.id,
		tabs.map((t) => t.type)
	);
	// 기본 타입은 큐레이션 첫 번째 탭.
	ItemListService.setType(tabs[0].type);
	const items = get(itemList);

	if (browser && status === 'error') {
		toastStore.error('아이템 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
	}

	return {
		params: params.slug,
		url,
		isMobile: !!isMobile,
		info: gameInfo,
		tabs,
		activeType: tabs[0].type,
		list: items,
		listError: status === 'error',
		title: `${gameInfo.name} - 아이템`,
		meta: {
			description: `${gameInfo.name}의 무기/장비 등 아이템 정보를 제공합니다.`,
			keywords: `${gameInfo.name}, 아이템, 무기, 장비, 정보, 가이드`
		}
	};
};
