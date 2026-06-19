<script lang="ts">
	import { onDestroy } from 'svelte';
	import { GameSettingInitService } from '../../service/game/GameSettingService';
	import { CharacterRarityService } from '../../service/character/CharacterRarityService';
	import { sanitizeHtml } from '../../util/sanitize';
	import type { ItemType } from '../../model/api/api';
	import type { ItemTab } from '../../model/game/itemTabs';

	const { item, data, tabs, onClose } = $props<{
		item: ItemType;
		data: any;
		tabs: ItemTab[];
		onClose: () => void;
	}>();
	const currentUrl = data.url;

	let gameInit: any;
	let rarityService = $state<CharacterRarityService>();
	const _unsub = GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) rarityService = new CharacterRarityService(gameInit);
	});
	onDestroy(_unsub);

	const typeLabel = $derived(tabs.find((t: ItemTab) => t.type === item.type)?.label ?? item.type);

	// 등급 표시(별/숫자). ItemCardView와 동일 로직.
	const rarityDisplaySrc = () => data.info?.rarityDisplay || gameInit?.list?.card?.rarityDisplay;
	const rarityImageUrl = (rarity: any): string | null => {
		const rd = rarityDisplaySrc();
		if (!rd || rd.mode !== 'image' || !rd.images || !rarityService) return null;
		const tier = rarityService.rarityData(rarity);
		const url = rd.images[String(tier)];
		return url ? `${currentUrl}/${url}` : null;
	};

	// HSR/ZZZ 세트 효과(2pc/4pc) — 있으면 별도 섹션으로 표시.
	const meta = $derived((item.metadata ?? {}) as any);
	function formatDesc(desc: string, params?: any[]): string {
		if (!desc) return '';
		if (!params || params.length === 0) return desc;
		return desc.replace(/#(\d+)\[i\]/g, (m, idx) => {
			const v = params[parseInt(idx) - 1];
			return v !== undefined ? String(v) : m;
		});
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
	onclick={onClose}
>
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			type="button"
			class="absolute right-3 top-3 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
			aria-label="닫기"
			onclick={onClose}
		>
			<i class="ri-close-line"></i>
		</button>

		<div class="flex gap-4">
			<img
				src="{currentUrl}/{item.imageUrl}"
				alt={item.name}
				decoding="async"
				class="h-28 w-28 flex-none rounded-lg border border-gray-200 object-cover dark:border-gray-700"
			/>
			<div class="min-w-0 flex-1">
				<span
					class="inline-block rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
				>
					{typeLabel}
				</span>
				<h2 class="mt-1 break-keep text-xl font-extrabold text-gray-900 dark:text-white">
					{item.name}
				</h2>
				<div class="mt-2 flex items-center">
					{#if rarityImageUrl(item.rarity)}
						<img src={rarityImageUrl(item.rarity)} class="h-6 w-auto" alt="등급" />
					{:else if rarityService?.rarityType(item.rarity) === 'number' && item.rarity}
						{#each { length: item.rarity } as _i}
							<i class="ri-star-fill text-base text-amber-400"></i>
						{/each}
					{:else if item.rarity}
						<span class="text-sm font-bold text-amber-500">{item.rarity}</span>
					{/if}
				</div>
			</div>
		</div>

		{#if meta['2pc'] || meta['4pc']}
			<div class="mt-4 space-y-3">
				{#if meta['2pc']}
					<div>
						<span class="mb-1 block text-sm font-bold text-orange-500">2세트 효과</span>
						<p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							{@html sanitizeHtml(
								formatDesc(
									typeof meta['2pc'] === 'string' ? meta['2pc'] : meta['2pc'].desc,
									meta['2pc']?.params
								)
							)}
						</p>
					</div>
				{/if}
				{#if meta['4pc']}
					<div>
						<span class="mb-1 block text-sm font-bold text-orange-500">4세트 효과</span>
						<p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							{@html sanitizeHtml(
								formatDesc(
									typeof meta['4pc'] === 'string' ? meta['4pc'] : meta['4pc'].desc,
									meta['4pc']?.params
								)
							)}
						</p>
					</div>
				{/if}
			</div>
		{:else if item.description}
			<div class="mt-4">
				<p class="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">
					{@html sanitizeHtml(item.description)}
				</p>
			</div>
		{:else}
			<p class="mt-4 text-sm text-gray-400">상세 설명이 없습니다.</p>
		{/if}
	</div>
</div>
