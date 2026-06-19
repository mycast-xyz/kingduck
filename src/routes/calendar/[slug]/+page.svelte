<script lang="ts">
	import type { PageData } from './$types';
	import DesktopListMenu from '../../../app/view/menu/DesktopListMenu.svelte';
	import FooterView from '../../../app/view/footer/FooterView.svelte';
	import SeoHead from '../../../app/view/SeoHead.svelte';

	// Weather Components
	import GameWeatherHeader from '../../../app/view/calendar/game/GameWeatherHeader.svelte';
	import WeatherTimeline from '../../../app/view/calendar/game/WeatherTimeline.svelte';
	import WeeklyForecast from '../../../app/view/calendar/game/WeeklyForecast.svelte';
	import GachaIndexCards from '../../../app/view/calendar/game/GachaIndexCards.svelte';
	import EventList from '../../../app/view/calendar/game/EventList.svelte';

	let { data }: { data: PageData } = $props();

	// Data from +page.ts
	let events = $derived(data.events || []);
	let weatherAlert = $derived(data.weatherAlert);
	let game = $derived(data.game);
</script>

<SeoHead title={data.title} description={data.meta?.description} />

<div class="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="weather-page"
		class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden"
	>
		<!-- Sidebar Menu -->
		<DesktopListMenu {data} />

		<!-- Main Content Area -->
		<div class="h-screen w-full overflow-y-auto pr-6 pl-4 pt-16">
			<div class="w-full mx-auto space-y-6 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				{#if weatherAlert && events}
					<div class="col-span-2">
						<!-- Weather Header -->
						<GameWeatherHeader {weatherAlert} {events} />

						<!-- Timeline (7 Days) -->
						<WeatherTimeline {events} />

						<!-- Event List (NEW) -->
						<EventList {events} />
					</div>
					<div class="col-span-1 mt-0">
						<!-- Gacha Life Index -->
						<GachaIndexCards {weatherAlert} {events} />
						<!-- Weekly Forecast (14 Days) -->
						<WeeklyForecast {events} />
					</div>
				{:else}
					<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-12 text-center">
						<i class="ri-loader-4-line text-6xl text-gray-400 animate-spin mb-4 block"></i>
						<p class="text-xl text-gray-600 dark:text-gray-400">기상 데이터를 불러오는 중...</p>
					</div>
				{/if}
			</div>
			<FooterView />
		</div>
	</article>
</div>
