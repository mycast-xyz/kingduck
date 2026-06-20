<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	interface RedeemGroup {
		id: number | string;
		gameId: number | string;
		title: string;
		periodText?: string;
		startTime?: string;
		endTime?: string;
		game?: { id: number | string; name: string; slug: string };
		_count?: { codes: number };
	}

	const { data } = $props<{ data: any }>();

	let groupList: RedeemGroup[] = $state([]);
	let gameList: any[] = $state([]);

	// 페이지네이션 상태
	let itemsPerPage = $state(10);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);

	// 필터 상태
	let selectedGame = $state($page.url.searchParams.get('gameId') || '');
	let searchTitle = $state($page.url.searchParams.get('title') || '');

	onMount(async () => {
		await getGameList();
		await loadData();
	});

	// 모달이 닫히면 목록을 다시 불러온다 (AdminEventList 패턴)
	const modalStore = WindowService.modal;
	let redeemModalWasOpen = false;
	$effect(() => {
		const open = $modalStore === 'admin-add-redeem';
		if (redeemModalWasOpen && !open) {
			loadData();
		}
		redeemModalWasOpen = open;
	});

	async function loadData() {
		await getGroupList(currentPage, itemsPerPage, selectedGame, searchTitle);
	}

	async function getGroupList(
		pageNum: number,
		limit: number,
		gameId?: string,
		title?: string
	) {
		try {
			const params: Record<string, any> = { page: pageNum, limit };
			if (gameId) params.gameId = gameId;
			if (title) params.title = title;

			const response = await client.get('/api/v0/admin/redeem/group/list', { params });
			if (response.data.resultCode === 200) {
				const d = response.data.data;
				groupList = d.groups;
				totalPages = d.totalPages;
				totalItems = d.total;
				currentPage = d.page;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('쿠폰 그룹 목록 조회 중 오류 발생:', error);
		}
	}

	async function getGameList() {
		try {
			const response = await client.get('/api/v0/admin/game/list');
			if (response.data.resultCode === 200) {
				gameList = response.data.data;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('게임 목록 조회 중 오류 발생:', error);
		}
	}

	// 검색 수행
	function handleSearch() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	// 필터 변경
	function handleFilterChange() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	// 페이지 변경
	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadData();
	}

	// 페이지당 항목 수 변경
	function handleItemsPerPageChange(event: Event) {
		itemsPerPage = parseInt((event.target as HTMLSelectElement).value);
		currentPage = 1;
		loadData();
	}

	function updateUrl() {
		if (!browser) return;
		const url = new URL(window.location.href);
		if (selectedGame) url.searchParams.set('gameId', selectedGame);
		else url.searchParams.delete('gameId');
		if (searchTitle) url.searchParams.set('title', searchTitle);
		else url.searchParams.delete('title');
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	// 신규 그룹 추가
	function addNewGroup() {
		WindowService.openModal('admin-add-redeem');
	}

	// 그룹 편집
	function editGroup(group: RedeemGroup) {
		WindowService.openModal('admin-add-redeem', group);
	}

	// 그룹 삭제
	async function deleteGroup(groupId: number | string) {
		if (!confirm('정말로 이 쿠폰 그룹을 삭제하시겠습니까? 포함된 코드도 함께 삭제됩니다.')) return;

		try {
			const response = await client.delete(`/api/v0/admin/redeem/group/${groupId}`);
			if (response.data.resultCode === 200) {
				toastStore.success('쿠폰 그룹이 삭제되었습니다.');
				await loadData();
			} else {
				toastStore.error(response.data.resultMsg || '삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('쿠폰 그룹 삭제 중 오류 발생:', error);
			toastStore.error('쿠폰 그룹 삭제에 실패했습니다.');
		}
	}

	// 기간 표시: periodText 우선, 없으면 start~end
	function formatPeriod(group: RedeemGroup): string {
		if (group.periodText) return group.periodText;
		const start = group.startTime ? formatDate(group.startTime) : '';
		const end = group.endTime ? formatDate(group.endTime) : '';
		if (start && end) return `${start} ~ ${end}`;
		if (start) return `${start} ~`;
		return '-';
	}

	// 날짜 포맷팅
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}
</script>

<div class="mx-auto pb-4">
	<!-- 필터 및 검색 영역 -->
	<div class="mb-4 flex items-center gap-2">
		<!-- 제목 검색 -->
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchTitle}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder="그룹 제목 검색..."
					class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
				/>
				<button
					type="button"
					class="absolute right-5 top-2.5 text-gray-400 hover:text-gray-900"
					onclick={handleSearch}
					aria-label="검색"
				>
					<i class="ri-search-line text-lg"></i>
				</button>
			</div>
		</div>

		<!-- 게임 필터 -->
		<div class="flex w-1/5">
			<select
				bind:value={selectedGame}
				onchange={handleFilterChange}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="">모든 게임</option>
				{#each gameList as game}
					<option value={game.id}>{game.name}</option>
				{/each}
			</select>
		</div>

		<!-- 페이지당 항목 수 -->
		<div class="flex w-1/5">
			<select
				bind:value={itemsPerPage}
				onchange={handleItemsPerPageChange}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="10">10개씩 보기</option>
				<option value="20">20개씩 보기</option>
				<option value="50">50개씩 보기</option>
			</select>
		</div>

		<!-- 추가 버튼 -->
		<button
			class="ml-auto inline-flex items-center rounded-lg bg-orange-300 px-5 py-2 text-center text-sm font-medium text-white hover:bg-orange-500 whitespace-nowrap"
			onclick={addNewGroup}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			쿠폰 그룹 추가
		</button>
	</div>

	<!-- 목록 테이블 -->
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">제목</th>
					<th scope="col" class="px-6 py-3">게임</th>
					<th scope="col" class="px-6 py-3">기간</th>
					<th scope="col" class="px-6 py-3">코드 수</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">액션</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each groupList as group}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							{group.title}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{group.game?.name ?? '-'}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{formatPeriod(group)}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							<span class="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
								{group._count?.codes ?? 0}개
							</span>
						</td>
						<td class="px-6 py-4 text-right">
							<button
								aria-label="편집"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => editGroup(group)}
							>
								<i class="ri-edit-box-line text-xl"></i>
								편집
							</button>
							<button
								aria-label="삭제"
								class="rounded-lg px-3 py-2 font-medium text-red-400 hover:bg-red-100 hover:text-red-600"
								onclick={() => deleteGroup(group.id)}
							>
								<i class="ri-delete-bin-line text-xl"></i>
								삭제
							</button>
						</td>
					</tr>
				{/each}
				{#if groupList.length === 0}
					<tr>
						<td colspan="5" class="px-6 py-8 text-center text-gray-400">
							쿠폰 그룹이 없습니다.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>

		<!-- 페이지네이션 -->
		<div
			class="sticky top-0 flex items-center justify-center bg-gray-50 p-2 text-xs uppercase text-gray-600"
		>
			<span class="ml-4 text-sm font-normal text-gray-600">
				현재 <span class="font-semibold text-orange-500">{currentPage}</span> /
				<span class="font-semibold text-orange-500">{totalPages}</span>
				페이지 총
				<span class="font-semibold text-orange-500">{totalItems}</span> 그룹이 있습니다.
			</span>
			<div class="ml-auto mr-4 flex items-center gap-2">
				<button
					aria-label="이전 페이지"
					onclick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600 disabled:opacity-50"
				>
					<i class="ri-arrow-left-s-line text-xl"></i>
				</button>
				<div class="flex items-center gap-1">
					{#each Array.from({ length: 5 }, (_, i) => {
						const pageNum = currentPage - 2 + i;
						if (pageNum > 0 && pageNum <= totalPages) return pageNum;
						return null;
					}) as pageNum}
						{#if pageNum}
							<button
								class="w-12 rounded-lg px-3 py-2 hover:bg-orange-100 hover:text-orange-600 {currentPage === pageNum
									? 'bg-orange-100 text-orange-600'
									: 'text-orange-400'}"
								onclick={() => handlePageChange(pageNum)}
							>
								<p class="text-base font-medium">{pageNum}</p>
							</button>
						{/if}
					{/each}
				</div>
				<button
					aria-label="다음 페이지"
					onclick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600 disabled:opacity-50"
				>
					<i class="ri-arrow-right-s-line text-xl"></i>
				</button>
			</div>
		</div>
	</div>
</div>
