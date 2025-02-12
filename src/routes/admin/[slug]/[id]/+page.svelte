<script lang="ts">
	import { AdminSideMenuService } from '../../../../app/service/AdminSiedMenuService';

	// 컴포넌트 관리
	import AdminHeadMenu from '../../../../app/view/menu/AdminHeadMenu.svelte';
	import AdminCharacterContent from '../../../../app/view/admin/content/AdminCharacterContent.svelte';

	// 모달 관리
	import DesktopModal from '../../../../app/view/modal/DesktopModal.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 너비 상태 감시
	let mainMargin = $derived($isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	$effect(() => {
		switch (data.slug) {
			case 'character':
				ContentComponent = AdminCharacterContent;
				ContentTitle = '캐릭터 정보';
				ContentInfoText = '캐릭터 정보 페이지 입니다.';
				break;

			default:
				ContentComponent = null;
				ContentTitle = '';
				ContentInfoText = '';
				break;
		}
	});

	let ContentComponent: any = $state();
	let ContentTitle = $state('');
	let ContentInfoText = $state('');

	console.log(data.info);
</script>

<div class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<DesktopModal />
	<!-- 상단 사용자 프로필 -->
	<AdminHeadMenu title={ContentTitle} infoText={ContentInfoText} />

	{#if ContentComponent}
		<svelte:component this={ContentComponent} {data} />
	{/if}
</div>
