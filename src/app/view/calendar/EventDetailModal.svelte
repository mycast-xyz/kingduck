<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { CalendarEvent } from '../../model/calendar/CalendarTypes';

	let { event, onClose }: { event: CalendarEvent; onClose: () => void } = $props();

	function formatDate(date: Date) {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long'
		});
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<div
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
	onclick={handleBackdropClick}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
	tabindex="-1"
	role="button"
	transition:fade={{ duration: 200 }}
>
	<div
		class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
		transition:scale={{ duration: 200, start: 0.95 }}
	>
		<!-- Close Button -->
		<button
			onclick={onClose}
			class="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
		>
			<i class="ri-close-line text-xl"></i>
		</button>

		<!-- Hero Image / Header -->
		<div class="h-48 bg-gray-200 dark:bg-gray-700 relative">
			{#if event.image}
				<img src={event.image} alt={event.name} class="w-full h-full object-cover" />
			{:else}
				<div
					class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600"
				>
					<i class="ri-calendar-event-line text-6xl text-white/50"></i>
				</div>
			{/if}
			<div
				class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
			>
				<span
					class="inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-2
                    {event.type === 'GACHA'
						? 'bg-orange-500 text-white'
						: 'bg-blue-500 text-white'}"
				>
					{event.type === 'GACHA' ? 'Pickup' : 'Event'}
				</span>
				<h2 class="text-2xl font-bold text-white leading-tight">{event.name}</h2>
			</div>
		</div>

		<!-- Content -->
		<div class="p-6 space-y-4">
			<!-- Date Range -->
			<div class="flex items-start gap-3">
				<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
					<i class="ri-time-line text-xl"></i>
				</div>
				<div>
					<p class="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">Duration</p>
					<p class="text-gray-800 dark:text-gray-200 font-medium">
						{formatDate(event.startDate)}
					</p>
					<p class="text-sm text-gray-400 dark:text-gray-500 text-center my-0.5">to</p>
					<p class="text-gray-800 dark:text-gray-200 font-medium">
						{formatDate(event.endDate)}
					</p>
				</div>
			</div>

			{#if event.characterName}
				<div class="flex items-start gap-3">
					<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
						<i class="ri-user-star-line text-xl"></i>
					</div>
					<div>
						<p class="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase">
							Featured Character
						</p>
						<p class="text-gray-800 dark:text-gray-200 font-medium">{event.characterName}</p>
					</div>
				</div>
			{/if}

			<!-- Description (Placeholder for now as API might not provide full details yet) -->
			<div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
				<p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
					Detailed event information will be displayed here.
					{event.name} is currently active in the game. Check the in-game announcements for more specific
					rewards and mechanics.
				</p>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button
					onclick={onClose}
					class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
				>
					Close
				</button>
				<a
					href="#"
					class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
				>
					Details <i class="ri-external-link-line"></i>
				</a>
			</div>
		</div>
	</div>
</div>
