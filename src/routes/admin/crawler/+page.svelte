<script lang="ts">
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
	import AdminCrawlerStatus from '../../../app/view/admin/crawler/AdminCrawlerStatus.svelte';
	import AdminCrawlerLogs from '../../../app/view/admin/crawler/AdminCrawlerLogs.svelte';
	import AdminPendingData from '../../../app/view/admin/crawler/AdminPendingData.svelte';
	import AdminDataGaps from '../../../app/view/admin/crawler/AdminDataGaps.svelte';

	const { data } = $props<{ data: any }>();

	// 사이드바 토글 상태
	// 사이드바 토글 상태
	let sidebarStore = AdminSideMenuService.SidebarCollapsed;
	let isSidebarCollapsed = $derived($sidebarStore);
	let mainMargin = $derived(isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	// 탭 상태
	let activeTab = $state<'status' | 'logs' | 'pending' | 'gaps'>('status');
</script>

<main class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu
		title="크롤러/파서 관리"
		infoText="게임별 크롤러 상태를 모니터링하고, 수집된 데이터를 검토합니다."
	/>

	<!-- 탭 네비게이션 -->
	<div class="mb-6 border-b border-gray-200">
		<nav class="-mb-px flex space-x-8">
			<button
				class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
				'status'
					? 'border-orange-500 text-orange-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				onclick={() => (activeTab = 'status')}
			>
				<i class="ri-dashboard-line mr-2"></i>
				크롤러 상태
			</button>
			<button
				class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
				'logs'
					? 'border-orange-500 text-orange-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				onclick={() => (activeTab = 'logs')}
			>
				<i class="ri-file-list-line mr-2"></i>
				실행 로그
			</button>
			<button
				class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
				'pending'
					? 'border-orange-500 text-orange-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				onclick={() => (activeTab = 'pending')}
			>
				<i class="ri-eye-line mr-2"></i>
				검토 대기
				<span class="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">3</span>
			</button>
			<button
				class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab ===
				'gaps'
					? 'border-orange-500 text-orange-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				onclick={() => (activeTab = 'gaps')}
			>
				<i class="ri-error-warning-line mr-2"></i>
				데이터 공백
			</button>
		</nav>
	</div>

	<!-- 탭 컨텐츠 -->
	<div class="mt-6">
		{#if activeTab === 'status'}
			<AdminCrawlerStatus gameList={data.gameList} />
		{:else if activeTab === 'logs'}
			<AdminCrawlerLogs gameList={data.gameList} />
		{:else if activeTab === 'pending'}
			<AdminPendingData />
		{:else if activeTab === 'gaps'}
			<AdminDataGaps />
		{/if}
	</div>
</main>
