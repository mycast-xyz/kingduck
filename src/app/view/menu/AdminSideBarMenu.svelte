<script lang="ts">
	import { AdminSideMenuService } from '../../service/AdminSiedMenuService';

	// 사이드바 토글 상태
	let isSidebarCollapsed = $state(AdminSideMenuService.SidebarCollapsed);

	// 사이드바 토글 함수
	function toggleSidebar() {
		AdminSideMenuService.toggleSidebar();
	}
	// 드롭다운 활성화 상태
	let isDropdownActive = $state(false);

	// 드롭다운 토글 함수
	function dropdownButton() {
		isDropdownActive = !isDropdownActive;
	}

	// 사이드바 너비 상태 감시
	let sidebarWidth = $derived($isSidebarCollapsed.collapsed ? 'w-64' : 'w-20');
</script>

<!-- 사이드바 -->
<aside
	id="sidebar"
	class:active={$isSidebarCollapsed.collapsed}
	class:hover={$isSidebarCollapsed.hover}
	class="fixed left-0 top-0 h-full bg-white text-gray-400 {sidebarWidth} transition-all duration-300 hover:w-64"
	onmouseenter={() => AdminSideMenuService.hoverSidebar()}
	onmouseleave={() => AdminSideMenuService.hoverSidebar()}
>
	<div class="p-4">
		<div class="mb-8 flex items-center space-x-3">
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center space-x-3">
					<img src="/assets/logo/500.png" alt="Logo" class="h-8 w-8 rounded-full" />
					<span class="collapsed-hidden text-lg font-bold">KingDuck Admin</span>
				</div>
				<button
					class="collapsed-hidden text-gray-400 hover:text-gray-600"
					onclick={toggleSidebar}
					aria-label="메뉴 슬림화"
				>
					<i class="text-lg {$isSidebarCollapsed.icon}"></i>
				</button>
			</div>
		</div>

		<nav class="space-y-2">
			<a
				href="/admin/"
				class="flex items-center space-x-3 rounded-lg bg-orange-500 px-4 py-3 text-white transition-all duration-300"
			>
				<i class="ri-home-line"></i>
				<span class="collapsed-hidden">대시보드</span>
			</a>
			<a
				href="/admin/kanban"
				class="flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-200 hover:text-gray-500"
			>
				<i class="ri-todo-line"></i>

				<span class="collapsed-hidden">프로젝트 관리</span>
			</a>
			<a
				href="/admin/analytics"
				class="flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-200 hover:text-gray-500"
			>
				<i class="ri-calendar-schedule-line"></i>
				<span class="collapsed-hidden">캘린더</span>
			</a>
			<div class="dropdownMenu relative" class:active={isDropdownActive}>
				<button
					onclick={() => dropdownButton()}
					class="flex w-full items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-300 hover:bg-gray-200 hover:text-gray-500"
				>
					<i class="ri-database-2-line"></i>
					<span class="collapsed-hidden">데이터 관리</span>
					<i class="ri-arrow-down-s-line {isDropdownActive ? 'rotate-180' : ''} collapsed-hidden"
					></i>
				</button>
				<div
					class="dropdownMenuContnet hidden w-full rounded-lg bg-white font-normal text-gray-400 transition-all duration-300"
				>
					<a
						href="/admin/character"
						class="block rounded-lg px-4 py-3 pl-6 hover:bg-gray-200 hover:text-gray-500"
					>
						<i class="ri-circle-line mr-2 text-sm"></i>
						캐릭터
					</a>
					<a
						href="/admin/layouts/collapsed"
						class="block rounded-lg px-4 py-3 pl-6 hover:bg-gray-200 hover:text-gray-500"
					>
						<i class="ri-circle-line mr-2 text-sm"></i>
						아이템
					</a>
					<a
						href="/admin/game"
						class="block rounded-lg px-4 py-3 pl-6 hover:bg-gray-200 hover:text-gray-500"
					>
						<i class="ri-circle-line mr-2 text-sm"></i>
						게임
					</a>
					<a
						href="/admin/layouts/collapsed"
						class="block rounded-lg px-4 py-3 pl-6 hover:bg-gray-200 hover:text-gray-500"
					>
						<i class="ri-circle-line mr-2 text-sm"></i>
						타입
					</a>
				</div>
			</div>
			<a
				href="/admin/projects"
				class="flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-300 hover:bg-orange-500 hover:text-white"
			>
				<i class="ri-project-line"></i>
				<span class="collapsed-hidden">Projects</span>
			</a>
		</nav>
	</div>
</aside>

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
