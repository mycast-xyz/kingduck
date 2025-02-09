<script lang="ts">
	import { AdminSideMenuService } from '../../app/service/AdminSiedMenuService';
	import AdminHeadMenu from '../../app/view/menu/AdminHeadMenu.svelte';
	import AdminDashBoard from '../../app/view/admin/AdminDashBoard.svelte';

	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 너비 상태 감시
	let mainMargin = $derived($isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');
</script>

<main class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<!-- 상단 사용자 프로필 -->
	<AdminHeadMenu title="대시보드" infoText="KingDuck Admin 대시보드 페이지 입니다." />
	<!-- 상단 통계 카드 -->
	<AdminDashBoard />
</main>

<style lang="scss">
	#sidebar {
		&.hover {
			.collapsed-hidden {
				display: block;
			}
		}
		&.active {
			.collapsed-hidden {
				display: block;
			}
		}

		.collapsed-hidden {
			display: none;
		}
	}
	.dropdownMenu {
		&.active {
			.dropdownMenuContnet {
				display: block;
			}
		}
	}
</style>
