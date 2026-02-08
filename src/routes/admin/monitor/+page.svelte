<script lang="ts">
	import AdminSystemSummary from '../../../app/view/admin/monitor/AdminSystemSummary.svelte';
	import AdminResourceChart from '../../../app/view/admin/monitor/AdminResourceChart.svelte';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
</script>

<div class="space-y-6 ml-64 min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu
		title="시스템 상태 모니터링"
		infoText="서버의 실시간 리소스 상태와 부하를 확인합니다."
	/>

	<AdminSystemSummary />
	<AdminResourceChart />
</div>
