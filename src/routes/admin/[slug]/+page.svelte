<script lang="ts">
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';

	// 컴포넌트 관리
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
	import AdminKanban from '../../../app/view/admin/AdminKanban.svelte';
	import AdminGameList from '../../../app/view/admin/list/AdminGameList.svelte';
	import AdminCharacterList from '../../../app/view/admin/list/AdminCharacterList.svelte';
	import AdminElementList from '../../../app/view/admin/list/AdminElementList.svelte';
	import AdminItemList from '../../../app/view/admin/list/AdminItemList.svelte';
	import AdminStats from '../../../app/view/admin/AdminStats.svelte';

	// 모달 관리
	import DesktopModal from '../../../app/view/modal/DesktopModal.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 너비 상태 감시
	let mainMargin = $derived($isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	$effect(() => {
		switch (data.slug) {
			case 'kanban':
				ContentComponent = AdminKanban;
				ContentTitle = '프로젝트 관리';
				ContentInfoText = '프로젝트 관리 페이지 입니다.';
				break;

			case 'game':
				ContentComponent = AdminGameList;
				ContentTitle = '게임 관리';
				ContentInfoText = '게임 관리 페이지 입니다.';
				break;

			case 'character':
				ContentComponent = AdminCharacterList;
				ContentTitle = '캐릭터 관리';
				ContentInfoText = '캐릭터 관리 페이지 입니다.';
				break;

			case 'type':
				ContentComponent = AdminElementList;
				ContentTitle = '속성/특성 아이콘 관리';
				ContentInfoText = '게임별 속성·특성 필터 아이콘을 업로드/관리합니다.';
				break;

			case 'item':
				ContentComponent = AdminItemList;
				ContentTitle = '아이템 관리';
				ContentInfoText = '게임별 아이템 정보를 추가/수정합니다.';
				break;

			case 'stats':
				ContentComponent = AdminStats;
				ContentTitle = '통계 분석';
				ContentInfoText = '방문자 추이, 검색 분석, 컨텐츠 완성도를 한눈에 확인합니다.';
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
</script>

<div class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<DesktopModal />
	<!-- 상단 사용자 프로필 -->
	<AdminHeadMenu title={ContentTitle} infoText={ContentInfoText} />

	{#if ContentComponent}
		<ContentComponent {data} />
	{/if}
</div>
