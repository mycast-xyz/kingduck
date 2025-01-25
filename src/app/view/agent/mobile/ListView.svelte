<script lang="ts">
	import ListCardView from '../../list/ListCardView.svelte';

	export let data: PageData;
</script>

<div class=" mt-7 w-screen overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800">
	<article id="list-componet" class=" my-0 mr-0 flex h-full overflow-hidden">
		<div class="list h-full w-full overflow-y-auto px-2 pt-12">
			<ListCardView {data} />
		</div>
	</article>
</div>
