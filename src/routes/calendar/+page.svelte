<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';
	import DesktopCalendarMenu from '../../app/view/menu/DesktopCalendarMenu.svelte';
	import type { PageData } from './$types';
	import type { GameType } from '../../app/model/api/api';
	import type { Game, CalendarEvent } from '../../app/model/calendar/CalendarTypes';
	import { GAME_CONFIG } from '../../app/model/calendar/CalendarConfig';

	// Refactored Components
	import CalendarHeader from '../../app/view/calendar/CalendarHeader.svelte';
	import CalendarTimeline from '../../app/view/calendar/CalendarTimeline.svelte';
	import EventTooltip from '../../app/view/calendar/EventTooltip.svelte';

	let { data }: { data: PageData } = $props();

	// Hover Handling
	let hoveredEvent: { event: CalendarEvent; x: number; y: number } | null = $state(null);

	function handleMouseEnter(e: MouseEvent, event: CalendarEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		// Position to the top-center of the mouse cursor
		hoveredEvent = {
			event,
			x: e.clientX,
			y: e.clientY
		};
	}

	function handleMouseLeave() {
		hoveredEvent = null;
	}

	// Data Transformation
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

	// Parse Events
	let events: CalendarEvent[] = $derived(
		data.events
			? data.events.map((e: any) => ({
					...e,
					startDate: new Date(e.startDate),
					endDate: new Date(e.endDate)
				}))
			: []
	);

	// View State
	let selectedGames = $state(data.info ? data.info.map((g: GameType) => g.slug) : []);
	let filteredEvents = $derived(events.filter((e) => selectedGames.includes(e.gameId)));
	const now = new Date();

	// Weather Alert Analysis
	import { analyzeWeatherAlert } from '../../app/model/calendar/WeatherAlertCalculator';
	let weatherAlert = $derived(analyzeWeatherAlert(filteredEvents, now));

	// Debug: Track changes in reactive state
	$effect(() => {
		console.log('=== Weather Alert Update ===');
		console.log('Selected Games:', selectedGames);
		console.log('Filtered Events Count:', filteredEvents.length);
		console.log('Weather Alert:', weatherAlert);
	});
</script>

<div
	class=" max-w-screen min-w-[1700px] h-screen overflow-hidden bg-gray-100 dark:bg-gray-800 overflow-y-hidden"
>
	<div class="ml-[80px] flex text-gray-800 dark:text-gray-100 font-sans overflow-y-hidden">
		<DesktopCalendarMenu {data} {games} bind:selectedGames />
		<article class="list h-screen w-[calc(100%-260px)] overflow-y-auto pr-6 pt-16 pl-4">
			<CalendarHeader {weatherAlert} />

			<CalendarTimeline
				{games}
				{selectedGames}
				{filteredEvents}
				{now}
				onEventHover={handleMouseEnter}
				onEventLeave={handleMouseLeave}
			/>

			<FooterView />
		</article>
	</div>
	{#if hoveredEvent}
		<EventTooltip event={hoveredEvent.event} x={hoveredEvent.x} y={hoveredEvent.y} />
	{/if}
</div>
