<script lang="ts">
	import { onMount } from 'svelte';
	import client from '../../service/api/client';
	import type { CharacterType } from '../../model/api/api';
	import { CharacterRarityService } from '../../service/character/CharacterRarityService';
	import { getCardBgStyle as getGradientStyle } from '../../util/StyleUtils';

	const {
		originalId,
		gameId,
		currentUrl,
		initData,
		isMain = false,
		isMobile = false
	} = $props<{
		originalId: number | string;
		gameId: number;
		currentUrl?: string;
		initData?: any;
		isMain?: boolean;
		isMobile?: boolean;
	}>();

	let character = $state<CharacterType | null>(null);
	let loading = $state(true);
	let error = $state(false);

	// Rarity Service Initialization
	let rarityService = $state<CharacterRarityService>();

	$effect(() => {
		if (initData) {
			rarityService = new CharacterRarityService(initData);
		}
	});

	onMount(async () => {
		if (!originalId || !gameId) {
			loading = false;
			return;
		}

		try {
			const res = await client.get<CharacterType>(
				`/api/v0/character/${gameId}/original/${originalId}`
			);
			if (res.data) {
				character = res.data;
			} else {
				error = true;
			}
		} catch (e) {
			console.error(`Failed to load character ${originalId}`, e);
			error = true;
		} finally {
			loading = false;
		}
	});

	function getRarityColor(rarity: any) {
		if (!initData || !rarityService) {
			return null;
		}

		// Compatibility: Handle both flattened and nested structures
		const rarityColors = initData.rarityColors || initData?.list?.card?.rarityColors;

		if (!rarityColors) {
			return null;
		}

		const rarityData = rarityService.rarityData(rarity);

		if (rarityData === undefined || rarityData === null || rarityData === 0) {
			return null;
		}

		const colorKey = rarityData.toString();
		const colors = rarityColors[colorKey];
		return colors || null;
	}

	function getCardStyle(rarity: any) {
		const colors = getRarityColor(rarity);
		if (!colors) return '';

		if (colors.gradient) {
			return `background: linear-gradient(180deg, ${colors.gradient.from}, ${colors.background} ${colors.gradient.stop}); border-bottom-color: ${colors.background};`;
		} else {
			return `background: ${colors.background}; border-bottom-color: ${colors.background};`;
		}
	}

	// element 이미지 경로 생성
	const getElementImageUrl = (element: any, isMobile: boolean = false) => {
		if (!element || !initData?.list?.card?.element) {
			// 기본값: iconUrl이 있으면 사용
			return element?.iconUrl ? `${currentUrl}/${element.iconUrl}` : '';
		}

		const cardConfig = initData.list.card.element;

		if (cardConfig.display === 'path' && isMobile && cardConfig.mobilePath) {
			// 모바일: 하드코딩된 경로 패턴 사용
			return cardConfig.mobilePath
				.replace('{gameSlug}', initData?.gameSlug)
				.replace('{elementName}', element.name || '');
		} else if (cardConfig.display === 'iconUrl' || !isMobile) {
			// 데스크톱 또는 iconUrl 모드: API에서 받은 iconUrl 사용
			return element.iconUrl ? `${currentUrl}/${element.iconUrl}` : '';
		} else {
			// 기본값
			return element.iconUrl ? `${currentUrl}/${element.iconUrl}` : '';
		}
	};

	// 카드 배경 그라데이션 스타일 생성 (반응형)
	// 카드 배경 그라데이션 스타일 생성 (반응형)
	const getCardBgStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';
		return getGradientStyle(colors.background);
	};
</script>

<div class="group relative flex flex-col items-center">
	<div class="relative w-full" style="aspect-ratio: {isMobile ? '1/1' : '1/1'};">
		{#if loading}
			<div
				class="flex h-full w-full animate-pulse items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700"
			>
				<!-- Loading Skeleton -->
			</div>
		{:else if character}
			<div
				class="max-h-[400px] max-w-[400px] overflow-hidden rounded-lg shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-lg dark:ring-white/10"
				style={getCardStyle(character.rarity)}
			>
				{#if character.imageUrl}
					<img
						src={`${currentUrl}/${character.imageUrl}`}
						alt={character.name}
						loading="lazy"
						class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
						onerror={(e) => {
							// @ts-ignore
							e.target.src = '/assets/logo/error_icon.png';
						}}
					/>
				{/if}

				<div
					class="image-info absolute inset-x-0 bottom-0 px-2 py-2"
					style={getCardBgStyle(character.rarity)}
				>
					<h3
						class="break-keep pb-1 text-sm md:text-lg font-extrabold drop-shadow-md text-white text-center"
					>
						{character.name}
					</h3>
				</div>
			</div>

			{#if isMain}
				<div
					class="absolute -top-1 -left-1 z-10 rounded-br-xl rounded-tl-lg bg-orange-500 font-black text-white shadow-xl border-b-2 border-r-2 border-white/30
                        px-2 py-0.5 text-[10px]
                        sm:px-6 sm:py-2 sm:text-xl sm:tracking-wider"
				>
					MAIN
				</div>
			{/if}
		{:else}
			<div
				class="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700"
			>
				<span class="text-gray-400">?</span>
			</div>
		{/if}
	</div>
</div>
