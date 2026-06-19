/**
 * 게임별 standalone 아이템 화면(`/item/[slug]`)에 노출할 아이템 타입 큐레이션 맵.
 *
 * 아이템 `type` 값이 게임마다 제각각이고(원신 `weapon`, 스타레일 `LightCone`/`RelicSet` …),
 * 일부 게임은 재료(material)가 수백 종이라 전부 노출하면 화면이 덤프가 된다.
 * → 의미 있는 장비/무기류만 탭으로 노출한다. 키는 백엔드 item.type 원본 값과 정확히 일치해야 한다.
 *
 * 게임 분기 하드코딩을 피하기 위해 라우트/메뉴는 이 맵만 참조한다.
 * 맵에 없는 게임(nikke·reverse1999 등 장비 아이템이 없는 게임)은 아이템 탭/라우트 자체가 숨겨진다.
 */
export interface ItemTab {
	/** 백엔드 item.type 원본 값 */
	type: string;
	/** 탭에 표시할 한글 라벨 */
	label: string;
}

const ITEM_TABS: Record<string, ItemTab[]> = {
	genshin: [{ type: 'weapon', label: '무기' }],
	starrail: [
		{ type: 'LightCone', label: '광추' },
		{ type: 'RelicSet', label: '유물' }
	],
	zzz: [
		{ type: 'W-Engine', label: '음향 엔진' },
		{ type: 'DriveDisc', label: '드라이브 디스크' }
	],
	nte: [
		{ type: 'Arc', label: '아크' },
		{ type: 'Module', label: '모듈' }
	],
	wutheringwaves: [
		{ type: 'Weapon', label: '무기' },
		{ type: 'Echo', label: '에코' }
	],
	endfield: [
		{ type: 'Weapon', label: '무기' },
		{ type: 'Equipment', label: '장비' }
	]
};

/** slug(또는 레거시 별칭)에 큐레이션된 아이템 탭 목록을 반환한다. 없으면 `undefined`. */
export function getItemTabs(slug: string): ItemTab[] | undefined {
	return ITEM_TABS[slug];
}

/** 해당 게임에 노출할 아이템 탭이 있는지 여부(메뉴 노출 가드용). */
export function hasItemTabs(slug: string): boolean {
	return !!ITEM_TABS[slug]?.length;
}
