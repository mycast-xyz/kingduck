<script lang="ts">
	import ItemTypeTabs from '../../item/ItemTypeTabs.svelte';
	import ItemCardView from '../../item/ItemCardView.svelte';
	import ItemDetailModal from '../../item/ItemDetailModal.svelte';
	import FooterView from '../../footer/FooterView.svelte';
	import MobileGameNav from '../../menu/MobileGameNav.svelte';
	import { ItemListService, itemList } from '../../../service/item/ItemListService';
	import type { ItemType } from '../../../model/api/api';

	const { data } = $props<{ data: any }>();

	let activeType = $state(data.activeType);
	let searchQuery = $state('');
	let selected = $state<ItemType | null>(null);

	$effect(() => {
		ItemListService.setSearchQuery(searchQuery);
	});

	function selectType(type: string) {
		activeType = type;
		ItemListService.setType(type);
	}
</script>

<div class="mt-7 w-screen overflow-x-hidden bg-gray-100 dark:bg-gray-800">
	<MobileGameNav />
	<article class="relative flex h-auto w-full items-center px-4 pt-12">
		<div class="flex w-full items-center rounded-lg border border-gray-200 bg-white px-3 py-1">
			<i class="ri-search-line mr-2 text-xl text-gray-400"></i>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="아이템 검색"
				class="h-9 w-full border-none bg-transparent text-sm placeholder-gray-500 focus:outline-none"
			/>
		</div>
	</article>

	<div class="overflow-x-auto px-4 pt-3">
		<ItemTypeTabs tabs={data.tabs} active={activeType} onSelect={selectType} />
	</div>

	<article class="my-0 mr-0 mt-2 flex h-full overflow-hidden">
		<div class="h-full w-full overflow-y-auto px-2">
			<ItemCardView {data} list={$itemList} onSelect={(item) => (selected = item)} />
			<FooterView />
		</div>
	</article>
</div>

{#if selected}
	<ItemDetailModal item={selected} {data} tabs={data.tabs} onClose={() => (selected = null)} />
{/if}
