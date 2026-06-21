<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		adminUserService,
		type User,
		type UserLog
	} from '../../../../app/service/AdminUserService';
	import AdminHeadMenu from '../../../../app/view/menu/AdminHeadMenu.svelte';

	let userId = '';
	let user: User | null = null;
	let userLogs: UserLog[] = [];
	let isProcessing = false;
	let selectedRole = '';

	onMount(() => {
		userId = $page.params.id ?? '';

		const unsubscribeUser = adminUserService.currentUser.subscribe((value) => {
			user = value;
			if (user) selectedRole = user.role;
		});

		const unsubscribeLogs = adminUserService.userLogs.subscribe((value) => {
			userLogs = value;
		});

		if (userId) {
			adminUserService.fetchUserDetail(userId);
			adminUserService.fetchUserLogs(parseInt(userId) || 0); // Assuming ID is number for logs
		}

		return () => {
			unsubscribeUser();
			unsubscribeLogs();
		};
	});

	function formatDate(dateString: string) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleString();
	}

	async function handleStatusChange(newStatus: 'ACTIVE' | 'BANNED') {
		if (!user || !confidenceCheck(newStatus)) return;

		isProcessing = true;
		const success = await adminUserService.updateUserStatus(user.id.toString(), newStatus);

		if (success) {
			await adminUserService.fetchUserDetail(user.id.toString());
			alert(`사용자 상태가 ${newStatus}로 변경되었습니다.`);
		} else {
			alert('상태 변경에 실패했습니다.');
		}
		isProcessing = false;
	}

	async function handleRoleChange() {
		if (
			!user ||
			user.role === selectedRole ||
			!confirm(`권한을 ${selectedRole}로 변경하시겠습니까?`)
		)
			return;

		isProcessing = true;
		// @ts-ignore
		const success = await adminUserService.updateUserRole(user.id, selectedRole);

		if (success) {
			await adminUserService.fetchUserDetail(user.id.toString());
			alert('권한이 변경되었습니다.');
		} else {
			alert('권한 변경에 실패했습니다.');
			selectedRole = user.role; // Reset
		}
		isProcessing = false;
	}

	function confidenceCheck(status: string) {
		if (status === 'BANNED') {
			return confirm('정말로 이 사용자를 정지시키겠습니까?');
		}
		return true;
	}
</script>

<div class="ml-64 min-h-screen flex-1 bg-gray-100 p-8">
	<div class="mb-6 flex items-center gap-4">
		<a
			href="/admin/user"
			aria-label="사용자 목록으로 돌아가기"
			class="rounded-full bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 shadow-sm transition-colors"
		>
			<i class="ri-arrow-left-line text-xl"></i>
		</a>
		<AdminHeadMenu title="사용자 상세 정보" infoText="회원의 상세 정보를 조회하고 관리합니다." />
	</div>

	{#if user}
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left Column: Profile Card -->
			<div>
				<div class="rounded-xl bg-white p-6 shadow-sm text-center">
					<div class="relative mx-auto mb-4 h-32 w-32">
						<img
							src={user.profileImage}
							alt={user.nickname}
							class="h-full w-full rounded-full border-4 border-gray-50 object-cover"
						/>
						<div
							class="absolute bottom-2 right-2 rounded-full border-2 border-white bg-green-500 p-1.5"
							class:bg-green-500={user.status === 'ACTIVE'}
							class:bg-red-500={user.status === 'BANNED'}
							class:bg-gray-400={user.status === 'WITHDRAWN'}
						></div>
					</div>

					<h2 class="text-xl font-bold text-gray-900">{user.nickname}</h2>
					<p class="text-sm text-gray-500">{user.email}</p>

					<div class="mt-6 flex flex-col items-center gap-2">
						<select
							bind:value={selectedRole}
							onchange={handleRoleChange}
							class="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
						>
							<option value="USER">USER</option>
							<option value="MANAGER">MANAGER</option>
							<option value="ADMIN">ADMIN</option>
						</select>

						<span
							class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
							class:bg-green-100={user.status === 'ACTIVE'}
							class:text-green-800={user.status === 'ACTIVE'}
							class:bg-red-100={user.status === 'BANNED'}
							class:text-red-800={user.status === 'BANNED'}
							class:bg-gray-100={user.status === 'WITHDRAWN'}
							class:text-gray-800={user.status === 'WITHDRAWN'}
						>
							{user.status}
						</span>
					</div>

					<div class="mt-8 border-t border-gray-100 pt-6">
						<h3 class="mb-4 font-semibold text-gray-900">관리자 작업</h3>
						<div class="flex flex-col gap-3">
							{#if user.status !== 'BANNED'}
								<button
									onclick={() => handleStatusChange('BANNED')}
									disabled={isProcessing}
									class="w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
								>
									<i class="ri-prohibited-line mr-2"></i> 계정 정지
								</button>
							{/if}
							{#if user.status === 'BANNED'}
								<button
									onclick={() => handleStatusChange('ACTIVE')}
									disabled={isProcessing}
									class="w-full rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100 disabled:opacity-50"
								>
									<i class="ri-checkbox-circle-line mr-2"></i> 정지 해제
								</button>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Details -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Basic Info -->
				<div class="rounded-xl bg-white p-6 shadow-sm">
					<h3 class="mb-4 text-lg font-bold text-gray-900">기본 정보</h3>
					<dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
						<div>
							<dt class="text-sm font-medium text-gray-500">회원 ID</dt>
							<dd class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">{user.id}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">가입일</dt>
							<dd class="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">최근 로그인</dt>
							<dd class="mt-1 text-sm text-gray-900">{formatDate(user.lastLoginAt)}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">소셜 연동</dt>
							<dd class="mt-1 text-sm text-gray-900">
								<span
									class="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
								>
									<i class="ri-google-fill"></i> Google
								</span>
							</dd>
						</div>
					</dl>
				</div>

				<!-- Activity Log -->
				<div class="rounded-xl bg-white p-6 shadow-sm">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-bold text-gray-900">활동 로그</h3>
						<span class="text-xs text-gray-400">최근 20건</span>
					</div>

					<div class="space-y-4">
						{#if userLogs.length > 0}
							{#each userLogs as log}
								<div class="flex gap-4 border-b border-gray-50 pb-4 last:border-0">
									<div class="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
									<div>
										<p class="text-sm text-gray-800">{log.action}</p>
										<p class="text-xs text-gray-500">{log.description}</p>
										<p class="text-xs text-gray-400">
											{formatDate(log.createdAt)} | {log.ipAddress}
										</p>
									</div>
								</div>
							{/each}
						{:else}
							<p class="text-center text-sm text-gray-500 py-4">활동 기록이 없습니다.</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex h-64 items-center justify-center">
			<div class="text-center text-gray-500">
				<i class="ri-loader-4-line text-3xl animate-spin block mb-2"></i>
				<p>사용자 정보를 불러오는 중...</p>
			</div>
		</div>
	{/if}
</div>
