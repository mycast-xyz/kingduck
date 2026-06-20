<script lang="ts">
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
	import AdminTeamList from '../../../app/view/admin/team/AdminTeamList.svelte';
	import DesktopModal from '../../../app/view/modal/DesktopModal.svelte';

	const { data } = $props<{ data: any }>();

	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 너비에 따른 본문 마진
	let mainMargin = $derived($isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');
</script>

<main class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu
		title="팀 추천 관리"
		infoText="게임별 팀빌드 추천 정보를 관리합니다."
	/>
	<AdminTeamList {data} />
</main>

<DesktopModal />
