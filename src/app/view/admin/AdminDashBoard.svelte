<script lang="ts">
	import { onMount } from 'svelte';
	import AdminContentCompleteness from './AdminContentCompleteness.svelte';
	import AdminVisitorChart from './AdminVisitorChart.svelte';
	import AdminSearchAnalysis from './AdminSearchAnalysis.svelte';

	// 상위 요약 데이터
	let summaryStats = [
		{
			label: '오늘의 방문자',
			value: '1,284',
			growth: '+12.5%',
			icon: 'ri-user-follow-line',
			color: 'text-blue-600',
			bg: 'bg-blue-50'
		},
		{
			label: '전체 캐릭터',
			value: '248',
			growth: '+3',
			icon: 'ri-group-line',
			color: 'text-purple-600',
			bg: 'bg-purple-50'
		},
		{
			label: '활성 이벤트',
			value: '12',
			growth: '-2',
			icon: 'ri-calendar-event-line',
			color: 'text-orange-600',
			bg: 'bg-orange-50'
		},
		{
			label: '데이터 완료율',
			value: '84.2%',
			growth: '+1.4%',
			icon: 'ri-checkbox-circle-line',
			color: 'text-green-600',
			bg: 'bg-green-50'
		}
	];

	// 최근 활동 로그 (예시)
	let recentLogs = [
		{ user: 'Admin', action: '스타레일 신규 캐릭터 "반디" 추가', time: '10분 전' },
		{ user: 'System', action: '역전 1999 크롤링 완료', time: '1시간 전' },
		{ user: 'Editor_K', action: '명조 이벤트 일정 수정', time: '3시간 전' }
	];
</script>

<article class="space-y-8 pb-12">
	<!-- 헤더 섹션 -->
	<header class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">대시보드 개요</h2>
			<p class="text-sm text-gray-500">플랫폼의 현재 상태와 실시간 통계를 확인하세요.</p>
		</div>
		<div class="flex gap-2">
			<button
				class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				<i class="ri-download-2-line"></i> 보고서 다운로드
			</button>
		</div>
	</header>

	<!-- 상단 요약 카드 -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each summaryStats as stat}
			<div
				class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-lg {stat.bg} {stat.color}">
					<i class="{stat.icon} text-xl"></i>
				</div>
				<div>
					<p class="text-xs font-medium text-gray-500">{stat.label}</p>
					<div class="mt-1 flex items-baseline gap-2">
						<span class="text-xl font-bold text-gray-900">{stat.value}</span>
						<span
							class="text-xs font-bold {stat.growth.startsWith('+')
								? 'text-green-500'
								: 'text-red-500'}"
						>
							{stat.growth}
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- 중간 섹션: 방문자 추이 & 컨텐츠 완성도 -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<AdminVisitorChart />
		</div>
		<div>
			<AdminContentCompleteness />
		</div>
	</div>

	<!-- 하단 섹션: 검색 분석 & 최근 활동 -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<div>
			<AdminSearchAnalysis />
		</div>
		<div class="lg:col-span-2">
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h3 class="mb-6 text-lg font-bold text-gray-800">최근 시스템 활동</h3>
				<div class="space-y-4">
					{#each recentLogs as log}
						<div
							class="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
						>
							<div class="flex items-center gap-3">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600"
								>
									{log.user[0]}
								</div>
								<div>
									<p class="text-sm font-medium text-gray-800">{log.action}</p>
									<p class="text-xs text-gray-400">{log.user}</p>
								</div>
							</div>
							<span class="text-xs text-gray-400">{log.time}</span>
						</div>
					{/each}
				</div>
				<button
					class="mt-6 w-full rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
				>
					활동 로그 전체 보기
				</button>
			</div>
		</div>
	</div>
</article>

<style>
	:global(article) {
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
