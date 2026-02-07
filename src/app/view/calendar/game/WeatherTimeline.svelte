<script lang="ts">
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { events }: { events: CalendarEvent[] } = $props();

	// Get next 7 days
	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => {
		const date = new Date(today);
		date.setDate(date.getDate() + i);
		return date;
	});

	// Group events by date
	const eventsByDate = $derived(
		next7Days.map((date) => {
			const dateStr = date.toISOString().split('T')[0];
			const dayEvents = events.filter((e) => {
				const eventStart = e.startDate.toISOString().split('T')[0];
				// Include events that start on this date or are ongoing
				return (
					eventStart === dateStr || (e.startDate <= date && e.endDate >= date && e.type === 'GACHA')
				);
			});

			// Determine weather level for this day
			let alertLevel: 'SAFE' | 'ADVISORY' | 'WARNING' | 'DISASTER' = 'SAFE';
			if (dayEvents.filter((e) => e.type === 'GACHA').length >= 3) {
				alertLevel = 'DISASTER';
			} else if (dayEvents.filter((e) => e.type === 'GACHA').length >= 1) {
				alertLevel = 'WARNING';
			} else if (dayEvents.length > 0) {
				alertLevel = 'ADVISORY';
			}

			return {
				date,
				dateStr,
				events: dayEvents,
				alertLevel
			};
		})
	);

	// Color mapping
	const alertColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
		SAFE: {
			bg: 'bg-blue-50 dark:bg-blue-900/30',
			text: 'text-blue-700 dark:text-blue-300',
			border: 'border-blue-200 dark:border-blue-800',
			icon: 'ri-sun-line'
		},
		ADVISORY: {
			bg: 'bg-yellow-50 dark:bg-yellow-900/30',
			text: 'text-yellow-700 dark:text-yellow-300',
			border: 'border-yellow-200 dark:border-yellow-800',
			icon: 'ri-cloudy-line'
		},
		WARNING: {
			bg: 'bg-orange-50 dark:bg-orange-900/30',
			text: 'text-orange-500 dark:text-orange-300',
			border: 'border-orange-200 dark:border-orange-800',
			icon: 'ri-thunderstorms-line'
		},
		DISASTER: {
			bg: 'bg-red-50 dark:bg-red-900/30',
			text: 'text-red-500 dark:text-red-300',
			border: 'border-red-200 dark:border-red-800',
			icon: 'ri-alarm-warning-line'
		}
	};
</script>

<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200">
	<h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">7일 가챠 예보</h2>

	<!-- Timeline Carousel -->
	<div class="flex overflow-x-auto gap-3 pb-4">
		{#each eventsByDate as day}
			{@const colors = alertColors[day.alertLevel]}
			<div
				class="min-w-[140px] {colors.bg} {colors.border} border-2 rounded-xl p-4 flex-shrink-0 transition-all hover:shadow-lg"
			>
				<!-- Date -->
				<div class="text-center mb-3">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{day.date.getMonth() + 1}/{day.date.getDate()}
					</p>
					<p class="text-xs text-gray-500">
						{['일', '월', '화', '수', '목', '금', '토'][day.date.getDay()]}
					</p>
				</div>

				<!-- Weather Icon -->
				<div class="text-center mb-3">
					<i class="{colors.icon} text-4xl {colors.text}"></i>
				</div>

				<!-- Event Count -->
				<div class="text-center">
					{#if day.events.length > 0}
						<p class="text-xs text-gray-600 dark:text-gray-400 mb-1">이벤트</p>
						<p class="text-lg font-bold {colors.text}">{day.events.length}개</p>
					{:else}
						<p class="text-xs text-gray-500">평온</p>
					{/if}
				</div>

				<!-- Event Names (if any) -->
				{#if day.events.length > 0}
					<div class="mt-3 pt-3 border-t {colors.border}">
						{#each day.events.slice(0, 2) as event}
							<p class="text-xs {colors.text} truncate" title={event.name}>
								{event.type === 'GACHA' ? '🎁' : '📅'}
								{event.name.substring(0, 10)}{event.name.length > 10 ? '...' : ''}
							</p>
						{/each}
						{#if day.events.length > 2}
							<p class="text-xs text-gray-500">+{day.events.length - 2}개 더</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
