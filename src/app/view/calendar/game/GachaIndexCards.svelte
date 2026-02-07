<script lang="ts">
	import type { WeatherAlertAnalysis } from '../../../model/calendar/WeatherAlertCalculator';
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { weatherAlert, events }: { weatherAlert: WeatherAlertAnalysis; events: CalendarEvent[] } =
		$props();

	const meta = $derived(weatherAlert.metadata);
	const now = new Date();

	// 존버 권장 지수: 가챠 진행률 (높을수록 종료 임박 -> 존버 권장)
	const hodlIndex = $derived.by(() => {
		const activeGachas = events.filter(
			(e) => e.type === 'GACHA' && e.startDate <= now && e.endDate >= now
		);

		if (activeGachas.length === 0) return 100;

		const maxProgress = Math.max(
			...activeGachas.map((g) => {
				const total = g.endDate.getTime() - g.startDate.getTime();
				const elapsed = now.getTime() - g.startDate.getTime();
				if (total <= 0) return 100;
				return (elapsed / total) * 100;
			})
		);

		return Math.round(Math.min(100, Math.max(0, maxProgress)));
	});

	// 지름 경고 지수: 현재 진행중인 픽업 비율
	const spendingWarningIndex = $derived.by(() => {
		if (meta.activePickups === 0) return 10;
		if (meta.activePickups >= 3) return 95;
		if (meta.activePickups >= 2) return 75;
		return 50;
	});

	// 장기 이벤트 포함 여부 (기본: 제외)
	let includeLongTermEvents = $state(false);

	// 폐지 수집 지수 (노동 강도): 현재 진행중인 이벤트 수
	const activeEvents = $derived(
		events.filter((e) => {
			if (e.type !== 'EVENT') return false;
			const isActive = e.startDate <= now && e.endDate >= now;
			if (!isActive) return false;

			// 장기 이벤트 필터링 (42일 이상 - 6주)
			const durationDays = (e.endDate.getTime() - e.startDate.getTime()) / (1000 * 60 * 60 * 24);
			if (!includeLongTermEvents && durationDays >= 42) return false;

			return true;
		})
	);

	const activeEventsCount = $derived(activeEvents.length);

	const scrapCollectionParams = $derived.by(() => {
		if (activeEventsCount >= 3)
			return {
				status: '폭우',
				desc: '쉼 없는 노동',
				icon: 'ri-thunderstorms-line',
				color: 'text-red-600 dark:text-red-400',
				bg: 'bg-red-100 dark:bg-red-900'
			};
		if (activeEventsCount >= 1)
			return {
				status: '잔잔함',
				desc: '분재 모드',
				icon: 'ri-plant-line',
				color: 'text-green-600 dark:text-green-400',
				bg: 'bg-green-100 dark:bg-green-900'
			};
		return {
			status: '가뭄',
			desc: '할 거 없음',
			icon: 'ri-sun-line',
			color: 'text-yellow-600 dark:text-yellow-400',
			bg: 'bg-yellow-100 dark:bg-yellow-900'
		};
	});

	// 복구 지수
	const recoveryIndex = $derived.by(() => {
		if (meta.hasRecentUpdate) return 85;
		if (meta.activePickups === 0) return 60;
		return 25;
	});

	// 종합 가챠 불쾌지수
	const discomfortParams = $derived.by(() => {
		let score = 0;
		score += Math.min(meta.activePickups * 20, 60);
		score += Math.min(activeEventsCount * 10, 30);
		if (!meta.hasRecentUpdate) score += 10;

		if (score >= 80)
			return {
				level: '매우 높음',
				desc: '폭염+가뭄+강풍! 최악의 불쾌감',
				emoji: '🤬',
				color: 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-400'
			};
		if (score >= 60)
			return {
				level: '높음',
				desc: '성능캐 몰려오는데 재화는 부족',
				emoji: '😡',
				color: 'text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-400'
			};
		if (score >= 40)
			return {
				level: '보통',
				desc: '적당한 긴장감과 숙제량',
				emoji: '😐',
				color: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400'
			};
		if (score >= 20)
			return {
				level: '낮음',
				desc: '재화 넉넉, 할 것도 적당함',
				emoji: '🙂',
				color: 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-400'
			};
		return {
			level: '매우 낮음',
			desc: '모든 것이 평화로운 상태',
			emoji: '🥰',
			color: 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-400'
		};
	});

	function getBadgeClass(value: number): string {
		if (value >= 70) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
		if (value >= 40) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
		return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
	}

	function getBadgeText(value: number): string {
		if (value >= 70) return '좋음';
		if (value >= 40) return '보통';
		return '나쁨';
	}

	// 존버 권장 지수 전용 배지 텍스트
	function getHodlBadgeText(value: number): string {
		if (value >= 80) return '존버 필수'; // 80% 이상 진행 -> 곧 끝남 -> 참아라
		if (value >= 40) return '고민 단계'; // 중간 -> 애매함
		return '탑승 기회'; // 초반 -> 뽑으려면 지금
	}

	function getHodlBadgeClass(value: number): string {
		if (value >= 80) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'; // Calm/Wait
		if (value >= 40) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
		return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'; // Action/Hot
	}
</script>

<div
	class="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-200 mb-8 dark:border-gray-600"
>
	<!-- 종합 불쾌지수 배너 -->
	<div
		class="mb-4 -mx-6 -mt-6 p-4 rounded-xl rounded-b-none {discomfortParams.color} flex items-center justify-between shadow-sm"
	>
		<div class="">
			<h3 class="font-bold text-lg gap-4">
				종합가챠 불쾌지수
				<div class="text-4xl flex">
					{discomfortParams.level}
				</div>
			</h3>
		</div>
		<div class="text-4xl ml-auto text-right">
			{discomfortParams.emoji}
			<p class="opacity-90 text-sm pt-2">{discomfortParams.desc}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
		<!-- 존버 권장 지수 -->
		<div
			class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
		>
			<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
				<i class="ri-time-line text-8xl text-blue-500"></i>
			</div>
			<div class="flex gap-4">
				<div class="flex flex-col">
					<i class="ri-history-line text-4xl text-blue-500 mb-2 block mt-1"></i>

					<span
						class="px-2 py-1 {getHodlBadgeClass(
							hodlIndex
						)} rounded-md text-xs font-semibold mt-auto"
					>
						{getHodlBadgeText(hodlIndex)}
					</span>
				</div>
				<div class=" text-right ml-auto mt-5">
					<h3 class="font-semibold mb-1 text-gray-800 dark:text-gray-200">존버 권장</h3>
					<p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{hodlIndex}%</p>
					<p class="text-xs text-gray-500 mt-2">
						현재 픽업 진행률: {hodlIndex}%
					</p>
				</div>
			</div>
		</div>

		<!-- 지름 경고 지수 -->
		<div
			class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
		>
			<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
				<i class="ri-alarm-warning-line text-8xl text-red-500"></i>
			</div>
			<div class="flex gap-4">
				<div class="flex flex-col">
					<i class="ri-fire-line text-4xl text-red-500 mb-2 block mt-1"></i>

					<span
						class="px-2 py-1 {getBadgeClass(
							100 - spendingWarningIndex
						)} rounded-md text-xs font-semibold mt-auto"
					>
						{spendingWarningIndex >= 70 ? '위험' : spendingWarningIndex >= 40 ? '주의' : '안전'}
					</span>
				</div>
				<div class=" text-right ml-auto mt-5">
					<h3 class="font-semibold mb-1 text-gray-800 dark:text-gray-200">지름 경고</h3>
					<p class="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
						{spendingWarningIndex}%
					</p>
					<p class="text-xs text-gray-500 mt-2">현재 픽업: {meta.activePickups}개</p>
				</div>
			</div>
		</div>

		<!-- 폐지 수집 지수 -->
		<div
			class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
		>
			<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
				<i class="{scrapCollectionParams.icon} text-8xl {scrapCollectionParams.color}"></i>
			</div>
			<div class="flex gap-4 relative z-10 w-full">
				<div class="flex flex-col">
					<i class="ri-recycle-line text-4xl {scrapCollectionParams.color} mb-2 block mt-1"></i>

					<span
						class="px-2 py-1 {scrapCollectionParams.bg} {scrapCollectionParams.color} rounded-md text-xs font-semibold mt-auto"
					>
						{scrapCollectionParams.desc}
					</span>
					<label
						class="relative inline-flex items-center cursor-pointer group/tooltip scale-90 origin-right mt-3"
					>
						<input type="checkbox" bind:checked={includeLongTermEvents} class="sr-only peer" />
						<div
							class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
						></div>
						<span
							class="ml-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none whitespace-nowrap"
							>장기 포함</span
						>

						<!-- Tooltip -->
						<div
							class="absolute bottom-full right-0 mb-2 w-32 hidden group-hover/tooltip:block bg-gray-800 text-white text-xs rounded p-2 text-center z-50"
						>
							42일(6주) 이상 진행되는 장기 이벤트를 포함합니다.
						</div>
					</label>
				</div>
				<div class=" text-right ml-auto mt-5 flex-1 flex flex-col items-end">
					<h3 class="font-semibold mb-1 text-gray-800 dark:text-gray-200">폐지 수집</h3>

					<p class="text-3xl font-bold {scrapCollectionParams.color} mb-2">
						{scrapCollectionParams.status}
					</p>

					<div class="mt-auto pt-2 flex flex-col items-end gap-1">
						<p class="text-xs text-gray-400">이벤트: {activeEventsCount}개</p>
					</div>
				</div>
			</div>
		</div>

		<!-- 복구 지수 -->
		<div
			class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
		>
			<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
				<i class="ri-heart-pulse-line text-8xl text-green-500"></i>
			</div>
			<div class="flex gap-4">
				<div class="flex flex-col">
					<i class="ri-first-aid-kit-line text-4xl text-green-500 mb-2 block mt-1"></i>

					<span
						class="px-2 py-1 {getBadgeClass(
							recoveryIndex
						)} rounded-md text-xs font-semibold mt-auto"
					>
						{getBadgeText(recoveryIndex)}
					</span>
				</div>
				<div class=" text-right ml-auto mt-5">
					<h3 class="font-semibold mb-1 text-gray-800 dark:text-gray-200">복구 지수</h3>
					<p class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
						{recoveryIndex}%
					</p>
					<p class="text-xs text-gray-500 mt-2">
						{meta.hasRecentUpdate ? '최근 점검 있음' : '점검 예정 없음'}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
