<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { toastStore } from '../../../service/ToastService';

	interface PendingGame {
		id: number;
		name: string;
		slug: string;
	}

	interface PendingEventItem {
		id: number;
		gameId: number;
		type: string;
		title: string;
		startTime: string;
		endTime: string;
		imageUrl: string | null;
		officialLink: string | null;
		metadata: unknown;
		status: string;
		createdAt: string;
		game: PendingGame;
	}

	let pendingList: PendingEventItem[] = $state([]);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);
	let itemsPerPage = $state(10);
	let loading = $state(false);

	onMount(() => {
		loadPendingList();
	});

	async function loadPendingList() {
		loading = true;
		try {
			const response = await client.get('/api/v0/admin/event/pending', {
				params: { page: currentPage, limit: itemsPerPage }
			});
			if (response.data.resultCode === 200) {
				const d = response.data.data;
				pendingList = d.items;
				totalPages = d.totalPages;
				totalItems = d.total;
				currentPage = d.page;
			} else {
				toastStore.error('목록을 불러오지 못했습니다.');
			}
		} catch (error) {
			console.error('검토 대기 목록 조회 오류:', error);
			toastStore.error('목록을 불러오지 못했습니다.');
		} finally {
			loading = false;
		}
	}

	async function handleApprove(item: PendingEventItem) {
		if (!confirm(`'${item.title}' 이벤트를 승인하시겠습니까?`)) return;
		try {
			const response = await client.post(`/api/v0/admin/event/approve/${item.id}`);
			if (response.data.resultCode === 409) {
				toastStore.warning('이미 처리된 이벤트입니다.');
				await loadPendingList();
				return;
			}
			if (response.data.resultCode === 200) {
				toastStore.success('승인되었습니다.');
				await loadPendingList();
			} else {
				toastStore.error(response.data.resultMsg || '승인에 실패했습니다.');
			}
		} catch (error: any) {
			if (error.response?.status === 409) {
				toastStore.warning('이미 처리된 이벤트입니다.');
				await loadPendingList();
			} else {
				console.error('승인 오류:', error);
				toastStore.error('승인에 실패했습니다.');
			}
		}
	}

	async function handleReject(item: PendingEventItem) {
		const reason = prompt(`'${item.title}' 이벤트를 거부하는 이유를 입력하세요:`);
		if (reason === null) return;
		if (!reason.trim()) {
			toastStore.warning('거부 사유를 입력해주세요.');
			return;
		}
		try {
			const response = await client.post(`/api/v0/admin/event/reject/${item.id}`, { reason });
			if (response.data.resultCode === 409) {
				toastStore.warning('이미 처리된 이벤트입니다.');
				await loadPendingList();
				return;
			}
			if (response.data.resultCode === 200) {
				toastStore.success('거부되었습니다.');
				await loadPendingList();
			} else {
				toastStore.error(response.data.resultMsg || '거부에 실패했습니다.');
			}
		} catch (error: any) {
			if (error.response?.status === 409) {
				toastStore.warning('이미 처리된 이벤트입니다.');
				await loadPendingList();
			} else {
				console.error('거부 오류:', error);
				toastStore.error('거부에 실패했습니다.');
			}
		}
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadPendingList();
	}

	function handleItemsPerPageChange(event: any) {
		itemsPerPage = parseInt(event.target.value);
		currentPage = 1;
		loadPendingList();
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getTypeText(type: string): string {
		switch (type) {
			case 'GACHA':
				return '가챠';
			case 'EVENT':
				return '이벤트';
			case 'MAINTENANCE':
				return '점검';
			default:
				return type;
		}
	}

	function getTypeColor(type: string): string {
		switch (type) {
			case 'GACHA':
				return 'bg-purple-100 text-purple-700';
			case 'EVENT':
				return 'bg-orange-100 text-orange-700';
			case 'MAINTENANCE':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}
</script>

<div class="mx-auto pb-4">
	<div class="mb-4 flex items-center justify-between">
		<p class="text-sm text-gray-500">
			이벤트 검토 대기 목록입니다. 크롤러가 수집한 이벤트 데이터를 검토하여 승인 또는 거부하세요.
		</p>
		<select
			value={itemsPerPage}
			onchange={handleItemsPerPageChange}
			class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-normal text-gray-900"
		>
			<option value="10">10개씩 보기</option>
			<option value="20">20개씩 보기</option>
			<option value="50">50개씩 보기</option>
		</select>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<i class="ri-loader-4-line animate-spin text-3xl text-orange-400"></i>
		</div>
	{:else}
		<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
			<table class="w-full text-left text-sm text-gray-500">
				<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
					<tr>
						<th scope="col" class="px-6 py-3">제목</th>
						<th scope="col" class="px-6 py-3">게임</th>
						<th scope="col" class="px-6 py-3">타입</th>
						<th scope="col" class="px-6 py-3">생성 시간</th>
						<th scope="col" class="px-6 py-3"><span class="sr-only">액션</span></th>
					</tr>
				</thead>
				<tbody>
					{#each pendingList as item}
						<tr class="border-b bg-white hover:bg-gray-50">
							<td class="px-6 py-4 font-medium text-gray-900">
								<p class="text-sm font-medium">{item.title}</p>
							</td>
							<td class="px-6 py-4">
								<p class="text-sm font-normal">{item.game?.name ?? '-'}</p>
							</td>
							<td class="px-6 py-4">
								<span
									class="rounded-full px-2.5 py-0.5 text-xs font-medium {getTypeColor(item.type)}"
								>
									{getTypeText(item.type)}
								</span>
							</td>
							<td class="px-6 py-4">
								<p class="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
							</td>
							<td class="px-6 py-4 text-right">
								<button
									aria-label="승인"
									class="rounded-lg px-3 py-2 font-medium text-green-500 hover:bg-green-50 hover:text-green-700"
									onclick={() => handleApprove(item)}
								>
									<i class="ri-check-line text-xl"></i>
									승인
								</button>
								<button
									aria-label="거부"
									class="rounded-lg px-3 py-2 font-medium text-red-400 hover:bg-red-100 hover:text-red-600"
									onclick={() => handleReject(item)}
								>
									<i class="ri-close-line text-xl"></i>
									거부
								</button>
							</td>
						</tr>
					{/each}
					{#if pendingList.length === 0}
						<tr>
							<td colspan="5" class="py-12 text-center text-gray-400">
								검토 대기 중인 이벤트가 없습니다.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>

			<!-- 페이지네이션 -->
			<div class="flex items-center justify-center bg-gray-50 p-2 text-xs uppercase text-gray-600">
				<span class="ml-4 text-sm font-normal text-gray-600">
					현재 <span class="font-semibold text-orange-500">{currentPage}</span> /
					<span class="font-semibold text-orange-500">{totalPages}</span>
					페이지 총
					<span class="font-semibold text-orange-500">{totalItems}</span> 건이 있습니다.
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
									class="w-12 rounded-lg px-3 py-2 hover:bg-orange-100 hover:text-orange-600 {currentPage ===
									pageNum
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
	{/if}
</div>
