<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { adminStatsService, type SystemStats } from '../../../service/AdminStatsService';

	// 차트 설정
	const MAX_DATA_POINTS = 60; // 60초 (1분) 데이터 유지
	const CHART_HEIGHT = 200;
	const CHART_WIDTH = 600;

	// 데이터 저장소
	let cpuHistory: number[] = new Array(MAX_DATA_POINTS).fill(0);
	let memoryHistory: number[] = new Array(MAX_DATA_POINTS).fill(0);
	let currentStats: SystemStats | null = null;
	let timer: any;

	// 데이터 갱신 및 히스토리 관리
	function updateHistory(stats: SystemStats) {
		currentStats = stats;

		cpuHistory = [...cpuHistory.slice(1), stats.cpuLoad.currentLoad];
		memoryHistory = [...memoryHistory.slice(1), stats.memory.usePercentage];
	}

	// SVG Path 생성 함수 (Line Chart)
	function createPath(data: number[], color: string) {
		if (data.length === 0) return '';

		const stepX = CHART_WIDTH / (MAX_DATA_POINTS - 1);

		// 0~100 사이 값을 차트 높이에 맞게 매핑 (100 -> 0, 0 -> CHART_HEIGHT)
		const points = data.map((val, index) => {
			const x = index * stepX;
			const y = CHART_HEIGHT - (val / 100) * CHART_HEIGHT;
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	}

	// 영역 채우기용 Path (Area Chart)
	function createAreaPath(data: number[]) {
		if (data.length === 0) return '';
		const linePath = createPath(data, '');
		return `${linePath} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`;
	}

	onMount(() => {
		// 초기 데이터 로드 및 구독 설정
		// Store 구독 대신 주기적인 polling을 여기서 수행하거나, 서비스에서 polling을 하고 여기서는 구독만 할 수도 있음.
		// AdminStatsService가 polling 기능이 없으므로 여기서 주기적으로 fetch 호출

		const fetchAndExit = async () => {
			await adminStatsService.fetchSystemStats();
			const stats = get(adminStatsService.systemStats);
			if (stats) updateHistory(stats);
		};

		// 초기 실행
		fetchAndExit();

		// 2초마다 갱신
		timer = setInterval(fetchAndExit, 2000);

		return () => {
			if (timer) clearInterval(timer);
		};
	});
</script>

<div
	class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<h3
		class="mb-4 flex items-center justify-between text-lg font-bold text-gray-800 dark:text-gray-100"
	>
		<span class="flex items-center gap-2"
			><i class="ri-pulse-line text-red-500"></i> 실시간 리소스 모니터링</span
		>
		{#if currentStats}
			<span class="text-xs font-normal text-gray-500"
				>Last update: {new Date(currentStats.timestamp).toLocaleTimeString()}</span
			>
		{/if}
	</h3>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- CPU Chart -->
		<div class="relative">
			<h4 class="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300 flex justify-between">
				<span>CPU Load</span>
				<span class="text-blue-600 dark:text-blue-400"
					>{currentStats?.cpuLoad.currentLoad.toFixed(1)}%</span
				>
			</h4>
			<div
				class="relative h-[200px] w-full overflow-hidden rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50"
			>
				<!-- SVG Chart -->
				<svg
					viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
					class="h-full w-full"
					preserveAspectRatio="none"
				>
					<!-- Grid Lines -->
					{#each [0, 25, 50, 75, 100] as tick}
						<line
							x1="0"
							y1={CHART_HEIGHT - (tick / 100) * CHART_HEIGHT}
							x2={CHART_WIDTH}
							y2={CHART_HEIGHT - (tick / 100) * CHART_HEIGHT}
							stroke="#e5e7eb"
							stroke-width="1"
							opacity="0.5"
						/>
					{/each}

					<!-- Area -->
					<path d={createAreaPath(cpuHistory)} fill="rgba(59, 130, 246, 0.1)" />
					<!-- Line -->
					<path
						d={createPath(cpuHistory, '')}
						fill="none"
						stroke="#3b82f6"
						stroke-width="2"
						vector-effect="non-scaling-stroke"
					/>
				</svg>
			</div>
		</div>

		<!-- Memory Chart -->
		<div class="relative">
			<h4 class="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300 flex justify-between">
				<span>Memory Usage</span>
				<span class="text-purple-600 dark:text-purple-400"
					>{currentStats?.memory.usePercentage.toFixed(1)}%</span
				>
			</h4>
			<div
				class="relative h-[200px] w-full overflow-hidden rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50"
			>
				<!-- SVG Chart -->
				<svg
					viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
					class="h-full w-full"
					preserveAspectRatio="none"
				>
					<!-- Grid Lines -->
					{#each [0, 25, 50, 75, 100] as tick}
						<line
							x1="0"
							y1={CHART_HEIGHT - (tick / 100) * CHART_HEIGHT}
							x2={CHART_WIDTH}
							y2={CHART_HEIGHT - (tick / 100) * CHART_HEIGHT}
							stroke="#e5e7eb"
							stroke-width="1"
							opacity="0.5"
						/>
					{/each}

					<!-- Area -->
					<path d={createAreaPath(memoryHistory)} fill="rgba(147, 51, 234, 0.1)" />
					<!-- Line -->
					<path
						d={createPath(memoryHistory, '')}
						fill="none"
						stroke="#9333ea"
						stroke-width="2"
						vector-effect="non-scaling-stroke"
					/>
				</svg>
			</div>
		</div>
	</div>

	<!-- Network & Process Process Info (Text based) -->
	{#if currentStats}
		<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
			<div class="rounded bg-gray-50 p-3 dark:bg-gray-700/30">
				<p class="text-gray-500 dark:text-gray-400">Network ({currentStats.network.iface})</p>
				<div class="flex gap-4 mt-1">
					<span class="font-medium text-green-600"
						>▼ {(currentStats.network.rx_sec / 1024).toFixed(1)} KB/s</span
					>
					<span class="font-medium text-orange-600"
						>▲ {(currentStats.network.tx_sec / 1024).toFixed(1)} KB/s</span
					>
				</div>
			</div>
			<div class="rounded bg-gray-50 p-3 dark:bg-gray-700/30">
				<p class="text-gray-500 dark:text-gray-400">Process Memory</p>
				<div class="flex gap-4 mt-1">
					<span class="font-medium text-gray-700 dark:text-gray-300"
						>Heap: {(currentStats.process.memory.heapUsed / 1024 / 1024).toFixed(0)} MB</span
					>
					<span class="font-medium text-gray-700 dark:text-gray-300"
						>RSS: {(currentStats.process.memory.rss / 1024 / 1024).toFixed(0)} MB</span
					>
				</div>
			</div>
		</div>
	{/if}
</div>
