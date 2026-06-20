<script lang="ts">
	import { onMount } from 'svelte';
	import client from '../../service/api/client';
	import { toastStore } from '../../service/ToastService';
	import AdminContentCompleteness from './AdminContentCompleteness.svelte';
	import AdminVisitorChart from './AdminVisitorChart.svelte';
	import AdminSearchAnalysis from './AdminSearchAnalysis.svelte';

	interface DashboardSummary {
		games: number;
		characters: number;
		items: number;
		events: number;
		users: number;
		pendingEvents: number;
	}

	interface AuditLog {
		action: string;
		details: { summary?: string } | null;
		createdAt: string;
		user: { email: string; name: string | null } | null;
	}

	let summaryData: DashboardSummary | null = $state(null);
	let auditLogs: AuditLog[] = $state([]);
	let loadingStats = $state(true);
	let loadingLogs = $state(true);

	let statCards = $derived.by(() => {
		if (!summaryData) return [];
		return [
			{
				label: '전체 게임',
				value: summaryData.games,
				icon: 'ri-gamepad-line',
				color: 'text-indigo-600',
				bg: 'bg-indigo-50'
			},
			{
				label: '전체 캐릭터',
				value: summaryData.characters,
				icon: 'ri-group-line',
				color: 'text-purple-600',
				bg: 'bg-purple-50'
			},
			{
				label: '전체 아이템',
				value: summaryData.items,
				icon: 'ri-sword-line',
				color: 'text-blue-600',
				bg: 'bg-blue-50'
			},
			{
				label: '전체 이벤트',
				value: summaryData.events,
				icon: 'ri-calendar-event-line',
				color: 'text-orange-600',
				bg: 'bg-orange-50'
			},
			{
				label: '검토 대기',
				value: summaryData.pendingEvents,
				icon: 'ri-time-line',
				color: 'text-red-600',
				bg: 'bg-red-50'
			}
		];
	});

	onMount(async () => {
		const [summaryRes, auditRes] = await Promise.allSettled([
			client.get('/api/v0/admin/dashboard/summary'),
			client.get('/api/v0/admin/audit-log', { params: { page: 1, limit: 10 } })
		]);

		if (summaryRes.status === 'fulfilled') {
			const resp = summaryRes.value;
			if (resp.data.resultCode === 200) {
				summaryData = resp.data.data;
			} else {
				toastStore.error('통계를 불러오지 못했습니다.');
			}
		} else {
			toastStore.error('통계를 불러오지 못했습니다.');
		}
		loadingStats = false;

		if (auditRes.status === 'fulfilled') {
			const resp = auditRes.value;
			if (resp.data.resultCode === 200) {
				auditLogs = resp.data.data.logs;
			} else {
				toastStore.error('활동 로그를 불러오지 못했습니다.');
			}
		} else {
			toastStore.error('활동 로그를 불러오지 못했습니다.');
		}
		loadingLogs = false;
	});

	function relativeTime(dateString: string): string {
		const diff = Date.now() - new Date(dateString).getTime();
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return '방금 전';
		if (minutes < 60) return `${minutes}분 전`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}시간 전`;
		const days = Math.floor(hours / 24);
		return `${days}일 전`;
	}

	function logLabel(log: AuditLog): string {
		if (log.details?.summary) return log.details.summary;
		return log.action;
	}

	function logUser(log: AuditLog): string {
		if (!log.user) return 'System';
		return log.user.name || log.user.email;
	}

	function logInitial(log: AuditLog): string {
		const u = logUser(log);
		return u[0]?.toUpperCase() ?? '?';
	}
</script>

<article class="space-y-8 pb-12">
	<!-- 헤더 섹션 -->
	<header class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-gray-900">대시보드 개요</h2>
			<p class="text-sm text-gray-500">플랫폼의 현재 상태와 실시간 통계를 확인하세요.</p>
		</div>
	</header>

	<!-- 상단 요약 카드 -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
		{#if loadingStats}
			{#each Array(5) as _}
				<div
					class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
				>
					<div class="h-12 w-12 animate-pulse rounded-lg bg-gray-100"></div>
					<div class="flex-1 space-y-2">
						<div class="h-3 w-20 animate-pulse rounded bg-gray-100"></div>
						<div class="h-5 w-12 animate-pulse rounded bg-gray-100"></div>
					</div>
				</div>
			{/each}
		{:else}
			{#each statCards as stat}
				<div
					class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg {stat.bg} {stat.color}"
					>
						<i class="{stat.icon} text-xl"></i>
					</div>
					<div>
						<p class="text-xs font-medium text-gray-500">{stat.label}</p>
						<p class="mt-1 text-xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
					</div>
				</div>
			{/each}
		{/if}
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
					{#if loadingLogs}
						{#each Array(3) as _}
							<div class="flex items-center justify-between border-b border-gray-50 pb-4">
								<div class="flex items-center gap-3">
									<div class="h-8 w-8 animate-pulse rounded-full bg-gray-100"></div>
									<div class="space-y-1">
										<div class="h-3 w-40 animate-pulse rounded bg-gray-100"></div>
										<div class="h-3 w-20 animate-pulse rounded bg-gray-100"></div>
									</div>
								</div>
								<div class="h-3 w-12 animate-pulse rounded bg-gray-100"></div>
							</div>
						{/each}
					{:else if auditLogs.length === 0}
						<p class="py-8 text-center text-sm text-gray-400">활동 로그가 없습니다.</p>
					{:else}
						{#each auditLogs as log}
							<div
								class="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0"
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600"
									>
										{logInitial(log)}
									</div>
									<div>
										<p class="text-sm font-medium text-gray-800">{logLabel(log)}</p>
										<p class="text-xs text-gray-400">{logUser(log)}</p>
									</div>
								</div>
								<span class="text-xs text-gray-400">{relativeTime(log.createdAt)}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	article {
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
