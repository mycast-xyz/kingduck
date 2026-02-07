<script lang="ts">
	import { onMount } from 'svelte';
	import Swiper from 'swiper';
	import { FreeMode } from 'swiper/modules';
	import 'swiper/css';
	import 'swiper/css/free-mode';
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { events }: { events: CalendarEvent[] } = $props();

	// Get next 14 days
	const today = new Date();
	const next14Days = Array.from({ length: 14 }, (_, i) => {
		const date = new Date(today);
		date.setDate(date.getDate() + i);
		return date;
	});

	// Group events by date
	const eventsByDate = $derived(
		next14Days.map((date, index) => {
			const dateStr = date.toISOString().split('T')[0];
			const dayEvents = events.filter((e) => {
				const eventStart = e.startDate.toISOString().split('T')[0];
				// Include events that start on this date or are ongoing
				return (
					eventStart === dateStr || (e.startDate <= date && e.endDate >= date && e.type === 'GACHA')
				);
			});

			// Determine phase based on remaining duration of active gachas
			let alertLevel: 'SAFE' | 'ADVISORY' | 'WARNING' | 'DISASTER' | 'RED' | 'YELLOW' | 'PURPLE' =
				'SAFE';

			const activeGachas = dayEvents.filter((e) => e.type === 'GACHA');

			if (activeGachas.length > 0) {
				// Calculate max remaining days among all active gachas on this day
				const maxRemainingDays = Math.max(
					...activeGachas.map((e) => {
						const endDate = new Date(e.endDate);
						const currDate = new Date(date);
						// Time difference in days
						return Math.ceil((endDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
					})
				);

				if (maxRemainingDays > 14) {
					alertLevel = 'RED'; // 3주차 (초기/강력)
				} else if (maxRemainingDays > 7) {
					alertLevel = 'YELLOW'; // 2주차 (중기/주의)
				} else {
					alertLevel = 'PURPLE'; // 1주차 (말기/소멸)
				}
			} else if (dayEvents.length > 0) {
				alertLevel = 'ADVISORY'; // 일반 이벤트
			}

			// Calculate week number (1-based)
			const weekNumber = Math.floor(index / 7) + 1;

			return {
				date,
				dateStr,
				events: dayEvents,
				alertLevel,
				weekNumber,
				dayIndex: index
			};
		})
	);

	// Color mapping
	const alertColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
		SAFE: {
			bg: 'bg-blue-50 dark:bg-blue-900/30',
			text: 'text-blue-700 dark:text-blue-300',
			border: 'border-blue-200 dark:border-blue-800',
			icon: 'ri-sun-line'
		},
		ADVISORY: {
			bg: 'bg-blue-50 dark:bg-blue-900/30',
			text: 'text-blue-700 dark:text-blue-300',
			border: 'border-blue-200 dark:border-blue-800',
			icon: 'ri-calendar-check-line'
		},
		RED: {
			bg: 'bg-red-50 dark:bg-red-900/30',
			text: 'text-red-500 dark:text-red-300',
			border: 'border-red-400 dark:border-red-600',
			icon: 'ri-typhoon-line'
		},
		YELLOW: {
			bg: 'bg-yellow-50 dark:bg-yellow-900/30',
			text: 'text-yellow-700 dark:text-yellow-300',
			border: 'border-yellow-400 dark:border-yellow-600',
			icon: 'ri-windy-line'
		},
		PURPLE: {
			bg: 'bg-purple-50 dark:bg-purple-900/30',
			text: 'text-purple-600 dark:text-purple-300',
			border: 'border-purple-400 dark:border-purple-600',
			icon: 'ri-mist-line'
		}
	};

	// Swiper instance
	let swiperContainer: HTMLElement;
	let swiper: Swiper;

	onMount(() => {
		swiper = new Swiper(swiperContainer, {
			modules: [FreeMode],
			slidesPerView: 'auto',
			spaceBetween: 12,
			freeMode: {
				enabled: true,
				sticky: false
			},
			grabCursor: true
		});

		return () => {
			if (swiper) swiper.destroy();
		};
	});
</script>

<div
	class="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 mb-8 dark:border-gray-700"
>
	<h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">14일 가챠 예보</h2>

	<!-- Swiper Container -->
	<div class="swiper-container overflow-hidden" bind:this={swiperContainer}>
		<div class="swiper-wrapper pb-4">
			{#each eventsByDate as day}
				{@const colors = alertColors[day.alertLevel]}

				<!-- Determine Badge Text and Color -->
				{@const badgeText =
					day.alertLevel === 'RED'
						? '3주차'
						: day.alertLevel === 'YELLOW'
							? '2주차'
							: day.alertLevel === 'PURPLE'
								? '1주차'
								: day.alertLevel === 'ADVISORY'
									? '이벤트'
									: ''}
				{@const badgeColor =
					day.alertLevel === 'RED'
						? 'bg-red-500 text-white'
						: day.alertLevel === 'YELLOW'
							? 'bg-yellow-500 text-white'
							: day.alertLevel === 'PURPLE'
								? 'bg-purple-500 text-white'
								: day.alertLevel === 'ADVISORY'
									? 'bg-blue-500 text-white'
									: 'hidden'}

				<div class="swiper-slide !w-[140px]">
					<div
						class="{colors.bg} {colors.border} border-[3px] rounded-xl p-4 flex-shrink-0 transition-all hover:shadow-lg h-full relative"
					>
						<!-- Status Badge -->
						{#if badgeText}
							<div
								class="absolute -top-2 -right-2 {badgeColor} rounded-full w-12 h-6 flex items-center justify-center text-xs font-bold shadow-md"
							>
								{badgeText}
							</div>
						{/if}

						<!-- Date -->
						<div class="text-center mb-3">
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{day.date.getMonth() + 1}/{day.date.getDate()}
							</p>
							<p class="text-xs text-gray-500">
								{['일', '월', '화', '수', '목', '금', '토'][day.date.getDay()]}
							</p>
						</div>

						<!-- Weather Icon -->
						<div class="text-center mb-3">
							<i class="{colors.icon} text-4xl {colors.text}"></i>
						</div>

						<!-- Event Count -->
						<div class="text-center">
							{#if day.events.length > 0}
								<p class="text-xs text-gray-600 dark:text-gray-400 mb-1">이벤트</p>
								<p class="text-lg font-bold {colors.text}">{day.events.length}개</p>
							{:else}
								<p class="text-xs text-gray-500">평온</p>
							{/if}
						</div>

						<!-- Event Names (if any) -->
						{#if day.events.length > 0}
							<div class="mt-3 pt-3 border-t {colors.border}">
								{#each day.events.slice(0, 2) as event}
									<p class="text-xs {colors.text} truncate" title={event.name}>
										{event.type === 'GACHA' ? '🎁' : '📅'}
										{event.name.substring(0, 10)}{event.name.length > 10 ? '...' : ''}
									</p>
								{/each}
								{#if day.events.length > 2}
									<p class="text-xs text-gray-500">+{day.events.length - 2}개 더</p>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
