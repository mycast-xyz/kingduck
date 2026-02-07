<script lang="ts">
	import type { WeatherAlertAnalysis } from '../../../model/calendar/WeatherAlertCalculator';
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { weatherAlert, events }: { weatherAlert: WeatherAlertAnalysis; events: CalendarEvent[] } =
		$props();

	const alert = $derived(weatherAlert.alert);
	const meta = $derived(weatherAlert.metadata);

	// Calculate additional metrics
	const activePickups = $derived(
		events.filter((e) => {
			const now = new Date();
			return e.type === 'GACHA' && e.startDate <= now && e.endDate >= now;
		})
	);

	// Calculate "wallet humidity" (balance stress level)
	const walletHumidity = $derived(
		meta.simultaneousPickups >= 3 ? '90%' : meta.simultaneousPickups >= 2 ? '65%' : '20%'
	);

	// Calculate "gacha wind speed" (update frequency)
	const gachaWindSpeed = $derived(
		meta.activePickups >= 3 ? '강풍' : meta.activePickups >= 1 ? '보통' : '약풍'
	);
</script>

<div
	class="{alert.color.bg} {alert.color
		.border} border-2 rounded-2xl p-8 shadow-xl transition-all duration-300"
>
	<!-- Main Weather Display -->
	<div class="text-center mb-8">
		<!-- Large weather icon -->
		<i class="{alert.icon} text-8xl {alert.color.text} mb-4 block"></i>

		<!-- Alert level title -->
		<h1 class="text-5xl font-bold {alert.color.text} mb-2">
			{alert.level === 'SAFE'
				? '평온'
				: alert.level === 'ADVISORY'
					? '주의보'
					: alert.level === 'WARNING'
						? '경보'
						: alert.level === 'DISASTER'
							? '재난'
							: '복구'}
		</h1>

		<!-- Alert description -->
		<p class="text-xl text-gray-700 dark:text-gray-300 mb-4">
			{alert.description}
		</p>
	</div>

	<!-- Key Metrics Grid -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<!-- Active Pickups -->
		<div class="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
			<div class="text-3xl mb-2">🔥</div>
			<div class="text-sm text-gray-600 dark:text-gray-400">진행중</div>
			<div class="text-2xl font-bold {alert.color.text}">{meta.activePickups}개</div>
		</div>

		<!-- D-day -->
		{#if meta.upcomingInDays < 999}
			<div class="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
				<div class="text-3xl mb-2">⏰</div>
				<div class="text-sm text-gray-600 dark:text-gray-400">다음 픽업</div>
				<div class="text-2xl font-bold {alert.color.text}">D-{meta.upcomingInDays}</div>
			</div>
		{/if}

		<!-- Wallet Humidity -->
		<div class="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
			<div class="text-3xl mb-2">💧</div>
			<div class="text-sm text-gray-600 dark:text-gray-400">잔고 습도</div>
			<div class="text-2xl font-bold {alert.color.text}">{walletHumidity}</div>
		</div>

		<!-- Gacha Wind Speed -->
		<div class="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
			<div class="text-3xl mb-2">🌪️</div>
			<div class="text-sm text-gray-600 dark:text-gray-400">가챠 풍속</div>
			<div class="text-2xl font-bold {alert.color.text}">{gachaWindSpeed}</div>
		</div>
	</div>
</div>
