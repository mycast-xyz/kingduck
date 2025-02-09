<script lang="ts">
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';

	// 컴포넌트 관리
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
	import AdminKanban from '../../../app/view/admin/AdminKanban.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 너비 상태 감시
	let mainMargin = $derived($isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	let ContentComponent = $state();
	let ContentTitle = $state('');
	let ContentInfoText = $state('');

	switch (data.slug) {
		case 'kanban':
			ContentComponent = AdminKanban;
			ContentTitle = '프로젝트 관리';
			ContentInfoText = '프로젝트 관리 페이지 입니다.';
			break;
		default:
			ContentTitle = '';
			ContentInfoText = '';
			break;
	}
</script>

<div class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<!-- 상단 사용자 프로필 -->
	<AdminHeadMenu title={ContentTitle} infoText={ContentInfoText} />
	<ContentComponent />
</div>
