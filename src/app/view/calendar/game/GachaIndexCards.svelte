<script lang="ts">
	import type { WeatherAlertAnalysis } from '../../../model/calendar/WeatherAlertCalculator';
	import type { CalendarEvent } from '../../../model/calendar/CalendarTypes';

	let { weatherAlert, events }: { weatherAlert: WeatherAlertAnalysis; events: CalendarEvent[] } =
		$props();

	const meta = $derived(weatherAlert.metadata);

	// Calculate indices
	const now = new Date();

	// 존버 권장 지수: 앞으로 7일간 픽업이 없는 날의 비율
	const hodlIndex = $derived(() => {
		const next7Days = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(now);
			date.setDate(date.getDate() + i);
			return date;
		});

		const peacefulDays = next7Days.filter((date) => {
			return !events.some((e) => {
				return e.type === 'GACHA' && e.startDate <= date && e.endDate >= date;
			});
		}).length;

		return Math.round((peacefulDays / 7) * 100);
	});

	// 지름 경고 지수: 현재 진행중인 픽업 비율
	const spendingWarningIndex = $derived(() => {
		if (meta.activePickups === 0) return 10;
		if (meta.activePickups >= 3) return 95;
		if (meta.activePickups >= 2) return 75;
		return 50;
	});

	// 복구 지수: 최근 점검/보상 여부
	const recoveryIndex = $derived(() => {
		if (meta.hasRecentUpdate) return 85;
		if (meta.activePickups === 0) return 60;
		return 25;
	});

	// Get badge class based on index value
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
</script>

<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-200">
	<h2 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">가챠 생활 지수</h2>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- 존버 권장 지수 -->
		<div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
			<i class="ri-time-line text-5xl text-blue-500 mb-3 block"></i>
			<h3 class="font-semibold mb-2 text-gray-800 dark:text-gray-200">존버 권장</h3>
			<p class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">{hodlIndex()}%</p>
			<span class="px-3 py-1 {getBadgeClass(hodlIndex())} rounded-full text-sm font-semibold">
				{getBadgeText(hodlIndex())}
			</span>
			<p class="text-xs text-gray-500 mt-3">
				7일간 평화로운 날: {Math.round((hodlIndex() / 100) * 7)}일
			</p>
		</div>

		<!-- 지름 경고 지수 -->
		<div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
			<i class="ri-alarm-warning-line text-5xl text-red-500 mb-3 block"></i>
			<h3 class="font-semibold mb-2 text-gray-800 dark:text-gray-200">지름 경고</h3>
			<p class="text-4xl font-bold text-red-600 dark:text-red-400 mb-3">
				{spendingWarningIndex()}%
			</p>
			<span
				class="px-3 py-1 {getBadgeClass(
					100 - spendingWarningIndex()
				)} rounded-full text-sm font-semibold"
			>
				{spendingWarningIndex() >= 70 ? '위험' : spendingWarningIndex() >= 40 ? '주의' : '안전'}
			</span>
			<p class="text-xs text-gray-500 mt-3">현재 진행중: {meta.activePickups}개</p>
		</div>

		<!-- 복구 지수 -->
		<div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
			<i class="ri-heart-pulse-line text-5xl text-green-500 mb-3 block"></i>
			<h3 class="font-semibold mb-2 text-gray-800 dark:text-gray-200">복구 지수</h3>
			<p class="text-4xl font-bold text-green-600 dark:text-green-400 mb-3">{recoveryIndex()}%</p>
			<span class="px-3 py-1 {getBadgeClass(recoveryIndex())} rounded-full text-sm font-semibold">
				{getBadgeText(recoveryIndex())}
			</span>
			<p class="text-xs text-gray-500 mt-3">
				{meta.hasRecentUpdate ? '최근 점검 있음' : '점검 예정 없음'}
			</p>
		</div>
	</div>
</div>
