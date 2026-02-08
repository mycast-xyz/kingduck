<script lang="ts">
	import { onMount } from 'svelte';
	import { adminStatsService, type GameCompleteness } from '../../service/AdminStatsService';

	let completeness: GameCompleteness[] = [];

	onMount(async () => {
		adminStatsService.completeness.subscribe((value) => {
			completeness = value;
		});
		await adminStatsService.fetchCompleteness();
	});
</script>

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-lg font-bold text-gray-800">게임별 컨텐츠 완성도</h3>
		<span class="text-xs font-medium text-gray-400">실시간 데이터 기준</span>
	</div>

	<div class="space-y-6">
		{#each completeness as game}
			<div class="group">
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="font-semibold text-gray-700">{game.gameName}</span>
						<span class="text-xs text-gray-400"
							>{game.completedCharacters}/{game.totalCharacters} 캐릭터</span
						>
					</div>
					<span class="text-sm font-bold text-indigo-600">{game.completeness}%</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
					<div
						class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
						style="width: {game.completeness}%"
					></div>
				</div>
			</div>
		{/each}
	</div>

	{#if completeness.length === 0}
		<div class="flex h-40 items-center justify-center text-gray-400">데이터를 불러오는 중...</div>
	{/if}
</div>
