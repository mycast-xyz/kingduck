<script lang="ts">
	// 컴포넌트 가져오기
	import RarityFilterMenu from '../../menu/filter/RarityFilterMenu.svelte';
	import ListFilterMenu from '../../menu/filter/ListFilterMenu.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
</script>

<div class="max-h-[calc(100vh-120px)] overflow-y-auto">
	<!-- 필터 기능 -->
	<RarityFilterMenu {data} />
	<!-- 필터 기능 -->
	{#if data?.info?.elements && Object.keys(data.info.elements).length > 0}
		<ListFilterMenu {data} />
	{/if}
</div>
