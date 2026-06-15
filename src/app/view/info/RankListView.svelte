<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { HsrRankListViewModel } from '../../service/game/starrail/HsrRankListViewModel.svelte';
	import { WwRankListViewModel } from '../../service/game/wutheringwaves/WwRankListViewModel.svelte';
	import { EndfieldRankListViewModel } from '../../service/game/endfield/EndfieldRankListViewModel.svelte';
	import { EndfieldPotentialViewModel } from '../../service/game/endfield/EndfieldPotentialViewModel.svelte';
	import { Reverse1999RankListViewModel } from '../../service/game/reverse1999/Reverse1999RankListViewModel.svelte';
	import { sanitizeHtml } from '../../util/sanitize';

	const { listData, currentUrl, gameId, gameSlug, initData, vmType, title } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: any;
		gameId?: string;
		gameSlug: string;
		vmType?: string;
		title?: string;
	}>();

	let vm = $derived.by(() => {
		if (gameId === 'HonkaiStarRail' || gameSlug === 'starrail') {
			return new HsrRankListViewModel(listData, gameSlug, currentUrl);
		} else if (gameId === 'WutheringWaves' || gameSlug === 'wutheringwaves') {
			return new WwRankListViewModel(listData, gameSlug, currentUrl);
		} else if (gameId === 'endfield' || gameSlug === 'endfield' || gameId === '13') {
			if (vmType === 'potential' || initData?.props?.vmType === 'potential') {
				return new EndfieldPotentialViewModel(listData, gameSlug, currentUrl);
			}
			return new EndfieldRankListViewModel(listData, gameSlug, currentUrl, initData);
		} else if (gameId === 'Reverse1999' || gameSlug === 'reverse1999') {
			return new Reverse1999RankListViewModel(listData, gameSlug, currentUrl);
		}
		return null;
	});

	let items = $derived(vm?.items || []);
</script>

<Layer title={title || initData?.name || '성흔'}>
	<div class="p-4">
		<div
			class="grid gap-x-6 gap-y-8 {title === '형상효율'
				? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
				: 'grid-cols-1 md:grid-cols-2'}"
		>
			{#each items as item}
				<div class="flex flex-col group">
					<div class="flex items-start gap-4">
						<!-- Icon Container -->
						<div class="relative flex-shrink-0">
							<div
								class="relative w-24 h-24 overflow-hidden mask-hex-irregular group-hover:border-cyan/50 transition-colors"
							>
								{#if item.image}
									<img
										class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300 bg-gray-500 dark:bg-gray-300"
										src="{currentUrl}{item.image}"
										alt={item.name}
									/>
								{:else}
									<div
										class="w-full h-full flex items-center justify-center text-3xl font-bold text-white/20 dark:text-white"
									>
										{item.index}
									</div>
								{/if}
							</div>
						</div>

						<!-- Text Content -->
						<div class="flex-1 min-w-0 pt-1">
							<h4 class="text-lg font-bold text-hsr-cyan mb-2 tracking-tight">
								{item.index}. {item.name}
							</h4>
							<div class="text-sm leading-relaxed font-light break-keep">
								{@html sanitizeHtml(item.description)}
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
