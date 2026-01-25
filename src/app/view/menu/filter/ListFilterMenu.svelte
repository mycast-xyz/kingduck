<script lang="ts">
	import { writable } from 'svelte/store';
	import { CharacterListService } from '../../../service/character/CharacterListService';
	import { GameSettingInitService } from '../../../service/game/GameSettingService';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	const currentUrl = data.url;

	const RarityOption = writable({ isMenuOpen: false });
	const TypeOption: any = writable({});
	const selectedTypeOption: any = writable({});
	const typeText = writable('');
	let gameInit: any;

	// 게임 설정 초기화 및 구독
	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		RarityOption.set(value?.rarity || {});
		TypeOption.set(value?.type || {});
		if (value?.type && typeof value.type === 'object') {
			selectedTypeOption.set(Object.fromEntries(Object.keys(value.type).map((key) => [key, ''])));
		} else {
			selectedTypeOption.set({});
		}
	});

	// 타입 메뉴 토글 함수
	const toggleMenuType = (type: string) => {
		TypeOption.update((curr: any) => {
			const updatedTypes = { ...curr };
			if (type in updatedTypes) {
				updatedTypes[type] = {
					...updatedTypes[type],
					isMenuOpen: !updatedTypes[type].isMenuOpen
				};
			}
			return updatedTypes;
		});
	};

	// 타입 버튼 토글 및 필터링 함수
	const toggleMenuTypeButton = async (key: string, value: string) => {
		let currentTypeText = '';
		typeText.subscribe((value) => {
			currentTypeText = value;
		});

		const filterKey = gameInit?.type?.[key]?.apiPoint || key;
		const typesMap = new Map();

		if (currentTypeText) {
			currentTypeText.split('*').forEach((t) => {
				const [k, v] = t.split('+');
				if (k && v) typesMap.set(k, v);
			});
		}

		if (value) {
			typesMap.set(filterKey, value);
		} else {
			typesMap.delete(filterKey);
		}

		currentTypeText = Array.from(typesMap.entries())
			.map(([k, v]) => `${k}+${v}`)
			.join('*');

		// 상태 업데이트
		typeText.set(currentTypeText);
		selectedTypeOption.update((val: any) => ({
			...val,
			[key]: value
		}));

		await dataUpdate();
	};

	// 데이터 업데이트 함수
	const dataUpdate = async () => {
		// 캐릭터 리스트 설정 및 데이터 가져오기
		CharacterListService.getCharacterListConfig(data.info.id, $typeText, null);
		await CharacterListService.getCharacterList(data.params);
	};

	// Helper to get element list for a specific filter key
	const getTypeList = (key: string) => {
		if (data?.info?.elements && Array.isArray(data.info.elements)) {
			return data.info.elements.filter((e: any) => {
				const eType = e.type || '';
				// Map gameInit keys to API Element types
				if (key === 'DamageType' || key === 'damageType') {
					return eType === 'DamageType' || eType === 'Element';
				}
				if (key === 'baseTypeChar') {
					return eType === 'BaseType' || eType === 'Path';
				}
				if (key === 'elementType') return eType === 'Code'; // Nikke
				if (key === 'weaponType') return eType === 'Weapon'; // Nikke

				// Default loose match
				return eType.toLowerCase() === key.toLowerCase();
			});
		}
		// Fallback to data.type if it exists (for backward compatibility or if organized there)
		if (data?.type && Array.isArray(data.type[key])) return data.type[key];

		return [];
	};

	// TypeOption이 객체인지 확인하고 키 배열 반환
	const typeKeys = $derived(
		$TypeOption && typeof $TypeOption === 'object' && !Array.isArray($TypeOption)
			? Object.keys($TypeOption)
			: []
	);
</script>

{#each typeKeys as key}
	{@const typeList = getTypeList(key)}
	{#if typeList.length > 0}
		<div class="flex w-full flex-col items-center border-t border-gray-300">
			<div class="w-full">
				<button
					onclick={() => toggleMenuType(key)}
					class="flex w-full items-center justify-between rounded-lg p-4 py-3 text-lg font-bold text-gray-700 hover:bg-gray-100"
				>
					<span class="">{$TypeOption[key]?.name || key} 필터</span>
					<i class="ri-arrow-down-s-line pr-2"></i>
				</button>
			</div>
			{#if $TypeOption[key]?.isMenuOpen}
				<div
					style={gameInit?.type[key]?.isTwoRow
						? 'grid-template-columns: repeat(2, minmax(0, 1fr));'
						: 'grid-template-columns: repeat(3, minmax(0, 1fr));'}
					class="grid w-full grid-cols-3 gap-2 p-4 pt-2"
				>
					<button
						onclick={() => toggleMenuTypeButton(key, '')}
						class:active={$selectedTypeOption[key] === ''}
						class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
					>
						<i class="ri-color-filter-fill mr-1 text-xl text-[#f9822c]"></i>
						<span class="text-sm font-medium">전체</span>
					</button>
					{#each typeList as item}
						<button
							onclick={() => toggleMenuTypeButton(key, item.id)}
							class:active={$selectedTypeOption[key] === item.id}
							class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
						>
							<img
								class="mr-1 h-6 w-6 object-contain"
								style={gameInit?.type[key]?.isWhite ? 'filter: brightness(0) invert(0.75);' : ''}
								src="{currentUrl}/{item.iconUrl}"
								alt={typeof item.name === 'string' ? item.name : item.name.ko}
							/>
							<span class="text-sm font-medium"
								>{typeof item.name === 'object' ? item.name.ko : item.name}</span
							>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/each}

<style lang="scss">
	button {
		&.active {
			background: #f9822c;
			color: #ffffff !important;
			border-color: #f9822c;
			i {
				color: #ffffff !important;
			}
			img {
				filter: brightness(0) invert(1) !important;
			}
		}
		.text-Rating-5 {
			color: #fcba49;
		}
		.text-Rating-4 {
			color: #9f66c8;
		}
		.text-Rating-3 {
			color: #4175bb;
		}
	}
</style>
