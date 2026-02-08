<script lang="ts">
	import { adminStatsService } from '../../service/AdminStatsService';

	const keywords = adminStatsService.getPopularKeywords();
	const maxCount = Math.max(...keywords.map((k) => k.count));
</script>

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-lg font-bold text-gray-800">최근 인기 검색어</h3>
		<button class="text-xs font-medium text-indigo-600 hover:underline">상세보기</button>
	</div>

	<div class="space-y-4">
		{#each keywords as kw, i}
			<div class="flex items-center gap-4">
				<span class="w-6 text-sm font-bold {i < 3 ? 'text-indigo-600' : 'text-gray-400'}"
					>{i + 1}</span
				>
				<div class="flex-1">
					<div class="flex justify-between mb-1">
						<span class="text-sm font-medium text-gray-700">{kw.keyword}</span>
						<span class="text-xs text-gray-500">{kw.count.toLocaleString()}회</span>
					</div>
					<div class="h-1.5 w-full rounded-full bg-gray-50">
						<div
							class="h-full rounded-full bg-indigo-400"
							style="width: {(kw.count / maxCount) * 100}%"
						></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
