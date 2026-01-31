<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { hsrSkillService } from '../../service/game/starrail/HsrSkillService';

	const { listData, currentUrl, isMobile, initData, gameId, gameSlug } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
		gameId?: string;
		gameSlug?: string;
	}>();

	// listData가 객체일 경우 배열로 변환
	let items = $derived(Array.isArray(listData) ? listData : Object.values(listData || {}));

	const getFormattedName = (item: any) => {
		if (item.name?.kr) return item.name.kr.replace(/<[^>]*>/g, '');
		if (item.name?.Name) return item.name.Name;
		if (item.NodeName) return item.NodeName; // WW
		if (item.Name) return item.Name;
		if (item.title) return item.title;
		if (typeof item.name === 'string') return item.name;
		return '';
	};

	const getFormattedImage = (item: any) => {
		if (item.Image) return item.Image;
		else if (item.Id) {
			const idStr = String(item.Id);
			const prefix = idStr.slice(0, -2);
			const suffix = idStr.slice(-2).replace(/^0/, '');

			return `/assets/image/${gameSlug}/character/rank_${prefix}_${suffix}.webp`;
		} else if (item.image?.url) return item.image.url;
		else if (typeof item.image === 'string') return item.image;
		else if (item.icon) return item.icon;
		else if (item.iconUrl) return item.iconUrl;

		return '';
	};

	const getFormattedDescription = (item: any) => {
		let desc =
			item.Desc || item.description || item.info || item.NodeDescribe || '설명이 없습니다.';

		if (gameId === 'HonkaiStarRail' || item.ParamList) {
			// HSR-specific placeholder replacement
			if (item.ParamList) {
				desc = hsrSkillService.applyParams(desc, item.ParamList);
			}

			// Clean base tags
			desc = hsrSkillService.cleanDescription(desc);

			// Add Cyan coloring for numbers and brackets
			// This regex targets numbers (including %) and text within brackets []
			desc = desc.replace(/(\d+(\.\d+)?%?)/g, '<span class="text-hsr-cyan font-bold">$1</span>');
			desc = desc.replace(/(\[[^\]]+\])/g, '<span class="text-hsr-cyan">$1</span>');
		}

		return desc;
	};
</script>

<Layer title={initData?.name || '성흔'}>
	<div class="p-4">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
			{#each items as item, index}
				<div class="flex flex-col group">
					<div class="flex items-start gap-4">
						<!-- Icon Container -->
						<div class="relative flex-shrink-0">
							<div
								class="relative w-24 h-24 overflow-hidden mask-hex-irregular group-hover:border-hsr-cyan/50 transition-colors"
							>
								{#if getFormattedImage(item)}
									<img
										class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
										src="{currentUrl}{getFormattedImage(item)}"
										alt={getFormattedName(item)}
									/>
								{:else}
									<div
										class="w-full h-full flex items-center justify-center text-3xl font-bold text-white/20"
									>
										{index + 1}
									</div>
								{/if}
							</div>
						</div>

						<!-- Text Content -->
						<div class="flex-1 min-w-0 pt-1">
							<h4 class="text-lg font-bold text-hsr-cyan mb-2 tracking-tight">
								{index + 1}. {getFormattedName(item)}
							</h4>
							<div class="text-sm leading-relaxed font-light break-keep">
								{@html getFormattedDescription(item)}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</Layer>

<style>
	:global(.text-hsr-cyan) {
		color: oklch(64.6% 0.222 41.116);
	}

	.mask-hex-irregular {
		/* A stylized polygon mask similar to hakush.in icons */
		clip-path: polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%);
		border-radius: 8px; /* Fallback */
	}

	.break-keep {
		word-break: keep-all;
	}
</style>
