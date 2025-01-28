<script lang="ts">
	import { mainMenuActive } from '$lib/stores/mainMenuStore.js';
	import { GameSettingInitService } from '../../../service/GameSettingService';
	import ListCardView from '../../list/ListCardView.svelte';

	const { data } = $props<{}>();

	// 게임 정보 처리
	let gameInit: any;
	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
	});

	// 페이지 기본 정보
	const currentUrl = data.url;

	const mainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<article
		id="list-componet"
		class="{mainViewActive[$mainMenuActive]} my-0 mr-0 flex h-full overflow-hidden"
	>
		<div class="list-menu flex h-full p-4">
			<div
				class="mt-12 w-80 flex-col items-center rounded border border-gray-100 bg-white p-4 text-gray-700 shadow-md"
			>
				<div class="gmae-title my-2 h-auto w-full">
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
						class="-mx-4 flex w-[calc(100%+2rem)] items-center justify-between border-b border-t border-gray-200 border-gray-200 bg-gray-100 px-0 placeholder-gray-400 focus:outline-none"
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
				<!-- 페이지 기능 -->
				<div class="my-4 mt-1 flex w-full flex-col items-center pb-2">
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
				<div class="my-4 mt-3 flex w-full flex-col items-center border-t border-gray-300 pb-2">
					<div class="w-full">
						<button
							class="mb-2 flex w-full items-center justify-between rounded-lg py-3 pl-1 text-lg font-bold text-gray-700 hover:bg-gray-100"
						>
							<span class="">등급 필터</span>
							<i class="ri-arrow-down-s-line pr-2"></i>
						</button>
					</div>
					<div class="grid w-full grid-cols-3 gap-2 pt-1">
						<button
							class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
						>
							<i class="ri-star-fill mr-1 text-amber-400"></i>
							<span class="text-sm font-medium">5성</span>
						</button>
						<button
							class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
						>
							<i class="ri-star-fill mr-1 text-purple-400"></i>
							<span class="text-sm font-medium">4성</span>
						</button>
						<button
							class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
						>
							<i class="ri-star-fill mr-1 text-blue-400"></i>
							<span class="text-sm font-medium">3성</span>
						</button>
					</div>
				</div>
				<!-- 필터 기능 -->
				{#if data?.type && Object.keys(data.type).length > 0}
					{#each Object.entries(data.type) as [key, typeList]}
						<div class="my-4 mt-3 flex w-full flex-col items-center border-t border-gray-300 pb-2">
							<div class="w-full">
								<button
									class="mb-2 flex w-full items-center justify-between rounded-lg py-3 pl-1 text-lg font-bold text-gray-700 hover:bg-gray-100"
								>
									<span class="">{gameInit?.type[key].name} 필터</span>
									<i class="ri-arrow-down-s-line pr-2"></i>
								</button>
							</div>
							<div
								style={gameInit?.type[key].isTwoRow
									? 'grid-template-columns: repeat(2, minmax(0, 1fr));'
									: 'grid-template-columns: repeat(3, minmax(0, 1fr));'}
								class="grid w-full grid-cols-3 gap-2 pt-1"
							>
								{#each typeList as item}
									<button
										class="flex items-center rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
									>
										<img
											class="mr-2 h-6 w-6"
											style={gameInit?.type[key].isWhite
												? 'filter: invert(23%) sepia(42%) saturate(316%) hue-rotate(178deg) brightness(90%) contrast(90%);'
												: ''}
											src="{currentUrl}/{item.image.url}.webp"
											alt="번개"
										/>
										<span class="text-sm font-medium">{item.name.ko}</span>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<div class="list h-auto w-[calc(100%-320px)] w-[inherit] overflow-y-auto px-2 pt-16">
			<ListCardView {data} />
		</div>
	</article>
</div>
