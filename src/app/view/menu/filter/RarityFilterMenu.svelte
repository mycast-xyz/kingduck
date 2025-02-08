<script lang="ts">
	import { writable } from 'svelte/store';
	import { CharacterListService } from '../../../service/character/CharacterListService';
	import { GameSettingInitService } from '../../../service/game/GameSettingService';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	const RarityOption = writable({ isMenuOpen: false });
	const selectedRarity: any = writable('');
	const rarityText = writable('');
	let gameInit;

	// 게임 설정 초기화 및 구독
	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		RarityOption.set(value.rarity);
	});

	// 레어리티 메뉴 토글 함수
	const toggleMenuRarity = () => {
		RarityOption.update((curr) => ({
			...curr,
			isMenuOpen: !curr.isMenuOpen
		}));
	};

	// 레어리티 버튼 토글 함수
	const toggleMenuRarityButton = async (key: string) => {
		rarityText.set(key);
		selectedRarity.set(key);

		await dataUpdate();
	};

	// 데이터 업데이트 함수
	const dataUpdate = async () => {
		console.log($rarityText);

		// 캐릭터 리스트 설정 및 데이터 가져오기
		CharacterListService.getCharacterListConfig(data.info.id, null, $rarityText);
		await CharacterListService.getCharacterList(data.url, data.params);
	};
</script>

<div class="flex w-full flex-col items-center border-t border-gray-300">
	<div class="w-full">
		<button
			onclick={toggleMenuRarity}
			class="flex w-full items-center justify-between rounded-lg p-4 py-3 text-lg font-bold text-gray-700 hover:bg-gray-100"
		>
			<span class="">등급 필터</span>
			<i class="ri-arrow-down-s-line pr-2"></i>
		</button>
	</div>
	{#if $RarityOption?.isMenuOpen}
		<div class="grid w-full grid-cols-3 gap-2 p-4 pt-2" id="rarity-filter">
			<button
				onclick={() => toggleMenuRarityButton('')}
				class:active={$selectedRarity === ''}
				class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
			>
				<i class="ri-star-fill mr-1 text-[#f9822c]"></i>
				<span class="text-sm font-medium">전체</span>
			</button>
			{#each [...Object.entries($RarityOption?.list)].sort((a, b) => Number(b[0]) - Number(a[0])) as [key, name]}
				<button
					onclick={() => toggleMenuRarityButton(name)}
					class:active={$selectedRarity === name}
					class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
				>
					<i class="ri-star-fill mr-1 text-Rating-{key}"></i>
					<span class="text-sm font-medium">{name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

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
