<script lang="ts">
	import FooterView from '../../footer/FooterView.svelte';
	import DesktopItemMenu from '../../menu/DesktopItemMenu.svelte';
	import ItemTypeTabs from '../../item/ItemTypeTabs.svelte';
	import ItemCardView from '../../item/ItemCardView.svelte';
	import ItemDetailModal from '../../item/ItemDetailModal.svelte';
	import { ItemListService, itemList } from '../../../service/item/ItemListService';
	import type { ItemType } from '../../../model/api/api';

	const { data } = $props<{ data: any }>();

	let activeType = $state(data.activeType);
	let selected = $state<ItemType | null>(null);

	function selectType(type: string) {
		activeType = type;
		ItemListService.setType(type);
	}
</script>

<div class="h-screen w-screen min-w-[1700px] overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article id="item-component" class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden">
		<DesktopItemMenu {data} />
		<div class="h-auto w-[calc(100%-320px)] overflow-y-auto pr-2 pt-16">
			<div class="mb-4 px-2">
				<ItemTypeTabs tabs={data.tabs} active={activeType} onSelect={selectType} />
			</div>
			<ItemCardView {data} list={$itemList} onSelect={(item) => (selected = item)} />
			<FooterView />
		</div>
	</article>
</div>

{#if selected}
	<ItemDetailModal item={selected} {data} tabs={data.tabs} onClose={() => (selected = null)} />
{/if}
