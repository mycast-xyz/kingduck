<script lang="ts">
	import { onDestroy } from 'svelte';
	import { GameSettingInitService } from '../../service/game/GameSettingService';
	import { CharacterRarityService } from '../../service/character/CharacterRarityService';
	import { getCardBgStyle as getGradientStyle } from '../../util/StyleUtils';
	import type { ItemType } from '../../model/api/api';

	const { data, list, onSelect } = $props<{
		data: any;
		list: ItemType[];
		onSelect: (item: ItemType) => void;
	}>();
	const currentUrl = data.url;

	let gameInit: any;
	let rarityService = $state<CharacterRarityService>();

	const _unsub = GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});
	onDestroy(_unsub);

	// 등급 색/표시방식은 안정적인 data.info(GET /game)를 우선 사용(ListCardView와 동일 관행).
	const rarityColorsSrc = () => data.info?.rarityColors || gameInit?.list?.card?.rarityColors;
	const rarityDisplaySrc = () => data.info?.rarityDisplay || gameInit?.list?.card?.rarityDisplay;

	const getRarityColor = (rarity: any) => {
		const rarityColors = rarityColorsSrc();
		if (!rarityColors || !rarityService) return null;
		const rarityData = rarityService.rarityData(rarity);
		if (!rarityData) return null;
		return rarityColors[rarityData.toString()] || null;
	};

	const rarityImageUrl = (rarity: any): string | null => {
		const rd = rarityDisplaySrc();
		if (!rd || rd.mode !== 'image' || !rd.images || !rarityService) return null;
		const tier = rarityService.rarityData(rarity);
		const url = rd.images[String(tier)];
		return url ? `${currentUrl}/${url}` : null;
	};

	const getCardStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';
		if (colors.gradient) {
			return `background: linear-gradient(180deg, ${colors.gradient.from}, ${colors.background} ${colors.gradient.stop}); border-bottom-color: ${colors.background};`;
		}
		return `background: ${colors.background}; border-bottom-color: ${colors.background};`;
	};

	const getCardBgStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';
		return getGradientStyle(colors.background);
	};
</script>

<div class="con flex h-auto w-full flex-wrap content-start items-stretch justify-start">
	{#if list && list.length > 0}
		{#each list as item (item.id)}
			{@const cardStyle = getCardStyle(item.rarity)}
			{@const cardBgStyle = getCardBgStyle(item.rarity)}
			<button
				type="button"
				class="card relative m-2 block overflow-hidden rounded-lg border border-gray-100 pb-14 text-left text-white shadow-md dark:border-gray-600"
				class:mobile={data.isMobile}
				style={cardStyle || undefined}
				onclick={() => onSelect(item)}
			>
				<div
					class="img-box relative flex justify-center overflow-hidden rounded-t-lg"
					style={cardStyle || undefined}
				>
					<img
						src="{currentUrl}/{item.imageUrl}"
						alt={item.name}
						loading="lazy"
						decoding="async"
						class="h-full w-full object-cover object-top"
					/>
				</div>
				<div class="image-info absolute inset-x-0 bottom-0 px-4 py-2" style={cardBgStyle || undefined}>
					<h3 class="break-keep pb-1 text-base font-extrabold drop-shadow-md">{item.name}</h3>
					<div class="flex w-full justify-start">
						<div class="flex w-auto justify-start">
							{#if rarityImageUrl(item.rarity)}
								<img src={rarityImageUrl(item.rarity)} class="h-6 w-auto" alt="등급" />
							{:else if rarityService?.rarityType(item.rarity) === 'number' && item.rarity}
								{#each { length: item.rarity } as _i}
									<div class="icon h-5 w-4 py-1">
										{#if gameInit?.list?.card?.rarityIcon}
											{@html gameInit.list.card.rarityIcon}
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
												<path
													fill="#fff"
													d="M45.99,23.97c-11.02,0-19.96-8.94-19.96-19.96V0h-2.06v4.01c0,11.02-8.94,19.96-19.96,19.96H0v2.06h4.01c11.02,0,19.96,8.94,19.96,19.96v4.01h2.06v-4.01c0-11.02,8.94-19.96,19.96-19.96h4.01v-2.06h-4.01Z"
												/>
											</svg>
										{/if}
									</div>
								{/each}
							{:else if item.rarity}
								<span class="text-sm font-extrabold drop-shadow-md">{item.rarity}</span>
							{/if}
						</div>
					</div>
				</div>
			</button>
		{/each}
	{:else}
		<div
			class="flex h-[50vh] w-full flex-col items-center justify-center text-center text-black dark:text-gray-200"
		>
			<i class="ri-search-2-line mb-4 text-4xl"></i>
			<span class="text-lg">아이템이 없습니다.</span>
		</div>
	{/if}
</div>

<style lang="scss">
	.card {
		width: 15rem;
		height: 390px;
		.img-box {
			height: 334px;
		}
		&.mobile {
			width: calc(33.333% - 1rem);
			height: 200px;
			padding-bottom: 2.5rem;
			.img-box {
				height: 162px;
			}
		}
	}
</style>
