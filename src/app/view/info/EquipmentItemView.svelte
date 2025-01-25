<script lang="ts">
	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../service/GameSettingService';
	import { CharacterRarityService } from '../../service/CharacterRarityService';

	// 컴포넌트 임포트
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { itemData, currentUrl, isMobile, contentColor } = $props<{
		itemData: any;
		currentUrl: string;
		isMobile: boolean;
		contentColor: string;
	}>();

	let gameInit: any;
	let rarityService: CharacterRarityService;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});
</script>

<Layer title="추천 {gameInit?.content?.info?.item?.name || '아이템'}">
	<!-- 기본 형태 | 강조 박스형 -->
	<div class="flex w-full flex-col p-3 md:flex-row">
		{#if gameInit?.content?.info?.item?.list && itemData}
			{#each Object.entries(gameInit?.content?.info?.item?.list ?? {}) as [key, value]}
				{#if value?.view && itemData?.[key]}
					<div class="w-auto py-3 pt-0">
						<h5
							class="pb-0 pl-0 font-bold tracking-tight text-gray-700 dark:text-white md:pb-3 md:pl-3 md:text-lg"
						>
							{value.name}
						</h5>
						<div class="flex w-full justify-start overflow-x-auto py-3 pb-0">
							{#each itemData[key] as item}
								{#if !isMobile}
									<div
										style:background={contentColor}
										class="mx-4 max-w-sm basis-1/6 rounded-lg border border-gray-200 bg-gray-500 shadow dark:border-gray-700"
									>
										<div class="relative h-auto w-full object-scale-down">
											<img
												class="m-auto min-w-36 max-w-40 items-center p-4"
												src="{currentUrl}/assets/image/item/{item?.itemReferences?.image?.src ??
													''}.webp"
												alt={item?.name?.kr ?? ''}
											/>
										</div>
										<div class="p-2">
											<h5
												class="mb-2 break-keep text-center text-xl font-bold tracking-tight text-white"
											>
												{item?.name?.kr ?? ''}
											</h5>
										</div>
									</div>
								{:else}
									<div
										style:background={contentColor}
										class="mx-2 min-w-24 max-w-24 rounded-lg border border-gray-200 bg-gray-500 shadow first:ml-0 dark:border-gray-700"
									>
										<div class=" relative h-auto w-full object-scale-down">
											<img
												class="m-auto min-w-24 max-w-24 items-center p-4"
												src="{currentUrl}/assets/image/item/{item?.itemReferences?.image?.src ??
													''}.webp"
												alt={item?.name?.kr ?? ''}
											/>
										</div>
										<div class="-p-1">
											<h5
												class="mb-2 break-keep text-center text-xs font-bold tracking-tight text-white"
											>
												{item?.name?.kr ?? ''}
											</h5>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
	<!-- 기본 형태 | 이미지가 들어가는 경우 -->
	{#if gameInit?.content?.info?.item?.option.main && itemData.ItemOpt}
		<div class="w-full border-t border-gray-200 p-3">
			<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
				추천 메인 속성
			</h5>
			<ul class="flex">
				{#each itemData.ItemOpt as Optitem}
					<li class="block flex rounded-lg p-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700">
						<div class="image-box mr-3 h-16 w-16 rounded-full bg-gray-400 p-2 dark:bg-gray-800">
							<img
								class="h-full w-full"
								src="{currentUrl}/assets/test/content/{Optitem.iconPath}.webp"
							/>
						</div>
						<div class="pt-2">
							<h5 class="text-xl font-semibold">{Optitem.optName}</h5>
							<span class="font-base text-sm text-gray-500 dark:text-gray-400">{Optitem.name}</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<!-- 기본 형태 | 텍스트만 표기시 -->
	{#if gameInit?.content?.info?.item?.option.sub && itemData.ItemOpt}
		<div class="w-full border-t border-gray-200 p-3 pb-0">
			<h5 class="pb-3 pl-3 text-lg font-bold tracking-tight text-gray-700 dark:text-white">
				추천 보조 속성
			</h5>
			<div class="flex pb-3 pl-3">
				<h5 class="text-lg font-normal">치명타 확률, 치명타 피해, 공력력%</h5>
			</div>
		</div>
	{/if}
</Layer>
