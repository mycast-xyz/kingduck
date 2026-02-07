<script lang="ts">
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { events }: { events: CalendarEvent[] } = $props();

	// Get next 14 days for weekly forecast
	const today = new Date();
	const next14Days = Array.from({ length: 14 }, (_, i) => {
		const date = new Date(today);
		date.setDate(date.getDate() + i);
		return date;
	});

	// Group events by week
	const weeklyEvents = $derived(
		next14Days.map((date) => {
			const dateStr = date.toISOString().split('T')[0];
			const dayEvents = events.filter((e) => {
				const eventStart = e.startDate.toISOString().split('T')[0];
				const eventEnd = e.endDate.toISOString().split('T')[0];
				return eventStart <= dateStr && eventEnd >= dateStr;
			});

			return {
				date,
				dateStr,
				events: dayEvents,
				gachaCount: dayEvents.filter((e) => e.type === 'GACHA').length
			};
		})
	);
</script>

<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200">
	<h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">주간 예보</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="border-b border-gray-200 dark:border-gray-700">
					<th class="text-left py-3 px-4">날짜</th>
					<th class="text-left py-3 px-4">요일</th>
					<th class="text-left py-3 px-4">이벤트</th>
					<th class="text-center py-3 px-4">픽업</th>
					<th class="text-center py-3 px-4">기상</th>
				</tr>
			</thead>
			<tbody>
				{#each weeklyEvents as day}
					<tr
						class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						<td class="py-3 px-4 font-medium">
							{day.date.getMonth() + 1}/{day.date.getDate()}
						</td>
						<td class="py-3 px-4">
							{['일', '월', '화', '수', '목', '금', '토'][day.date.getDay()]}
						</td>
						<td class="py-3 px-4">
							{#if day.events.length > 0}
								<div class="space-y-1">
									{#each day.events.slice(0, 2) as event}
										<div class="text-sm">
											<span class="text-gray-600 dark:text-gray-400">
												{event.type === 'GACHA' ? '🎁' : '📅'}
											</span>
											<span class="ml-1">{event.name}</span>
										</div>
									{/each}
									{#if day.events.length > 2}
										<div class="text-xs text-gray-500">+{day.events.length - 2}개 더</div>
									{/if}
								</div>
							{:else}
								<span class="text-gray-400 text-sm">-</span>
							{/if}
						</td>
						<td class="py-3 px-4 text-center">
							{#if day.gachaCount > 0}
								<span
									class="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded font-bold"
								>
									{day.gachaCount}개
								</span>
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
						<td class="py-3 px-4 text-center">
							{#if day.gachaCount >= 3}
								<i class="ri-alarm-warning-line text-2xl text-red-500"></i>
							{:else if day.gachaCount >= 1}
								<i class="ri-thunderstorms-line text-2xl text-orange-500"></i>
							{:else if day.events.length > 0}
								<i class="ri-cloudy-line text-2xl text-yellow-500"></i>
							{:else}
								<i class="ri-sun-line text-2xl text-blue-500"></i>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
