<script lang="ts">
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { events }: { events: CalendarEvent[] } = $props();

	// 현재 시간
	const now = new Date();

	// 가챠 이벤트만 필터링 및 정렬 (종료일 기준)
	const gachaEvents = $derived(
		events
			.filter((e) => e.type === 'GACHA')
			.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
	);

	// 일반 이벤트만 필터링 및 정렬 (종료일 기준)
	const gameEvents = $derived(
		events
			.filter((e) => e.type === 'EVENT')
			.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
	);

	// 남은 시간 계산
	function getTimeRemaining(endDate: Date): string {
		const diff = endDate.getTime() - now.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		if (days > 0) {
			return `${days}일 ${hours}시간`;
		} else if (hours > 0) {
			return `${hours}시간`;
		} else {
			return '종료 임박';
		}
	}

	// 이벤트 상태 확인
	function isActive(event: CalendarEvent): boolean {
		return event.startDate <= now && event.endDate >= now;
	}

	function isUpcoming(event: CalendarEvent): boolean {
		return event.startDate > now;
	}

	function isEnded(event: CalendarEvent): boolean {
		return event.endDate < now;
	}
</script>

<div class="space-y-6">
	<!-- 가챠/픽업 리스트 -->
	{#if gachaEvents.length > 0}
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
		>
			<div class="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<i class="ri-star-line"></i>
					가챠/픽업
				</h2>
			</div>
			<div class="p-6 space-y-3">
				{#each gachaEvents as event}
					{@const active = isActive(event)}
					{@const upcoming = isUpcoming(event)}
					{@const ended = isEnded(event)}
					<div
						class="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md
							{active ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : ''}
							{upcoming ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
							{ended ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 opacity-60' : ''}
							{!active && !upcoming && !ended
							? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
							: ''}"
					>
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
							>
								<i class="ri-vip-crown-line text-2xl text-white"></i>
							</div>
							<div>
								<h3 class="font-bold text-gray-800 dark:text-white">
									{event.characterName || event.name}
								</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
								</p>
							</div>
						</div>
						<div class="text-right">
							{#if active}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500 text-white text-sm font-medium"
								>
									<i class="ri-fire-line"></i>
									진행중
								</span>
								<p class="text-sm text-purple-600 dark:text-purple-400 mt-1">
									{getTimeRemaining(event.endDate)} 남음
								</p>
							{:else if upcoming}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-medium"
								>
									<i class="ri-time-line"></i>
									예정
								</span>
								<p class="text-sm text-blue-600 dark:text-blue-400 mt-1">
									{Math.ceil((event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}일
									후 시작
								</p>
							{:else if ended}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-400 text-white text-sm font-medium"
								>
									<i class="ri-check-line"></i>
									종료
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- 이벤트 리스트 -->
	{#if gameEvents.length > 0}
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
		>
			<div class="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
				<h2 class="text-xl font-bold text-white flex items-center gap-2">
					<i class="ri-calendar-event-line"></i>
					이벤트
				</h2>
			</div>
			<div class="p-6 space-y-3">
				{#each gameEvents as event}
					{@const active = isActive(event)}
					{@const upcoming = isUpcoming(event)}
					{@const ended = isEnded(event)}
					<div
						class="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md
							{active ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
							{upcoming ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
							{ended ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 opacity-60' : ''}
							{!active && !upcoming && !ended
							? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
							: ''}"
					>
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center"
							>
								<i class="ri-gift-line text-2xl text-white"></i>
							</div>
							<div>
								<h3 class="font-bold text-gray-800 dark:text-white">
									{event.name}
								</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
								</p>
							</div>
						</div>
						<div class="text-right">
							{#if active}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-medium"
								>
									<i class="ri-play-circle-line"></i>
									진행중
								</span>
								<p class="text-sm text-blue-600 dark:text-blue-400 mt-1">
									{getTimeRemaining(event.endDate)} 남음
								</p>
							{:else if upcoming}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium"
								>
									<i class="ri-time-line"></i>
									예정
								</span>
								<p class="text-sm text-green-600 dark:text-green-400 mt-1">
									{Math.ceil((event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}일
									후 시작
								</p>
							{:else if ended}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-400 text-white text-sm font-medium"
								>
									<i class="ri-check-line"></i>
									종료
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
