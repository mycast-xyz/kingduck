<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { FaqType } from '../../../model/api/api';

	const { data } = $props<{ data: any }>();

	let faqList: FaqType[] = $state([]);

	// 페이지네이션 상태
	let itemsPerPage = $state(10);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);

	// 필터 상태
	let categoryFilter = $state($page.url.searchParams.get('category') || '');

	onMount(async () => {
		await loadData();
	});

	// 모달이 닫히면 목록을 다시 불러온다 (AdminItemList 패턴)
	const modalStore = WindowService.modal;
	let faqModalWasOpen = false;
	$effect(() => {
		const open = $modalStore === 'admin-add-faq';
		if (faqModalWasOpen && !open) {
			loadData();
		}
		faqModalWasOpen = open;
	});

	async function loadData() {
		await getFaqList(currentPage, itemsPerPage, categoryFilter);
	}

	async function getFaqList(pageNum: number, limit: number, category?: string) {
		try {
			const params: Record<string, any> = { page: pageNum, limit };
			if (category) params.category = category;

			const response = await client.get('/api/v0/admin/faq/list', { params });
			if (response.data.resultCode === 200) {
				const d = response.data.data;
				faqList = d.items;
				totalPages = d.totalPages;
				totalItems = d.total;
				currentPage = d.page;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('FAQ 목록 조회 중 오류 발생:', error);
			toastStore.error('FAQ 목록을 불러오지 못했습니다.');
		}
	}

	function handleFilterChange() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadData();
	}

	function handleItemsPerPageChange(event: Event) {
		itemsPerPage = parseInt((event.target as HTMLSelectElement).value);
		currentPage = 1;
		loadData();
	}

	function updateUrl() {
		if (!browser) return;
		const url = new URL(window.location.href);
		if (categoryFilter) url.searchParams.set('category', categoryFilter);
		else url.searchParams.delete('category');
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function addNew() {
		WindowService.openModal('admin-add-faq');
	}

	function editFaq(faq: FaqType) {
		WindowService.openModal('admin-add-faq', faq);
	}

	async function deleteFaq(faqId: number) {
		if (!confirm('정말로 이 FAQ를 삭제하시겠습니까?')) return;

		try {
			const response = await client.delete(`/api/v0/admin/faq/${faqId}`);
			if (response.data.resultCode === 200) {
				toastStore.success('FAQ가 삭제되었습니다.');
				await loadData();
			} else {
				toastStore.error(response.data.resultMsg || '삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('FAQ 삭제 중 오류 발생:', error);
			toastStore.error('FAQ 삭제에 실패했습니다.');
		}
	}

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
		<!-- 카테고리 필터 -->
		<div class="relative w-1/4">
			<input
				type="text"
				bind:value={categoryFilter}
				onkeydown={(e) => e.key === 'Enter' && handleFilterChange()}
				placeholder="카테고리 필터..."
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			/>
			<button
				type="button"
				class="absolute right-5 top-2.5 text-gray-400 hover:text-gray-900"
				onclick={handleFilterChange}
				aria-label="검색"
			>
				<i class="ri-search-line text-lg"></i>
			</button>
		</div>

		<!-- 페이지당 항목 수 -->
		<div class="w-1/5">
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
			onclick={addNew}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			FAQ 추가
		</button>
	</div>

	<!-- 목록 테이블 -->
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">질문</th>
					<th scope="col" class="px-6 py-3">카테고리</th>
					<th scope="col" class="px-6 py-3">순서</th>
					<th scope="col" class="px-6 py-3">공개</th>
					<th scope="col" class="px-6 py-3">등록일</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">액션</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each faqList as faq}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							<p class="max-w-sm truncate">{faq.question}</p>
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{#if faq.category}
								<span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
									{faq.category}
								</span>
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{faq.sortOrder}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{#if faq.published}
								<span class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">공개</span>
							{:else}
								<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">비공개</span>
							{/if}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{formatDate(faq.createdAt)}
						</td>
						<td class="px-6 py-4 text-right">
							<button
								aria-label="편집"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => editFaq(faq)}
							>
								<i class="ri-edit-box-line text-xl"></i>
								편집
							</button>
							<button
								aria-label="삭제"
								class="rounded-lg px-3 py-2 font-medium text-red-400 hover:bg-red-100 hover:text-red-600"
								onclick={() => deleteFaq(faq.id)}
							>
								<i class="ri-delete-bin-line text-xl"></i>
								삭제
							</button>
						</td>
					</tr>
				{/each}
				{#if faqList.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-gray-400">
							FAQ가 없습니다.
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
