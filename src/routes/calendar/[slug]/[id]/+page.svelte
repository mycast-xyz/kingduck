<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import type { CalendarEvent } from '../../../../app/model/calendar/CalendarTypes';
	import EventDetailModal from '../../../../app/view/calendar/EventDetailModal.svelte';

	let { data }: { data: PageData } = $props();

	// Data from +page.ts
	let events = $derived(data.events);
	let game = $derived(data.game);

	// Filter Active & Upcoming
	const now = new Date();
	let activeEvents = $derived(events.filter((e) => e.startDate <= now && e.endDate >= now));
	let upcomingEvents = $derived(
		events
			.filter((e) => e.startDate > now)
			.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
	);

	// Modal State
	let selectedEvent: CalendarEvent | null = $state(null);

	function openModal(event: CalendarEvent) {
		selectedEvent = event;
	}

	function closeModal() {
		selectedEvent = null;
	}

	function getTimeRemaining(end: Date) {
		const diff = end.getTime() - now.getTime();
		if (diff < 0) return 'Ended';
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);
		if (days > 0) return `${days} days`;
		return `${hours} hours`;
	}

	function getStartTime(start: Date) {
		const diff = start.getTime() - now.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days === 0) return 'Starts Today';
		return `Starts in ${days} days`;
	}
</script>

<div
	class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 font-sans"
>
	<div class="max-w-4xl mx-auto">
		<a
			href="/calendar"
			class="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 mb-6 transition-colors"
		>
			<i class="ri-arrow-left-line"></i> Back to Global Calendar
		</a>

		<header class="mb-8 border-b dark:border-gray-700 pb-6 flex items-center justify-between">
			<div>
				<h1
					class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2"
				>
					{game.name}
				</h1>
				<p class="text-lg text-gray-600 dark:text-gray-400">
					Detailed schedule & resource planning
				</p>
			</div>
			<!-- Game Icon/Logo could go here -->
			<div class="w-16 h-16 rounded-2xl {game.color} shadow-lg opacity-80"></div>
		</header>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- Current Active Banners -->
			<section
				class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 transition-all hover:shadow-xl"
			>
				<h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
					<i class="ri-fire-line text-orange-500"></i> Active Now
				</h2>
				<div class="space-y-4">
					{#each activeEvents as event (event.id)}
						{@const total = event.endDate.getTime() - event.startDate.getTime()}
						{@const elapsed = now.getTime() - event.startDate.getTime()}
						{@const percent = Math.min(100, Math.max(0, (elapsed / total) * 100))}
						<!-- Event Card -->
						<button
							class="w-full text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
							onclick={() => openModal(event)}
						>
							<div
								class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 overflow-hidden border-2 border-white dark:border-gray-500 shadow-sm"
							>
								{#if event.image}
									<img src={event.image} alt={event.name} class="w-full h-full object-cover" />
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<i class="ri-star-smile-line text-2xl text-gray-400"></i>
									</div>
								{/if}
							</div>
							<div class="flex-1 min-w-0">
								<h3
									class="font-bold text-lg truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
								>
									{event.name}
								</h3>
								<p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
									Ends in <span class="text-red-500 font-bold"
										>{getTimeRemaining(event.endDate)}</span
									>
								</p>
								<!-- Progress Bar (Simple visual) -->
								<div
									class="w-full bg-gray-200 dark:bg-gray-600 mt-2 h-1.5 rounded-full overflow-hidden"
								>
									<!-- Calculate progress percentage roughly -->
									<div
										class="bg-green-500 h-full transition-all duration-1000"
										style="width: {percent}%"
									></div>
								</div>
							</div>
						</button>
					{:else}
						<p class="text-gray-500 italic text-center py-4">No active events right now.</p>
					{/each}
				</div>
			</section>

			<!-- Upcoming -->
			<section
				class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transition-all hover:shadow-xl"
			>
				<h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
					<i class="ri-calendar-check-line text-blue-500"></i> Upcoming
				</h2>
				<div class="space-y-4">
					{#each upcomingEvents as event (event.id)}
						<button
							class="w-full text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex gap-4 opacity-80 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
							onclick={() => openModal(event)}
						>
							<div
								class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 overflow-hidden border-2 border-dashed border-gray-400 dark:border-gray-500"
							>
								{#if event.image}
									<img
										src={event.image}
										alt={event.name}
										class="w-full h-full object-cover opacity-70"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center">
										<i class="ri-time-line text-2xl text-gray-400"></i>
									</div>
								{/if}
							</div>
							<div>
								<h3 class="font-bold text-lg truncate text-gray-700 dark:text-gray-300">
									{event.name}
								</h3>
								<p class="text-sm text-blue-600 dark:text-blue-400 font-medium">
									{getStartTime(event.startDate)}
								</p>
								<p class="text-xs text-gray-400 mt-1">
									{event.startDate.toLocaleDateString()}
								</p>
							</div>
						</button>
					{:else}
						<p class="text-gray-500 italic text-center py-4">No upcoming events scheduled.</p>
					{/each}
				</div>
			</section>
		</div>

		<!-- Resource Kick (Placeholder for now) -->
		<section
			class="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
		>
			<h2 class="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">
				<i class="ri-money-dollar-circle-line"></i> Resource Outlook
			</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				Based on current daily income, you can save <strong>14,000 Jades</strong> before the next major
				patch.
			</p>
			<div class="flex gap-4">
				<input
					type="number"
					placeholder="Current Jades"
					class="px-4 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
				/>
				<button
					class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors shadow-sm font-medium"
					>Recalculate</button
				>
			</div>
		</section>
	</div>

	<!-- Modal Portal -->
	{#if selectedEvent}
		<EventDetailModal event={selectedEvent} onClose={closeModal} />
	{/if}
</div>
