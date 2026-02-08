<script lang="ts">
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
	import AdminEventList from '../../../app/view/admin/event/AdminEventList.svelte';

	const { data } = $props<{ data: any }>();

	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 너비 상태 감시
	let mainMargin = $derived($isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');
</script>

<main class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu
		title="이벤트/캘린더 관리"
		infoText="게임별 가챠 배너 및 이벤트 일정을 관리합니다."
	/>
	<AdminEventList {data} />
</main>
