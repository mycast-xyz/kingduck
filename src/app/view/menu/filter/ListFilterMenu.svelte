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
		RarityOption.set(value.rarity);
		TypeOption.set(value.type);
		selectedTypeOption.set(Object.fromEntries(Object.keys(value.type).map((key) => [key, ''])));
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

		// 기존 타입 필터 처리
		if (currentTypeText) {
			const types = currentTypeText.split('*');
			const uniqueTypes = new Map();

			// 중복 타입 제거 및 현재 키와 다른 타입만 유지
			types.forEach((t) => {
				if (t.includes('+')) {
					const [typeKey, typeValue] = t.split('+');
					if (typeKey !== key) {
						uniqueTypes.set(typeKey, typeValue);
					}
				}
			});

			currentTypeText = Array.from(uniqueTypes.entries())
				.map(([k, v]) => `${k}+${v}`)
				.join('*');
		}

		// 새로운 타입 값 추가
		if (value) {
			currentTypeText =
				currentTypeText === ''
					? `${key}+${value}`
					: !currentTypeText.includes(key)
						? `${currentTypeText}*${key}+${value}`
						: currentTypeText;
		}

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
		await CharacterListService.getCharacterList(currentUrl, data.params);
	};
</script>

{#each Object.entries(data.type) as [key, typeList]}
	<div class="flex w-full flex-col items-center border-t border-gray-300">
		<div class="w-full">
			<button
				onclick={() => toggleMenuType(key)}
				class="flex w-full items-center justify-between rounded-lg p-4 py-3 text-lg font-bold text-gray-700 hover:bg-gray-100"
			>
				<span class="">{$TypeOption[key].name} 필터</span>
				<i class="ri-arrow-down-s-line pr-2"></i>
			</button>
		</div>
		{#if $TypeOption[key]?.isMenuOpen}
			<div
				style={gameInit?.type[key].isTwoRow
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
							style={gameInit?.type[key].isWhite ? 'filter: brightness(0) invert(0.75);' : ''}
							src="{currentUrl}/{item.image.url}.webp"
							alt="번개"
						/>
						<span class="text-sm font-medium">{item.name.ko}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
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
