<script lang="ts">
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { events }: { events: CalendarEvent[] } = $props();

	// Get next 21 days for weekly outlook
	const today = new Date();
	const forecastDays = Array.from({ length: 21 }, (_, i) => {
		const date = new Date(today);
		date.setDate(date.getDate() + i);
		return date;
	});

	// Helper to get week number of month
	function getWeekOfMonth(date: Date) {
		const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
		const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
		const offsetDate = date.getDate() + dayOfWeek - 1;
		return Math.floor(offsetDate / 7) + 1;
	}

	// Group days by week
	const weeklyGroups = $derived.by(() => {
		const groups: Record<string, { days: Date[]; events: CalendarEvent[] }> = {};

		forecastDays.forEach((date) => {
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const week = getWeekOfMonth(date);
			const key = `${year}-${month}-${week}`;

			if (!groups[key]) {
				groups[key] = { days: [], events: [] };
			}
			groups[key].days.push(date);
		});

		return Object.entries(groups)
			.map(([key, data]) => {
				const [year, month, week] = key.split('-').map(Number);
				const startDate = data.days[0];
				const endDate = data.days[data.days.length - 1];

				const dateRangeStr = `${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()}`;

				// Filter events active in this week
				const weekEvents = events.filter((e) => {
					// Check overlap
					const eventStart = e.startDate;
					const eventEnd = e.endDate;
					const weekStart = data.days[0];
					const weekEnd = new Date(data.days[data.days.length - 1]);
					weekEnd.setHours(23, 59, 59, 999);

					return eventStart <= weekEnd && eventEnd >= weekStart;
				});

				// Unique events by ID or Name to avoid duplicates
				const uniqueEvents = Array.from(
					new Map(weekEvents.map((e) => [e.id || e.name, e])).values()
				);

				const gachaCount = uniqueEvents.filter((e) => e.type === 'GACHA').length;
				const normalEventCount = uniqueEvents.filter((e) => e.type === 'EVENT').length;

				return {
					year,
					month,
					week,
					dateRangeStr,
					events: uniqueEvents,
					gachaCount,
					normalEventCount
				};
			})
			.sort((a, b) => {
				if (a.year !== b.year) return a.year - b.year;
				if (a.month !== b.month) return a.month - b.month;
				return a.week - b.week;
			});
	});
</script>

<div
	class="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
>
	<h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">주간 전망</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="border-b border-gray-200 dark:border-gray-700">
					<th class="text-left py-3 px-4 w-[180px]">기간</th>
					<th class="text-left py-3 px-4">주요 이벤트</th>
					<th class="text-center py-3 px-4 w-[100px]">픽업</th>
					<th class="text-center py-3 px-4 w-[100px]">기상</th>
				</tr>
			</thead>
			<tbody>
				{#each weeklyGroups as group}
					<tr
						class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
					>
						<td class="py-4 px-4 align-top">
							<div class="flex flex-col">
								<span class="font-bold text-gray-800 dark:text-gray-200 text-lg">
									{group.month}월 {group.week}주차
								</span>
								<span class="text-xs text-gray-500 mt-1">
									({group.dateRangeStr})
								</span>
							</div>
						</td>
						<td class="py-4 px-4 align-top">
							{#if group.events.length > 0}
								<div class="flex flex-col gap-2">
									{#each group.events.slice(0, 3) as event}
										<div class="flex items-center text-sm">
											<span class="flex-shrink-0 w-6 text-center text-lg mr-2">
												{event.type === 'GACHA' ? '🎁' : '📅'}
											</span>
											<div class="flex flex-col min-w-0">
												<span class="font-medium text-gray-700 dark:text-gray-300 truncate">
													{event.name}
												</span>
												<span class="text-xs text-gray-400">
													~ {event.endDate.getMonth() + 1}/{event.endDate.getDate()}
												</span>
											</div>
										</div>
									{/each}
									{#if group.events.length > 3}
										<div class="text-xs text-gray-400 pl-8">
											+ {group.events.length - 3}개의 이벤트 더보기
										</div>
									{/if}
								</div>
							{:else}
								<span class="text-gray-400 text-sm pl-2">예정된 이벤트가 없습니다.</span>
							{/if}
						</td>
						<td class="py-4 px-4 text-center align-top pt-6">
							{#if group.gachaCount > 0}
								<span
									class="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded font-bold"
								>
									{group.gachaCount}개
								</span>
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
						<td class="py-4 px-4 text-center align-top pt-6">
							{#if group.gachaCount >= 3}
								<i class="ri-alarm-warning-line text-2xl text-red-500" title="매우 바쁨"></i>
							{:else if group.gachaCount >= 1}
								<i class="ri-thunderstorms-line text-2xl text-orange-500" title="바쁨"></i>
							{:else if group.normalEventCount > 0}
								<i class="ri-cloudy-line text-2xl text-yellow-500" title="보통"></i>
							{:else}
								<i class="ri-sun-line text-2xl text-blue-500" title="여유"></i>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
