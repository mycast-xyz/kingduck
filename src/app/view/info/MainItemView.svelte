<script lang="ts">
	// Svelte 및 외부 라이브러리 임포트
	import { register } from 'swiper/element/bundle';

	// 커스텀 서비스 임포트
	import { GameSettingInitService } from '../../service/GameSettingService';
	import { CharacterRarityService } from '../../service/CharacterRarityService';

	// 컴포넌트 임포트
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	const { itemData, currentUrl, isMobile } = $props<{
		itemData: any;
		currentUrl: string;
		isMobile: boolean;
	}>();

	let gameInit: any;
	let rarityService: CharacterRarityService;

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});

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
</script>

<Layer title="추천 {gameInit.content.info.mainItem.name}">
	{#if !isMobile}
		<swiper-container
			bind:this={swiperInstance}
			slides-per-view="auto"
			onslidechange={handleSlideChange}
			class="flex w-full justify-start overflow-x-auto p-3 pb-0"
		>
			<!-- 기본 틀 | pc 화면 -->
			{#each itemData as card}
				<swiper-slide class="card-info mx-6 w-min first:ml-0">
					<div
						class="rating-card border-Rating-{rarityService.rarityData(
							card.rarity
						)} items-center rounded-xl border-8"
					>
						<img
							class="h-auto min-w-36 max-w-52 rounded-xl"
							src="{currentUrl}/{card.itemReferences?.image?.art?.src?.replace(/\.webp$/, '')}.webp"
							alt=""
						/>
						<div class="rating-info flex w-auto justify-center p-2 pb-0">
							{#each { length: card.rarity } as i}
								<div class="icon h-6 w-6">
									<svg
										id="_레이어_1"
										data-name="레이어_1"
										xmlns="http://www.w3.org/2000/svg"
										version="1.1"
										viewBox="0 0 50 50"
									>
										<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
										<defs>
											<style>
												.st0 {
													fill: #fff;
												}
											</style>
										</defs>
										<path
											class="st0"
											d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
										/>
									</svg>
								</div>
							{/each}
						</div>
					</div>
					<p
						class="w-full break-keep px-4 pt-2 text-center text-lg font-bold text-gray-600 dark:text-gray-200"
					>
						{card.name?.kr}
					</p>
				</swiper-slide>
			{/each}
		</swiper-container>
	{:else}
		<div
			class="flex w-full justify-start overflow-x-auto p-3 pb-0"
			ontouchstart={(e) => e.stopPropagation()}
			ontouchmove={(e) => e.stopPropagation()}
			ontouchend={(e) => e.stopPropagation()}
		>
			<!-- 스타레일 / 원신 -->
			{#each itemData as card}
				<div class="card-info mx-3 w-28 min-w-28 max-w-28 first:ml-0">
					<div
						class="rating-card border-Rating-{rarityService.rarityData(
							card.rarity
						)} items-center rounded-xl border-4"
					>
						<img
							class="h-auto w-full rounded-xl"
							src="{currentUrl}/{card.itemReferences?.image?.art?.src?.replace(/\.webp$/, '')}.webp"
							alt=""
						/>
						<div class="rating-info flex w-auto justify-center p-2 pb-0">
							{#each { length: card.rarity } as i}
								<div class="icon h-3 w-3">
									<svg
										id="_레이어_1"
										data-name="레이어_1"
										xmlns="http://www.w3.org/2000/svg"
										version="1.1"
										viewBox="0 0 50 50"
									>
										<!-- Generator: Adobe Illustrator 29.2.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 108)  -->
										<defs>
											<style>
												.st0 {
													fill: #fff;
												}
											</style>
										</defs>
										<path
											class="st0"
											d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
										/>
									</svg>
								</div>
							{/each}
						</div>
					</div>
					<p
						class="w-full break-keep px-4 pt-2 text-center text-xs font-bold text-gray-600 dark:text-gray-200"
					>
						{card.name?.kr}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</Layer>

<style lang="scss">
	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.border-Rating-5 {
		border-color: #fcba49;
		background-color: #fcba49;
	}
	.border-Rating-4 {
		border-color: #9f66c8;
		background-color: #9f66c8;
	}
	.border-Rating-3 {
		border-color: #4175bb;
		background-color: #4175bb;
	}
	.card-Rating-5 {
		background: #c9a36a;
		background: linear-gradient(180deg, #885550, #c9a36a 53%);
		border-bottom-color: #c9a36a;
	}
	.card-Rating-5-bg {
		background: rgb(201, 163, 106);
		background: -moz-linear-gradient(0deg, rgba(201, 163, 106, 1) 50%, rgba(201, 163, 106, 0) 100%);
		background: -webkit-linear-gradient(
			0deg,
			rgba(201, 163, 106, 1) 50%,
			rgba(201, 163, 106, 0) 100%
		);
		background: linear-gradient(0deg, rgba(201, 163, 106, 1) 50%, rgba(201, 163, 106, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#c9a36a",endColorstr="#c9a36a",GradientType=1);
	}
	.card-Rating-4 {
		background: #8a5fcc;
		background: linear-gradient(180deg, #343659, #8a5fcc 53%);
		border-bottom-color: #8a5fcc;
	}
	.card-Rating-4-bg {
		background: rgb(138, 95, 204);
		background: -moz-linear-gradient(0deg, rgba(138, 95, 204, 1) 50%, rgba(138, 95, 204, 0) 100%);
		background: -webkit-linear-gradient(
			0deg,
			rgba(138, 95, 204, 1) 50%,
			rgba(138, 95, 204, 0) 100%
		);
		background: linear-gradient(0deg, rgba(138, 95, 204, 1) 50%, rgba(138, 95, 204, 0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#8a5fcc",endColorstr="#8a5fcc",GradientType=1);
	}
	.card-Rating-3 {
		background: #4175bb;
		background: linear-gradient(180deg, #303051, #4175bb 53%);
		border-bottom-color: #4175bb;
	}
	.card-Rating-3-bg {
		background: rgb(48, 48, 81);
		background: -moz-linear-gradient(180deg, rgba(48, 48, 81, 1) 0%, rgba(65, 117, 187, 1) 100%);
		background: -webkit-linear-gradient(180deg, rgba(48, 48, 81, 1) 0%, rgba(65, 117, 187, 1) 100%);
		background: linear-gradient(180deg, rgba(48, 48, 81, 1) 0%, rgba(65, 117, 187, 1) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#303051",endColorstr="#4175bb",GradientType=1);
	}

	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.text-Rating-5 {
		color: #fcba49;
	}
	.text-Rating-4 {
		color: #9f66c8;
	}
	.text-Rating-3 {
		color: #4175bb;
	}
</style>
