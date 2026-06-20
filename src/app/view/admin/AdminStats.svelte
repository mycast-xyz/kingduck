<script lang="ts">
	import AdminVisitorChart from './AdminVisitorChart.svelte';
	import AdminSearchAnalysis from './AdminSearchAnalysis.svelte';
	import AdminContentCompleteness from './AdminContentCompleteness.svelte';
</script>

<article class="space-y-8 pb-12">
	<!-- 방문자 추이 & 컨텐츠 완성도 -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<AdminVisitorChart />
		</div>
		<div>
			<AdminContentCompleteness />
		</div>
	</div>

	<!-- 검색 분석 -->
	<div class="grid grid-cols-1 gap-8">
		<AdminSearchAnalysis />
	</div>
</article>
