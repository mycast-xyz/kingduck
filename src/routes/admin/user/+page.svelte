<script lang="ts">
	import { onMount } from 'svelte';
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';
	import { adminUserService, type User } from '../../../app/service/AdminUserService';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';

	// 사이드바 토글 상태
	let sidebarStore = AdminSideMenuService.SidebarCollapsed;
	let isSidebarCollapsed = $derived($sidebarStore);
	let mainMargin = $derived(isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	let keyword = '';
	let role = '';
	let currentPage = 1;
	const pageSize = 10;

	// Store subscriptions
	let users: User[] = [];
	let total = 0;

	onMount(() => {
		const unsubscribeUsers = adminUserService.users.subscribe((value) => {
			users = value;
		});
		const unsubscribeTotal = adminUserService.total.subscribe((value) => {
			total = value;
		});

		loadUsers();

		return () => {
			unsubscribeUsers();
			unsubscribeTotal();
		};
	});

	function loadUsers() {
		adminUserService.fetchUsers({
			page: currentPage,
			size: pageSize,
			keyword,
			role: role || undefined
		});
	}

	function handleSearch() {
		currentPage = 1;
		loadUsers();
	}

	function handlePageChange(newPage: number) {
		currentPage = newPage;
		loadUsers();
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<div class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu title="사용자 관리" infoText="플랫폼 사용자를 조회하고 상태를 관리합니다." />

	<div class="mt-8 rounded-xl bg-white p-6 shadow-sm">
		<!-- Search Filter -->
		<div class="mb-6 flex flex-wrap items-center gap-4">
			<div class="flex-1 min-w-[200px]">
				<div class="relative">
					<i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
					<input
						type="text"
						bind:value={keyword}
						class="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
						placeholder="이메일 또는 닉네임 검색"
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>
			</div>

			<select
				bind:value={role}
				class="rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
			>
				<option value="">모든 권한</option>
				<option value="USER">USER</option>
				<option value="MANAGER">MANAGER</option>
				<option value="ADMIN">ADMIN</option>
			</select>

			<button
				onclick={handleSearch}
				class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
			>
				검색
			</button>
		</div>

		<!-- Table -->
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-100 text-sm text-gray-500">
						<th class="px-4 py-3 font-medium">사용자</th>
						<th class="px-4 py-3 font-medium">이메일</th>
						<th class="px-4 py-3 font-medium">등급</th>
						<th class="px-4 py-3 font-medium">가입일</th>
						<th class="px-4 py-3 font-medium">상태</th>
						<th class="px-4 py-3 font-medium">관리</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each users as user}
						<tr class="group hover:bg-gray-50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									<img
										src={user.profileImage}
										alt={user.nickname}
										class="h-8 w-8 rounded-full bg-gray-100"
									/>
									<span class="font-medium text-gray-900">{user.nickname}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-sm text-gray-600">{user.email}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                    {user.role === 'ADMIN'
										? 'bg-purple-100 text-purple-800'
										: 'bg-gray-100 text-gray-800'}"
								>
									{user.role}
								</span>
							</td>
							<td class="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                    {user.status === 'ACTIVE'
										? 'bg-green-100 text-green-800'
										: user.status === 'BANNED'
											? 'bg-red-100 text-red-800'
											: 'bg-gray-100 text-gray-800'}"
								>
									{user.status}
								</span>
							</td>
							<td class="px-4 py-3">
								<a
									href="/admin/user/{user.id}"
									class="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
								>
									상세보기
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination (Simple) -->
		<div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
			<span class="text-sm text-gray-500">
				Total <span class="font-medium">{total}</span> users
			</span>
			<div class="flex gap-2">
				<button
					disabled={currentPage === 1}
					onclick={() => handlePageChange(currentPage - 1)}
					class="rounded px-3 py-1 text-sm border hover:bg-gray-50 disabled:opacity-50"
				>
					Prev
				</button>
				<span class="px-2 py-1 text-sm font-medium">{currentPage}</span>
				<button
					disabled={users.length < pageSize}
					onclick={() => handlePageChange(currentPage + 1)}
					class="rounded px-3 py-1 text-sm border hover:bg-gray-50 disabled:opacity-50"
				>
					Next
				</button>
			</div>
		</div>
	</div>
</div>
