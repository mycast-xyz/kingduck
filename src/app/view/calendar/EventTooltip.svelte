<script lang="ts">
	import type { CalendarEvent } from '../../model/calendar/CalendarTypes';

	let { event, x, y }: { event: CalendarEvent; x: number; y: number } = $props();

	// Helper to format date
	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<div
	role="tooltip"
	class="z-50 w-64 fixed transition duration-150 ease-in-out shadow-lg bg-white dark:bg-gray-800 p-4 rounded pointer-events-none"
	style="left: {x}px; top: {y}px; transform: translate(-50%, -100%); margin-top: -8px;"
>
	<svg
		class="absolute left-1/2 bottom-[-6px] h-4 w-3 -translate-x-1/2 transform rotate-180"
		width="9px"
		height="16px"
		viewBox="0 0 9 16"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
			<g
				transform="translate(-874.000000, -1029.000000)"
				fill="#FFFFFF"
				class="fill-white dark:fill-gray-800"
			>
				<g transform="translate(850.000000, 975.000000)">
					<g transform="translate(24.000000, 0.000000)">
						<!-- Pointing UP (0deg) by default based on points, so rotate 180 to point down -->
						<polygon
							points="4.5 57.5 12.5 66.5 -3.5 66.5"
							transform="translate(4.500000, 62.000000) translate(-4.500000, -62.000000)"
						></polygon>
					</g>
				</g>
			</g>
		</g>
	</svg>
	<p class="text-sm font-bold text-gray-800 dark:text-gray-100 pb-1">{event.name}</p>
	<p class="text-xs leading-4 text-gray-600 dark:text-gray-400 pb-3">
		{formatDate(event.startDate)} ~ {formatDate(event.endDate)}
	</p>
	<div class="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-2">
		<div class="flex items-center">
			<span class="text-xs font-bold text-indigo-700 dark:text-indigo-400">
				{event.type === 'GACHA' ? 'Pickup' : 'Event'}
			</span>
		</div>
	</div>
</div>
