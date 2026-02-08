<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { adminStatsService, type SystemSummary } from '../../../service/AdminStatsService';

	let summary: SystemSummary | null = null;

	// 바이트 단위 변환 함수
	function formatBytes(bytes: number, decimals = 2) {
		if (!+bytes) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	// 초 단위 시간을 사람이 읽기 쉬운 형태로 변환
	function formatUptime(seconds: number) {
		const days = Math.floor(seconds / (3600 * 24));
		const hours = Math.floor((seconds % (3600 * 24)) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${days}d ${hours}h ${minutes}m`;
	}

	onMount(() => {
		const unsubscribe = adminStatsService.systemSummary.subscribe((value) => {
			summary = value;
		});

		adminStatsService.fetchSystemSummary();

		return () => {
			unsubscribe();
		};
	});
</script>

<div
	class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100">
		<i class="ri-server-line text-blue-500"></i> 시스템 요약
	</h3>

	{#if summary}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<!-- OS Info -->
			<div class="flex items-start gap-4">
				<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
					<i class="ri-linux-fill text-2xl text-blue-600 dark:text-blue-400"></i>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">OS Platform</p>
					<p class="font-bold text-gray-800 dark:text-gray-100">
						{summary.os.distro}
						{summary.os.release}
					</p>
					<p class="text-xs text-gray-400">{summary.os.hostname} ({summary.os.arch})</p>
				</div>
			</div>

			<!-- CPU Info -->
			<div class="flex items-start gap-4">
				<div class="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
					<i class="ri-cpu-line text-2xl text-purple-600 dark:text-purple-400"></i>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">CPU</p>
					<p class="font-bold text-gray-800 dark:text-gray-100">
						{summary.cpu.brand}
					</p>
					<p class="text-xs text-gray-400">{summary.cpu.cores} Cores @ {summary.cpu.speed}GHz</p>
				</div>
			</div>

			<!-- Memory Info -->
			<div class="flex items-start gap-4">
				<div class="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
					<i class="ri-database-2-line text-2xl text-green-600 dark:text-green-400"></i>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Memory</p>
					<p class="font-bold text-gray-800 dark:text-gray-100">
						{formatBytes(summary.memory.total)}
					</p>
					<p class="text-xs text-gray-400">Swap: {formatBytes(summary.memory.swaptotal)}</p>
				</div>
			</div>

			<!-- Runtime Info -->
			<div class="flex items-start gap-4">
				<div class="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
					<i class="ri-timer-flash-line text-2xl text-orange-600 dark:text-orange-400"></i>
				</div>
				<div>
					<p class="text-sm font-medium text-gray-500 dark:text-gray-400">System Time</p>
					<p class="font-bold text-gray-800 dark:text-gray-100">{summary.time.timezone}</p>
					<p class="text-xs text-gray-400">Up: {formatUptime(summary.time.uptime)}</p>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex h-32 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
			></div>
		</div>
	{/if}
</div>
