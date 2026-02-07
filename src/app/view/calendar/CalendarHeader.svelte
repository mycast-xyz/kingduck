<script lang="ts">
	import type { WeatherAlertAnalysis } from '../../model/calendar/WeatherAlertCalculator';

	let { weatherAlert }: { weatherAlert: WeatherAlertAnalysis } = $props();

	// Use $derived to reactively update when weatherAlert prop changes
	const alert = $derived(weatherAlert.alert);
	const meta = $derived(weatherAlert.metadata);
</script>

<header class="mb-6">
	<!-- 기상특보 배너 -->
	<div
		class="{alert.color.bg} {alert.color
			.border} border-2 rounded-xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl"
	>
		<!-- 아이콘 + 제목 -->
		<div class="flex items-center gap-3 mb-3">
			<i class="{alert.icon} text-4xl {alert.color.text}"></i>
			<h2 class="text-2xl font-bold {alert.color.text}">
				{alert.title}
			</h2>
		</div>

		<!-- 상세 설명 -->
		<p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
			{alert.description}
		</p>

		<!-- 메타 정보 -->
		<div class="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
			{#if meta.activePickups > 0}
				<span class="px-2 py-1 bg-white dark:bg-gray-800 rounded">
					🔥 진행중: {meta.activePickups}개
				</span>
			{/if}

			{#if meta.upcomingInDays < 7}
				<span class="px-2 py-1 bg-white dark:bg-gray-800 rounded">
					⏰ D-{meta.upcomingInDays}
				</span>
			{/if}

			{#if meta.simultaneousPickups >= 2}
				<span
					class="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded font-bold"
				>
					⚠️ 동시 픽업: {meta.simultaneousPickups}개
				</span>
			{/if}
		</div>
	</div>
</header>
