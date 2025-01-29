<script lang="ts">
	import { writable } from 'svelte/store';
	import { mainMenuActive } from '$lib/stores/mainMenuStore.js';
	import { GameSettingInitService } from '../../../service/GameSettingService';

	// 페이지 컴포넌트
	import FooterView from '../../footer/FooterView.svelte';
	import ListCardView from '../../list/ListCardView.svelte';

	const { data } = $props<{}>();

	// 페이지 기본 정보
	const currentUrl = data.url;

	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};

	// 게임 정보 처리
	let gameInit: any;
	// RarityOption을 writable store로 생성
	const RarityOption = writable({
		isMenuOpen: false
	});
	const TypeOption: any = writable({});
	const selectedTypeOption: any = writable({});
	const selectedRarity: any = writable('');

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		// RarityOption store 업데이트
		RarityOption.set(value.rarity);
		TypeOption.set(value.type);
		selectedTypeOption.set(Object.fromEntries(Object.keys(value.type).map((key) => [key, ''])));
	});

	console.log($selectedTypeOption);

	// 메뉴 드롭다운 상태 관리
	// 메뉴 등급 토글 함수
	const toggleMenuRarity = () => {
		RarityOption.update((curr) => ({
			...curr,
			isMenuOpen: !curr.isMenuOpen
		}));
	};
	// 메뉴 타입 토글 함수
	const toggleMenuType = (type: string) => {
		TypeOption.update((curr: any) => {
			// 현재 상태를 복사
			const updatedTypes = { ...curr };

			// 해당 타입이 존재하는지 확인하고 isMenuOpen 상태를 토글
			if (type in updatedTypes) {
				updatedTypes[type] = {
					...updatedTypes[type],
					isMenuOpen: !updatedTypes[type].isMenuOpen
				};
			}

			return updatedTypes;
		});
	};
	// 메뉴 등급 버튼 토글 함수
	const toggleMenuRarityButton = (key: string) => {
		selectedRarity.set(key);
	};
	// 메뉴 타입 버튼 토글 함수
	const toggleMenuTypeButton = (key: string, value: string) => {
		let currentOptions: Record<string, string> = {};
		selectedTypeOption.update((val: any) => {
			currentOptions = val;
			return { ...val, [key]: value };
		});
	};
</script>

<div class="h-screen w-screen min-w-[1700px] overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="list-componet"
		class="{mainViewActive[$mainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	>
		<div class="list-menu flex h-full p-4">
			<div
				class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white text-gray-700 shadow-md"
			>
				<div class="gmae-title my-2 h-auto w-full p-4">
					<div class="gmae-logo-img">
						<img
							src={data.url + '/' + data.info.images[0].url}
							class="-mt-20 w-28 rounded-full border border-gray-100 shadow-md"
							alt={data.params}
						/>
					</div>
					<h3 class="pb-3 pt-2 text-2xl font-bold tracking-tight text-gray-700 dark:text-white">
						{data.info.title.kr}
					</h3>
				</div>
				<div class="flex w-full items-center">
					<div
						class="flex w-full items-center justify-between border-b border-t border-gray-200 border-gray-200 bg-gray-100 px-0 placeholder-gray-400 focus:outline-none"
					>
						<input
							type="text"
							class="py-3text-base mr-2 grow border-none bg-transparent px-5 font-normal text-gray-700 focus:outline-none dark:border-gray-700 dark:text-white"
							placeholder="검색어를 입력하세요"
						/>
						<button
							class="flex h-full items-center border-l bg-gray-300 p-3 px-4 text-gray-600 hover:bg-[#f9822c] hover:text-white"
						>
							<i class="ri-search-line text-xl"></i>
						</button>
					</div>
				</div>
				<div
					id="list-menu-content"
					class="flex h-[calc(100%-185px)] w-full flex-col items-center overflow-y-auto overflow-x-hidden"
				>
					<!-- 페이지 기능 -->
					<div class=" my-4 mt-1 flex w-full flex-col items-center p-4 pb-2">
						<h3 class="w-full py-3 pb-1 pl-1 text-lg font-bold text-gray-700">페이지 메뉴</h3>
						<a
							id="menu-item"
							class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
							href="#top"
						>
							<i class="ri-user-line h-8 w-8 text-2xl"></i>
							<span
								class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
								>캐릭터</span
							>
						</a>
						<a
							id="menu-item"
							class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
							href="#top"
						>
							<i class="ri-vip-crown-2-line h-8 w-8 text-2xl"></i>
							<span
								class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
								>티어 리스트</span
							>
						</a>
						<a
							id="menu-item"
							class=" mt-2 flex h-12 w-full items-center rounded px-3 hover:bg-gray-300"
							href="#top"
						>
							<i class="ri-box-3-line h-8 w-8 text-2xl"></i>
							<span
								class="ml-2 text-base font-medium transition-all delay-300 duration-200 ease-in-out"
								>아이템</span
							>
						</a>
					</div>

					<!-- 필터 기능 -->
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
										onclick={() => toggleMenuRarityButton(key)}
										class:active={$selectedRarity === key}
										class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
									>
										<i class="ri-star-fill mr-1 text-Rating-{key}"></i>
										<span class="text-sm font-medium">{name}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
					<!-- 필터 기능 -->
					{#if data?.type && Object.keys(data.type).length > 0}
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
													class="mr-1 h-6 w-6"
													style={gameInit?.type[key].isWhite
														? 'filter: brightness(0) invert(0.75);'
														: ''}
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
					{/if}
				</div>
			</div>
		</div>

		<div class="list h-auto w-[calc(100%-320px)] w-[inherit] overflow-y-auto px-2 pt-16">
			<ListCardView {data} />

			<FooterView />
		</div>
	</article>
</div>

<style lang="scss">
	#list-menu-content {
		-ms-overflow-style: none; /* for Internet Explorer, Edge */
		scrollbar-width: none; /* for Firefox */
		overflow-y: scroll;
	}

	#list-menu-content::-webkit-scrollbar {
		display: none; /* for Chrome, Safari, and Opera */
	}
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
