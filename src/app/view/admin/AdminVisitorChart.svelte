<script lang="ts">
	import { adminStatsService } from '../../service/AdminStatsService';

	const visitorStats = adminStatsService.getVisitorStats();
	const maxVal = Math.max(...visitorStats.data);
</script>

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-lg font-bold text-gray-800">주간 방문자 추이</h3>
		<div class="flex gap-2">
			<span class="flex items-center gap-1 text-xs text-gray-500">
				<span class="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
				UV (Unique View)
			</span>
		</div>
	</div>

	<div class="flex h-56 items-end justify-between gap-2 px-2">
		{#each visitorStats.data as val, i}
			<div class="group relative flex flex-1 flex-col items-center gap-2">
				<!-- 툴팁 -->
				<div
					class="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 rounded bg-gray-800 px-2 py-1 text-[10px] text-white transition-transform group-hover:scale-100"
				>
					{val.toLocaleString()}
				</div>

				<!-- 막대 -->
				<div
					class="w-full rounded-t-sm bg-indigo-50 transition-all duration-500 group-hover:bg-indigo-500"
					style="height: {(val / maxVal) * 100}%"
				></div>

				<!-- 라벨 -->
				<span class="text-[10px] font-medium text-gray-400">{visitorStats.labels[i]}</span>
			</div>
		{/each}
	</div>
</div>
