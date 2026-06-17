<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { HsrSkillTreeViewModel } from '../../service/game/starrail/HsrSkillTreeViewModel.svelte';
	import { WwSkillTreeViewModel } from '../../service/game/wutheringwaves/WwSkillTreeViewModel.svelte';
	import { EndfieldSkillViewModel } from '../../service/game/endfield/EndfieldSkillViewModel.svelte';
	import { EndfieldPassiveViewModel } from '../../service/game/endfield/EndfieldPassiveViewModel.svelte';
	import { Reverse1999SkillViewModel } from '../../service/game/reverse1999/Reverse1999SkillViewModel.svelte';
	import { sanitizeHtml } from '../../util/sanitize';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	const { listData, currentUrl, initData, extraData, gameId, gameSlug, title, vmType } = $props<{
		listData: any;
		currentUrl: string;
		isMobile: boolean;
		initData: ViewInitData;
		extraData?: any;
		gameId?: any;
		gameSlug?: string;
		title?: string;
		vmType?: string;
	}>();

	let activeTab = $state(0);
	let tabLabels = $derived(initData?.tabLabels || ['캐릭터']);

	let vm = $derived.by(() => {
		let data = activeTab === 0 ? listData : extraData;
		if (!data) return null;

		// gameId는 이제 slug로 통일됨(F-B3). 단일 slug 키로 분기.
		const slug = gameSlug || initData?.gameSlug || gameId || initData?.gameId;

		if (slug === 'starrail') {
			return new HsrSkillTreeViewModel(data, currentUrl, { initData });
		} else if (slug === 'wutheringwaves') {
			return new WwSkillTreeViewModel(data, currentUrl, { initData });
		} else if (slug === 'endfield') {
			if (vmType === 'passive') {
				return new EndfieldPassiveViewModel(data, currentUrl, { initData, extraData });
			}
			return new EndfieldSkillViewModel(data, currentUrl, { initData, extraData });
		} else if (slug === 'reverse1999') {
			return new Reverse1999SkillViewModel(data, currentUrl, { initData });
		}
		return null;
	});

	let items = $derived(vm?.items || []);
	let selectedList = $state<any>(null);
	let selectedLevel = $state(1);

	$effect(() => {
		if (items.length > 0) {
			selectedList = items[0];
			selectedLevel = 1;
		} else {
			selectedList = null;
		}
	});

	let isWW = $derived(
		(gameSlug || initData?.gameSlug || gameId || initData?.gameId) === 'wutheringwaves'
	);
</script>

<Layer title={title || initData?.name || '스킬'}>
	{#if initData?.hasTabs}
		<div class="flex border-b border-gray-200 dark:border-gray-700 mb-4 px-4">
			{#each tabLabels as label, index}
				<button
					class="px-4 py-2 font-medium text-sm transition-colors relative
                        {activeTab === index
						? 'text-indigo-600 dark:text-indigo-400'
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
					onclick={() => {
						activeTab = index;
					}}
				>
					{label}
					{#if activeTab === index}
						<div
							class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"
						></div>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<div
		class="flex flex-col md:flex-row gap-4 p-4 {isWW
			? 'min-h-[400px] max-h-[800px]'
			: 'max-h-96'} overflow-hidden"
	>
		<!-- 스킬 리스트 -->
		<div
			class="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-1/4 md:border-r border-gray-200 dark:border-gray-700 pr-2 scrollbar-hide"
		>
			{#each items as item}
				<button
					class="flex items-center gap-3 p-2 rounded-lg transition-colors text-left flex-shrink-0 md:flex-shrink
                        {selectedList?.id === item.id
						? 'bg-gray-200 dark:bg-gray-700'
						: 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
					onclick={() => {
						selectedList = item;
						selectedLevel = 1;
					}}
				>
					<div
						class="w-10 h-10 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded-full p-1 overflow-hidden"
					>
						{#if item.image}
							<img
								class="w-full h-full object-contain"
								src="{currentUrl}/{item.image}"
								alt={item.name}
							/>
						{/if}
					</div>
					<span
						class="font-medium text-sm text-gray-900 dark:text-gray-100 hidden md:block truncate"
					>
						{item.name}
					</span>
				</button>
			{/each}
		</div>

		<!-- 스킬 상세 -->
		<div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
			{#if selectedList && vm}
				<div class="flex flex-col h-full">
					<div
						class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
					>
						<div class="flex items-center gap-3">
							<div class="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg p-1">
								{#if selectedList.image}
									<img
										class="w-full h-full object-contain"
										src="{currentUrl}{selectedList.image}"
										alt={selectedList.name}
									/>
								{/if}
							</div>
							<div>
								<h3 class="text-xl font-bold text-gray-900 dark:text-white">
									{selectedList.name}
								</h3>
								{#if selectedList.type}
									<span class="text-sm text-gray-500 dark:text-gray-400">
										[{selectedList.type}]
									</span>
								{/if}
							</div>
						</div>

						{#if vm.getMaxLevel(selectedList) > 1}
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium whitespace-nowrap">Lv. {selectedLevel}</span>
								<input
									type="range"
									class="w-24 md:w-32 accent-indigo-600"
									min="1"
									max={vm.getMaxLevel(selectedList)}
									bind:value={selectedLevel}
								/>
							</div>
						{/if}
					</div>

					<div
						class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
					>
						{@html sanitizeHtml(vm.getFormattedDescription(selectedList, selectedLevel))}
					</div>
				</div>
			{:else}
				<div class="flex items-center justify-center h-full text-gray-500 py-20">
					스킬을 선택해주세요.
				</div>
			{/if}
		</div>
	</div>
</Layer>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #8888;
		border-radius: 4px;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
