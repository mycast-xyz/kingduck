<script lang="ts">
	import { onMount } from 'svelte';
	import { slide, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { CalendarEvent, Game } from '../../model/calendar/CalendarTypes';
	import { CALENDAR_CONFIG } from '../../model/calendar/CalendarConfig';
	import { CalendarUtils } from '../../../utils/calendar/CalendarUtils';

	let {
		games,
		selectedGames,
		filteredEvents,
		now,
		onEventHover,
		onEventLeave
	}: {
		games: Game[];
		selectedGames: string[];
		filteredEvents: CalendarEvent[];
		now: Date;
		onEventHover: (e: MouseEvent, event: CalendarEvent) => void;
		onEventLeave: () => void;
	} = $props();

	// Timeline Configuration
	const { daysToShow, pastDays, pixelsPerDay } = CALENDAR_CONFIG;
	const timelineStart = CalendarUtils.getTimelineStart(now);
	const totalWidth = (daysToShow + pastDays) * pixelsPerDay;

	// Helper Wrappers for Template
	const addDays = CalendarUtils.addDays;
	const getPosition = (date: Date) => CalendarUtils.getPosition(date, timelineStart);
	const getWidth = CalendarUtils.getWidth;
	const isEndingSoon = (end: Date) => CalendarUtils.isEndingSoon(end, now);
	const getTimeRemaining = (end: Date) => CalendarUtils.getTimeRemaining(end, now);
	const resolveEventRows = CalendarUtils.resolveEventRows;

	// Auto scroll to current time on mount
	let scrollContainer: HTMLElement;
	onMount(() => {
		if (scrollContainer) {
			const currentPos = getPosition(now);
			scrollContainer.scrollLeft = currentPos - 300; // Center a bit
		}
	});

	// Drag to scroll logic
	let isDown = false;
	let startX: number;
	let scrollLeft: number;
	let velX = 0;
	let lastTime = 0;
	let animationFrameId: number;
	let hasDragged = false; // Track if user actually dragged

	function startDrag(e: MouseEvent) {
		isDown = true;
		hasDragged = false;
		startX = e.pageX - scrollContainer.offsetLeft;
		scrollLeft = scrollContainer.scrollLeft;
		velX = 0;
		cancelAnimationFrame(animationFrameId);
	}

	function stopDrag() {
		isDown = false;
		startMomentum();
	}

	function moveDrag(e: MouseEvent) {
		if (!isDown) return;
		e.preventDefault();
		const x = e.pageX - scrollContainer.offsetLeft;
		const walk = (x - startX) * 2; // Scroll-fast

		// If user moved more than 5px, consider it a drag
		if (Math.abs(walk) > 5) {
			hasDragged = true;
		}

		const prevScrollLeft = scrollContainer.scrollLeft;
		scrollContainer.scrollLeft = scrollLeft - walk;

		// Calculate velocity
		const nowTime = performance.now();
		const dt = nowTime - lastTime;
		if (dt > 0) {
			velX = (scrollContainer.scrollLeft - prevScrollLeft) / dt;
		}
		lastTime = nowTime;
	}

	function startMomentum() {
		cancelAnimationFrame(animationFrameId);
		let previousTime = performance.now();

		function step(time: number) {
			const dt = time - previousTime;
			previousTime = time;

			if (Math.abs(velX) > 0.1) {
				scrollContainer.scrollLeft += velX * dt;
				velX *= 0.95; // Friction
				animationFrameId = requestAnimationFrame(step);
			}
		}
		animationFrameId = requestAnimationFrame(step);
	}
</script>

<!-- Gantt Chart View -->
<div
	class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative mb-6"
>
	<!-- Timeline Header -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="w-full overflow-x-auto overflow-y-auto custom-scrollbar cursor-grab active:cursor-grabbing select-none h-[calc(100vh-370px)]"
		bind:this={scrollContainer}
		onmousedown={startDrag}
		onmouseleave={stopDrag}
		onmouseup={stopDrag}
		onmousemove={moveDrag}
		role="region"
		aria-label="Calendar Timeline"
		tabindex="0"
	>
		<div class="relative" style="width: {totalWidth}px; min-height: 400px;">
			<!-- Sticky Date Header Row -->
			<div
				class="sticky top-0 z-30 h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
			>
				{#each { length: daysToShow + pastDays } as _, i}
					{@const d = addDays(timelineStart, i)}
					{@const isToday = d.toDateString() === now.toDateString()}
					<div
						class="absolute top-0 h-10 flex items-center px-2 text-xs font-medium text-gray-600 dark:text-gray-300
							{isToday ? 'bg-orange-100/70 dark:bg-orange-900/30 font-bold' : ''}"
						style="left: {i * pixelsPerDay}px; width: {pixelsPerDay}px;"
					>
						{d.getDate()}
						<span class="text-[10px] opacity-70 ml-1"
							>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span
						>
					</div>
				{/each}
			</div>

			<!-- Day Markers (Background Grid) -->
			{#each { length: daysToShow + pastDays } as _, i}
				{@const d = addDays(timelineStart, i)}
				{@const isToday = d.toDateString() === now.toDateString()}
				<div
					class="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-700/50 box-border pointer-events-none
                        {isToday ? 'bg-orange-50/50 dark:bg-orange-600/10' : ''}"
					style="left: {i * pixelsPerDay}px; width: {pixelsPerDay}px;"
				></div>
			{/each}

			<!-- Current Time Indicator -->
			<div
				class="absolute top-8 bottom-0 w-0.5 bg-orange-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.6)] pointer-events-none"
				style="left: {getPosition(now)}px;"
			>
				<div class="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-orange-500 rounded-full"></div>
				<div
					class="absolute top-0 left-2 text-xs font-bold text-orange-500 bg-white/80 dark:bg-gray-800/80 px-1 rounded"
				>
					NOW
				</div>
			</div>

			<!-- Game Rows -->
			<div class="pt-12 flex flex-col gap-6 pb-6">
				{#each games as game}
					{#if selectedGames.includes(game.id)}
						{@const gameEvents = filteredEvents.filter((e) => e.gameId === game.id)}

						<!-- Layout Calculation -->
						{@const allPickups = gameEvents.filter((e) => e.type === 'GACHA')}
						{@const pickups =
							allPickups.length > 0
								? [
										allPickups.sort((a, b) => {
											// Prioritize currently active banners, then most recently started
											const aActive = a.startDate <= now && a.endDate >= now;
											const bActive = b.startDate <= now && b.endDate >= now;
											if (aActive && !bActive) return -1;
											if (!aActive && bActive) return 1;
											return b.startDate.getTime() - a.startDate.getTime();
										})[0]
									]
								: []}
						<!-- Show only 1 gacha to avoid overlap -->
						{@const sortedEvents = gameEvents
							.filter((e) => e.type === 'EVENT')
							.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())}
						<!-- Sort events by end date - earlier ending events first -->
						{@const otherEvents = resolveEventRows(sortedEvents)}

						{@const pickupHeight = 70}
						<!-- Fixed height for single pickup row -->
						{@const eventRows =
							otherEvents.length > 0 ? Math.max(...otherEvents.map((e) => e.row)) + 1 : 0}

						{@const eventHeight = Math.max(eventRows * 60, 60)}
						<!-- Min height for empty event slot -->
						{@const totalHeight = pickupHeight + eventHeight + 16}
						<!-- 16px buffer -->

						<div
							class="relative w-full group transition-all duration-300 ease-in-out"
							style="height: {totalHeight}px"
							in:slide|local={{ axis: 'y', duration: 300, easing: cubicOut }}
						>
							<!-- Sticky Game Label (Left) -->
							<div
								class="sticky left-0 z-20 w-32 md:w-48 pl-4 pr-6 h-full flex flex-col justify-center bg-gradient-to-r from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 pointer-events-none gap-1"
							>
								<div class="flex items-center gap-2 mb-2 absolute top-6">
									<div class="w-2 h-8 rounded-full {game.color}"></div>
									<span
										class="font-bold text-gray-700 dark:text-gray-200 text-sm md:text-base leading-tight"
									>
										{game.name}
									</span>
								</div>
								<!-- Lane Labels -->
								<div
									class="flex flex-col pl-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider h-full absolute top-0 pt-4"
									style="gap: {pickupHeight - 10}px"
								>
									<span class="mt-12">Pickups</span>
									<span class="">Events</span>
								</div>
							</div>

							<!-- Lane 1: Pickups -->
							{#each pickups as event, i}
								{@const layout = CalendarUtils.getClampedEventLayout(
									event.startDate,
									event.endDate,
									timelineStart,
									daysToShow,
									pastDays
								)}
								{@const urgent = isEndingSoon(event.endDate)}
								{@const top = 8}
								<!-- All pickups display on same row -->

								{#if layout.isVisible}
									<a
										href="/calendar/{game.id}/{event.id}"
										onmouseenter={(e) => onEventHover(e, event)}
										onmousemove={(e) => onEventHover(e, event)}
										onmouseleave={onEventLeave}
										class="absolute h-16 rounded-lg shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-transform hover:scale-[1.02] hover:z-40 hover:shadow-md cursor-pointer flex items-center
                                        {urgent ? 'ring-2 ring-red-500 animate-pulse' : ''}
                                        {game.color} bg-opacity-10 dark:bg-opacity-20"
										style="left: {layout.left}px; width: {layout.width}px; top: {top}px;"
										title="{event.name} ({event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()})"
										in:fly|local={{ x: 20, delay: i * 50, duration: 400 }}
									>
										<!-- Progress Bar Background (Optional) -->
										<div
											class="absolute bottom-0 left-0 h-1 {game.color} opacity-40"
											style="width: 100%"
										></div>

										<div class="flex items-center gap-3 px-3 w-full overflow-hidden">
											<!-- Icon Placeholder -->
											<div
												class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 border-2 border-white dark:border-gray-600 flex items-center justify-center overflow-hidden"
											>
												<i class="ri-user-smile-line text-lg text-gray-500"></i>
											</div>

											<div class="flex flex-col min-w-0">
												<span
													class="font-bold text-xs md:text-sm truncate text-gray-800 dark:text-gray-100 leading-tight"
												>
													{event.characterName || event.name}
												</span>
												<span class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
													{#if urgent}
														<span class="text-red-500 font-bold"
															>Ends in {getTimeRemaining(event.endDate)}!</span
														>
													{:else}
														{getTimeRemaining(event.endDate)}
													{/if}
												</span>
											</div>
										</div>
									</a>
								{/if}
							{/each}

							<!-- Lane 2: Events -->
							{#each otherEvents as event, i}
								{@const layout = CalendarUtils.getClampedEventLayout(
									event.startDate,
									event.endDate,
									timelineStart,
									daysToShow,
									pastDays
								)}
								{@const urgent = isEndingSoon(event.endDate)}
								{@const top = pickupHeight + 8 + event.row * 60}

								{#if layout.isVisible}
									<a
										href="/calendar/{game.id}"
										onmouseenter={(e) => onEventHover(e, event)}
										onmousemove={(e) => onEventHover(e, event)}
										onmouseleave={onEventLeave}
										class="absolute h-14 rounded-md shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-transform hover:scale-[1.02] hover:z-40 hover:shadow-md cursor-pointer flex items-center
                                                {urgent ? 'ring-2 ring-red-500' : ''}
                                                bg-gray-100 dark:bg-gray-700"
										style="left: {layout.left}px; width: {layout.width}px; top: {top}px;"
										title="{event.name} ({event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()})"
										in:fly|local={{ x: 20, delay: i * 50, duration: 400 }}
									>
										<div class="flex items-center gap-2 px-3 w-full overflow-hidden">
											<div class="w-1 h-8 rounded-full {game.color}"></div>
											<div class="flex flex-col min-w-0">
												<span
													class="font-semibold text-xs text-gray-700 dark:text-gray-200 truncate leading-tight"
												>
													{event.name}
												</span>
												<span class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
													{event.startDate.toLocaleDateString(undefined, {
														month: 'short',
														day: 'numeric'
													})} - {event.endDate.toLocaleDateString(undefined, {
														month: 'short',
														day: 'numeric'
													})}
												</span>
											</div>
										</div>
									</a>
								{/if}
							{/each}
						</div>
					{/if}
				{/each}

				{#if selectedGames.length === 0}
					<div class="text-center py-10 text-gray-400">Select a game to view schedule</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		height: 8px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 20px;
	}
</style>
