<script lang="ts">
	// Svelte 및 외부 라이브러리 임포트
	import { register } from 'swiper/element/bundle';

	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../service/game/GameSettingService';
	import { CharacterRarityService } from '../../service/character/CharacterRarityService';

	// 컴포넌트 임포트
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { listData, currentUrl, isMobile, initData } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
	}>();

	let gameInit: any;
	let rarityService: CharacterRarityService;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});

	$inspect(initData.level);

	// 스킬 관련 상태 관리
	let selectedList = $state(null);
	let selectedLevel = $state(1);

	// Swiper 설정
	register();
	let activeTab = 0;
	let swiperInstance: any;

	// Swiper 슬라이드 변경 이벤트 핸들러
	function handleSlideChange(e: any) {
		if (swiperInstance?.swiper) {
			activeTab = swiperInstance.swiper.activeIndex;
		}
	}

	// 이미지 변수 처리를 위한 구문
	const getFormattedImage = (item: any) => {
		return item.image.url ? item.image.url : item.image;
	};

	// 이름 변수 처리를 위한 구문
	const getFormattedName = (item: any) => {
		// 한국어 이름이 있는 경우
		if (item.name?.kr) {
			return item.name.kr.replace(/<[^>]*>/g, '');
		}

		// Name 속성이 있는 경우
		if (item.name?.Name) {
			return item.name.Name;
		}

		// title 속성이 있는 경우
		if (item.title) {
			return item.title;
		}

		// name이 문자열인 경우
		if (typeof item.name === 'string') {
			return item.name;
		}

		// 기본값
		return '';
	};
	const getFormattedDescription = (item: any, selectedLevel: number) => {
		if (item?.info) {
			let description = item.info;
			if (item.levelData && item.levelData[selectedLevel - 1]?.params) {
				const params = item.levelData[selectedLevel - 1].params;
				description = description
					.replace(/#(\d+)\[(i|f\d)]/g, (match: string) => {
						const num = match.match(/\d+/)?.[0];
						if (!num) return match;
						const index = parseInt(num) - 1;
						let value = params[index] ?? 0;
						if (params[index] < 10) {
							value = params[index] * 100 ?? 0;
						}
						return value.toFixed(1);
					})
					.replace(/color:#FFFFFF/g, '');
			}
			if (description.includes('&2&')) {
				description = description.replace(/&2&/g, '<br/>');
				if (description.includes('&10&')) {
					description = description.replace(/&10&/g, '<hr style="margin: 10px 0" />');
				}
			}
			return description || '설명이 없습니다.';
		} else if (item?.Desc) {
			let description = item.Desc;
			if (item.ParamList) {
				description = description.replace(/#(\d)\[(i|f\d)]/g, (match: string) => {
					const num = match.match(/\d/)?.[0];
					if (!num) return match;
					const index = parseInt(num) - 1;
					const value = item.ParamList[index] ?? 0;
					return (value * 100).toFixed(1);
				});
			}
			return description || '설명이 없습니다.';
		} else if (item.params) {
			let description = item.description;
			if (item.params) {
				description = description.replace(/#(\d)\[(i|f\d)]/g, (match: string) => {
					const num = match.match(/\d/)?.[0];
					if (!num) return match;
					const index = parseInt(num) - 1;
					const value = item.params[index] ?? 0;
					return (value * 100).toFixed(1);
				});
			}
			return description || '설명이 없습니다.';
		} else if (item?.description) {
			return item?.description?.replace(/#(\d)\[(i|f\d)]/g) || '설명이 없습니다.';
		} else {
			return '설명이 없습니다.';
		}
	};
</script>

<Layer title={initData?.name || '스킬'}>
	{#if !isMobile}
		<!-- 기본 형태 | 강조 박스형 -->

		<swiper-container
			bind:this={swiperInstance}
			slides-per-view="auto"
			onslidechange={handleSlideChange}
			class="flex w-full items-stretch p-3"
		>
			{#each listData as item}
				<swiper-slide
					style="height: unset;"
					style:background-color={initData?.color}
					class="mx-4 max-w-36 cursor-pointer rounded-lg border border-gray-200 bg-gray-500 shadow transition-colors hover:bg-gray-600 dark:border-gray-700"
				>
					<button
						type="button"
						class="w-full"
						onclick={() => (selectedList = item)}
						onkeydown={(e) => e.key === 'Enter' && (selectedList = item)}
					>
						<div class="relative h-auto w-full object-scale-down">
							{#if item?.image?.url}
								<img
									class="m-auto max-w-36 items-center p-4"
									src="{currentUrl}/{getFormattedImage(item).replace(/\.webp$/, '')}.webp"
									alt={getFormattedName(item)}
								/>
							{/if}
						</div>
						<div class="w-full p-2">
							<h5
								class="mb-2 w-full break-all text-center text-lg font-bold tracking-tight text-white"
							>
								{getFormattedName(item)}
							</h5>
						</div>
					</button>
				</swiper-slide>
			{/each}
		</swiper-container>
		<!-- 스킬 상세 정보 -->
		{#if selectedList}
			<div class="w-full border-t border-gray-200 p-3">
				<div class="block flex rounded-lg p-3 px-4">
					<div
						style:background-color={initData?.color}
						class="image-box mr-3 h-16 w-16 flex-none overflow-auto rounded-full bg-gray-400 p-2 dark:bg-gray-800"
					>
						{#if selectedList?.image?.url}
							<img
								class="h-full w-full"
								src="{currentUrl}/{getFormattedImage(selectedList).replace(/\.webp$/, '')}.webp"
								alt={getFormattedName(selectedList)}
							/>
						{/if}
					</div>
					<div class="flex-1 pt-2">
						<div class="flex items-center justify-between">
							<h5 class="text-xl font-semibold">
								{getFormattedName(selectedList)}
								{#if selectedList.type}
									<small>[{selectedList.type}]</small>
								{/if}
							</h5>
							{#if selectedList?.levelData}
								<div class="flex items-center">
									<span class="mr-2 text-lg">LEVEL</span>
									<span class="mr-4 text-xl">{selectedLevel}</span>
									<input
										class="w-48 accent-indigo-600"
										type="range"
										name="skillRange"
										bind:value={selectedLevel}
										min="1"
										max={selectedList.levelData.length}
									/>
								</div>
							{/if}
						</div>
						<span class=" text-lg font-normal text-gray-500 dark:text-gray-400">
							{@html getFormattedDescription(selectedList, selectedLevel)}
						</span>
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<!-- 기본 형태 | 강조 박스형 -->
		<div
			class="flex w-full items-stretch justify-start overflow-x-auto py-3 pb-0"
			ontouchstart={(e) => e.stopPropagation()}
			ontouchmove={(e) => e.stopPropagation()}
			ontouchend={(e) => e.stopPropagation()}
		>
			{#each listData as item}
				<button
					type="button"
					style:background-color={initData?.color}
					class="mx-2 min-w-24 max-w-24 cursor-pointer rounded-lg border border-gray-200 bg-gray-500 shadow transition-colors hover:bg-gray-600 dark:border-gray-700"
					onclick={() => (selectedList = item)}
					onkeydown={(e) => e.key === 'Enter' && (selectedList = item)}
				>
					<div class="relative h-auto w-full object-scale-down">
						{#if item?.image?.url}
							<img
								class="m-auto min-w-24 max-w-24 items-center p-4"
								src="{currentUrl}/{getFormattedImage(item).replace(/\.webp$/, '')}.webp"
								alt=""
							/>
						{/if}
					</div>
					<div class="w-full p-1">
						<h5
							class="mb-2 w-full break-words text-center text-sm font-bold tracking-tight text-white"
						>
							{getFormattedName(item)}
						</h5>
					</div>
				</button>
			{/each}
		</div>

		<!-- 스킬 상세 정보 -->
		{#if selectedList}
			<div class="w-full border-t border-gray-200 p-3">
				<div class="block rounded-lg pb-4">
					<div
						class="title"
						ontouchstart={(e) => e.stopPropagation()}
						ontouchmove={(e) => e.stopPropagation()}
						ontouchend={(e) => e.stopPropagation()}
					>
						<div class="flex items-center pb-2">
							<div
								style:background-color={initData?.color}
								class="image-box mr-3 h-10 w-10 flex-none rounded-full bg-gray-400 p-2 dark:bg-gray-800"
							>
								{#if selectedList?.image?.url}
									<img
										class="h-full w-full"
										src="{currentUrl}/{getFormattedImage(selectedList).replace(/\.webp$/, '')}.webp"
										alt={getFormattedName(selectedList)}
									/>
								{/if}
							</div>
							<div class="flex-1">
								<h5 class="text-lg font-semibold">
									{getFormattedName(selectedList)}
								</h5>
							</div>
						</div>
						{#if selectedList?.levelData}
							<div class="flex items-center">
								<span class="mr-2 text-sm">LEVEL</span>
								<span class="mr-4 text-sm">{selectedLevel}</span>
								<input
									class="w-48 accent-indigo-600"
									type="range"
									name="skillRange"
									bind:value={selectedLevel}
									min="1"
									max={selectedList.levelData.length}
								/>
							</div>
						{/if}
					</div>
					<div class="pt-2">
						<span class=" text-xs font-normal text-gray-500 dark:text-gray-400">
							{@html getFormattedDescription(selectedList, selectedLevel)}
						</span>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</Layer>
