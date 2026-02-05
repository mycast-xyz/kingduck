<script lang="ts">
	import { onMount } from 'svelte';
	import { slide, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// 컴포넌트 가져오기
	import FooterView from '../../app/view/footer/FooterView.svelte';
	import DesktopCalendarMenu from '../../app/view/menu/DesktopCalendarMenu.svelte';
	import type { GameType } from '../../app/model/api/api';

	let { data }: { data: PageData } = $props();

	// Define types
	type Game = {
		id: string;
		name: string;
		color: string;
		icon?: string;
	};

	type EventType = 'pickup' | 'event';

	type CalendarEvent = {
		id: string;
		gameId: string;
		name: string;
		type: EventType;
		startDate: Date;
		endDate: Date;
		image?: string;
		characterName?: string;
	};

	// Game UI Configuration
	const GAME_CONFIG: Record<string, { color: string; icon?: string }> = {
		starrail: { color: 'bg-cyan-400' },
		wutheringwaves: { color: 'bg-[#3C3C46]' },
		endfield: { color: 'bg-[#B4AA00]' },
		nikke: { color: 'bg-[#DC0000]' },
		zzz: { color: 'bg-[#F0780A]' },
		reverse1999: { color: 'bg-[#AA4628]' },
		genshin: { color: 'bg-[#141E64]' }
	};

	// Merge API data with UI config
	let games: Game[] = $derived(
		data.info
			? data.info.map((g: GameType) => ({
					id: g.slug,
					name: g.name,
					color: GAME_CONFIG[g.slug]?.color || 'bg-gray-500', // Fallback color
					icon: (g as any).icon_url || g.iconUrl
				}))
			: []
	);

	const now = new Date();
	// Helper to add days
	const addDays = (d: Date, days: number) => {
		const newDate = new Date(d);
		newDate.setDate(newDate.getDate() + days);
		return newDate;
	};
	// Helper to add hours
	const addHours = (d: Date, hours: number) => {
		const newDate = new Date(d);
		newDate.setHours(newDate.getHours() + hours);
		return newDate;
	};

	const events: CalendarEvent[] = [
		// Star Rail
		{
			id: 'sr-1',
			gameId: 'starrail',
			name: 'Kafka Rerun',
			type: 'pickup',
			startDate: addDays(now, -10),
			endDate: addDays(now, 3), // Ends in 3 days
			characterName: 'Kafka'
		},
		{
			id: 'sr-2',
			gameId: 'starrail',
			name: 'Black Swan',
			type: 'pickup',
			startDate: addDays(now, 4),
			endDate: addDays(now, 24),
			characterName: 'Black Swan'
		},
		{
			id: 'sr-3',
			gameId: 'starrail',
			name: 'Pure Fiction: Tales of a Tethered Bird',
			type: 'event',
			startDate: addDays(now, -2),
			endDate: addDays(now, 28),
			characterName: ''
		},
		// Wuthering Waves (FOMO!)
		{
			id: 'ww-1',
			gameId: 'wutheringwaves',
			name: 'Jinhsi Banner',
			type: 'pickup',
			startDate: addDays(now, -14),
			endDate: addHours(now, 3), // Ends in 3 hours!
			characterName: 'Jinhsi'
		},
		{
			id: 'ww-2',
			gameId: 'wutheringwaves',
			name: 'Changli Banner',
			type: 'pickup',
			startDate: addHours(now, 4), // Starts right after
			endDate: addDays(now, 20),
			characterName: 'Changli'
		},
		{
			id: 'ww-3',
			gameId: 'wutheringwaves',
			name: 'Depths of Illusive Realm',
			type: 'event',
			startDate: addDays(now, -5),
			endDate: addDays(now, 25)
		},
		// Endfield
		{
			id: 'ef-1',
			gameId: 'endfield',
			name: 'Technical Test',
			type: 'event',
			startDate: addDays(now, 10),
			endDate: addDays(now, 15),
			characterName: 'Perlica'
		},
		// Genshin
		{
			id: 'gi-1',
			gameId: 'genshin',
			name: 'Mavuika Banner',
			type: 'pickup',
			startDate: addDays(now, -5),
			endDate: addDays(now, 15),
			characterName: 'Mavuika'
		},
		{
			id: 'gi-2',
			gameId: 'genshin',
			name: 'Lantern Rite Festival',
			type: 'event',
			startDate: addDays(now, 0),
			endDate: addDays(now, 18)
		}
	];

	// View State
	let selectedGames = $state(data.info ? data.info.map((g: GameType) => g.slug) : []);
	let filteredEvents = $derived(events.filter((e) => selectedGames.includes(e.gameId)));

	// Weather Alert Logic
	let isWeatherCritical = $derived(
		filteredEvents.some((e) => {
			if (e.type !== 'pickup') return false;
			const diffTime = e.startDate.getTime() - now.getTime();
			const diffDays = diffTime / (1000 * 60 * 60 * 24);
			return diffDays >= -7 && diffDays <= 7;
		})
	);

	// Timeline Configuration
	const daysToShow = 30;
	const pastDays = 3; // Show 3 days in the past
	const pixelsPerDay = 100;
	const timelineStart = addDays(now, -pastDays);
	timelineStart.setHours(0, 0, 0, 0);

	const totalWidth = (daysToShow + pastDays) * pixelsPerDay;

	// Helper to calculate position
	function getPosition(date: Date) {
		const diffTime = date.getTime() - timelineStart.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		return diffDays * pixelsPerDay;
	}

	function getWidth(start: Date, end: Date) {
		const diffTime = end.getTime() - start.getTime();
		const diffDays = diffTime / (1000 * 60 * 60 * 24);
		return Math.max(diffDays * pixelsPerDay, 20); // Min width 20px
	}

	function isEndingSoon(end: Date) {
		const diff = end.getTime() - now.getTime();
		return diff > 0 && diff < 24 * 60 * 60 * 1000;
	}

	function getTimeRemaining(end: Date) {
		const diff = end.getTime() - now.getTime();
		if (diff < 0) return 'Ended';
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days}d left`;
		return `${hours}h left`;
	}

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

	function startDrag(e: MouseEvent) {
		isDown = true;
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
	// Layout Logic
	type LayoutEvent = CalendarEvent & { row: number };

	function resolveEventRows(items: CalendarEvent[]): LayoutEvent[] {
		if (items.length === 0) return [];

		// Sort by start date, then by duration (longer first) to optimize packing
		const sorted = [...items].sort((a, b) => {
			if (a.startDate.getTime() !== b.startDate.getTime()) {
				return a.startDate.getTime() - b.startDate.getTime();
			}
			return (
				b.endDate.getTime() - b.startDate.getTime() - (a.endDate.getTime() - a.startDate.getTime())
			);
		});

		const rows: Date[] = []; // Tracks the end time of the last event in each row
		const result: LayoutEvent[] = [];

		for (const event of sorted) {
			let placed = false;
			for (let i = 0; i < rows.length; i++) {
				// Check if this row is free.
				// existing end time < new event start time
				if (rows[i].getTime() <= event.startDate.getTime()) {
					result.push({ ...event, row: i });
					rows[i] = event.endDate;
					placed = true;
					break;
				}
			}

			if (!placed) {
				// Start a new row
				result.push({ ...event, row: rows.length });
				rows.push(event.endDate);
			}
		}
		return result;
	}
</script>

<div class=" max-w-screen min-w-[1700px] overflow-hidden bg-gray-100 dark:bg-gray-800">
	<div class="ml-[80px] flex text-gray-800 dark:text-gray-100 p-4 font-sans">
		<DesktopCalendarMenu {data} {games} bind:selectedGames />
		<article class="list h-auto w-[calc(100%-360px)] overflow-y-auto pr-2 pt-16 pl-4">
			<header class="mb-6 flex flex-col md:flex-row items-start md:items-center">
				<div
					class="flex items-center gap-2 text-5xl m-0 p-0 {isWeatherCritical
						? 'text-orange-500 dark:text-orange-300'
						: 'text-green-700 dark:text-green-300'}"
				>
					<i class={isWeatherCritical ? 'ri-thunderstorms-line' : 'ri-sun-line'}></i>
				</div>
				<div class="ml-4">
					<div
						class="flex items-center gap-2 {isWeatherCritical
							? 'text-orange-500 dark:text-orange-300'
							: 'text-green-700 dark:text-green-300'} font-semibold mb-1"
					>
						<span class="text-xl font-bold">
							{isWeatherCritical
								? '기상특보: 잔고 한파 주의보 발령'
								: '기상특보: 픽업 태풍 소멸, 평온한 기류 지속'}
						</span>
					</div>
					<!-- Future Prediction / Kick -->
					<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div
							class="{isWeatherCritical
								? 'bg-orange-50 dark:bg-orange-900/30 border-orange-100 dark:border-orange-800'
								: 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800'} border rounded-lg p-3 text-sm max-w-md"
						>
							<p class="text-gray-600 dark:text-gray-300 text-xs">
								Next critical overlap: <span class="font-bold text-red-500">In 3 days</span> (Star Rail
								& Myunjo). Prepare your wallet!
							</p>
						</div>
					</div>
				</div>
			</header>

			<!-- Gantt Chart View -->
			<div
				class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative mb-6"
			>
				<!-- Timeline Header -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="w-full overflow-x-auto custom-scrollbar cursor-grab active:cursor-grabbing select-none"
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
						<!-- Day Markers (Background Grid) -->
						{#each { length: daysToShow + pastDays } as _, i}
							{@const d = addDays(timelineStart, i)}
							{@const isToday = d.toDateString() === now.toDateString()}
							<div
								class="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-700/50 box-border pointer-events-none
                        {isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}"
								style="left: {i * pixelsPerDay}px; width: {pixelsPerDay}px;"
							>
								<div
									class="px-2 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 sticky top-0 z-10"
								>
									{d.getDate()}
									<span class="text-[10px] opacity-70"
										>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span
									>
								</div>
							</div>
						{/each}

						<!-- Current Time Indicator -->
						<div
							class="absolute top-8 bottom-0 w-0.5 bg-red-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.6)] pointer-events-none"
							style="left: {getPosition(now)}px;"
						>
							<div class="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full"></div>
							<div
								class="absolute top-0 left-2 text-xs font-bold text-red-500 bg-white/80 dark:bg-gray-800/80 px-1 rounded"
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
									{@const pickups = resolveEventRows(gameEvents.filter((e) => e.type === 'pickup'))}
									{@const otherEvents = resolveEventRows(
										gameEvents.filter((e) => e.type === 'event')
									)}

									{@const pickupRows =
										pickups.length > 0 ? Math.max(...pickups.map((e) => e.row)) + 1 : 0}
									{@const eventRows =
										otherEvents.length > 0 ? Math.max(...otherEvents.map((e) => e.row)) + 1 : 0}

									{@const pickupHeight = Math.max(pickupRows * 70, 70)}
									<!-- Min height for empty pickup slot -->
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
											{@const left = getPosition(event.startDate)}
											{@const width = getWidth(event.startDate, event.endDate)}
											{@const urgent = isEndingSoon(event.endDate)}
											{@const top = 8 + event.row * 70}

											<a
												href="/calendar/{game.id}"
												class="absolute h-16 rounded-lg shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-transform hover:scale-[1.02] hover:z-40 hover:shadow-md cursor-pointer flex items-center
                                        {urgent ? 'ring-2 ring-red-500 animate-pulse' : ''}
                                        {game.color} bg-opacity-10 dark:bg-opacity-20"
												style="left: {left}px; width: {width}px; top: {top}px;"
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
										{/each}

										<!-- Lane 2: Events -->
										{#each otherEvents as event, i}
											{@const left = getPosition(event.startDate)}
											{@const width = getWidth(event.startDate, event.endDate)}
											{@const urgent = isEndingSoon(event.endDate)}
											{@const top = pickupHeight + 8 + event.row * 60}

											<a
												href="/calendar/{game.id}"
												class="absolute h-14 rounded-md shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-transform hover:scale-[1.02] hover:z-40 hover:shadow-md cursor-pointer flex items-center
                                                {urgent ? 'ring-2 ring-red-500' : ''}
                                                bg-gray-100 dark:bg-gray-700"
												style="left: {left}px; width: {width}px; top: {top}px;"
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

			<FooterView />
		</article>
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
