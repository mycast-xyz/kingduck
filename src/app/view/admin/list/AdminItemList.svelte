<script lang="ts">
	import client, { getApiBaseUrl } from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import type { ItemType } from '../../../model/api/api';

	const { data } = $props<{ data: any }>();

	let itemList: ItemType[] = $state([]);
	let gameList: any[] = $state([]);

	// 페이지네이션 상태
	let itemsPerPage = $state(10);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);

	// 필터 상태
	let selectedGame = $state($page.url.searchParams.get('gameId') || '');
	let typeFilter = $state($page.url.searchParams.get('type') || '');
	let searchQuery = $state($page.url.searchParams.get('name') || '');

	onMount(async () => {
		await getGameList();
		await loadData();
	});

	// generic admin/[slug] 라우트라 +page.ts load가 목록 데이터를 들고 있지 않아 invalidateAll()로는
	// 갱신되지 않는다(데이터는 이 컴포넌트가 직접 fetch). 아이템 모달이 닫히면(저장/취소) 다시 불러온다.
	const modalStore = WindowService.modal;
	let itemModalWasOpen = false;
	$effect(() => {
		const open = $modalStore === 'admin-add-item';
		if (itemModalWasOpen && !open) {
			loadData();
		}
		itemModalWasOpen = open;
	});

	async function loadData() {
		await getItemList(currentPage, itemsPerPage, selectedGame, typeFilter, searchQuery);
	}

	async function getItemList(
		pg: number,
		limit: number,
		gameId?: string,
		type?: string,
		name?: string
	) {
		try {
			const params: any = { page: pg, limit };
			if (gameId) params.gameId = gameId;
			if (type) params.type = type;
			if (name) params.name = name;

			const response = await client.get('/api/v0/admin/item/list', { params });
			if (response.data.resultCode === 200) {
				const d = response.data.data;
				itemList = d.items;
				totalPages = d.totalPages;
				totalItems = d.total;
				currentPage = d.page;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('아이템 목록 조회 중 오류 발생:', error);
			toastStore.error('아이템 목록을 불러오지 못했습니다.');
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

	function handleSearch() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	function handleGameChange() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	function handleTypeFilter() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		loadData();
	}

	function handleItemsPerPageChange(event: any) {
		itemsPerPage = parseInt(event.target.value);
		currentPage = 1;
		loadData();
	}

	function updateUrl() {
		if (!browser) return;
		const url = new URL(window.location.href);
		if (selectedGame) url.searchParams.set('gameId', selectedGame);
		else url.searchParams.delete('gameId');

		if (typeFilter) url.searchParams.set('type', typeFilter);
		else url.searchParams.delete('type');

		if (searchQuery) url.searchParams.set('name', searchQuery);
		else url.searchParams.delete('name');

		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	async function handleDelete(item: ItemType) {
		if (!confirm(`'${item.name}' 아이템을 삭제하시겠습니까?`)) return;
		try {
			const response = await client.delete(`/api/v0/admin/item/${item.id}`);
			if (response.data.resultCode === 200) {
				toastStore.success('아이템이 삭제되었습니다.');
				await invalidateAll();
				await loadData();
			} else {
				toastStore.error(response.data.resultMsg || '삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('아이템 삭제 중 오류 발생:', error);
			toastStore.error('아이템 삭제에 실패했습니다.');
		}
	}

	function getImageStatus(imageUrl: string | undefined) {
		if (!imageUrl) return { color: 'bg-gray-400', status: '없음' };
		return { color: 'bg-green-500', status: '있음' };
	}

	function getGameName(gameId: number) {
		return gameList.find((g) => g.id === gameId)?.name || '-';
	}

	function getGameSlug(gameId: number): string | undefined {
		return gameList.find((g) => g.id === gameId)?.slug;
	}
</script>

<div class="mx-auto pb-4">
	<!-- 필터 / 검색 바 -->
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<!-- 이름 검색 -->
		<div class="relative w-1/4 min-w-40">
			<input
				type="text"
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				placeholder="아이템 이름 검색"
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			/>
			<button
				type="button"
				class="absolute right-4 top-3 text-gray-400 hover:text-gray-900"
				onclick={handleSearch}
			>
				<i class="ri-search-line text-lg"></i>
			</button>
		</div>

		<!-- 게임 필터 -->
		<div class="w-1/6 min-w-32">
			<select
				bind:value={selectedGame}
				onchange={handleGameChange}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="">모든 게임</option>
				{#each gameList as game}
					<option value={game.id}>{game.name}</option>
				{/each}
			</select>
		</div>

		<!-- 타입 필터 -->
		<div class="relative w-1/5 min-w-36">
			<input
				type="text"
				bind:value={typeFilter}
				onkeydown={(e) => e.key === 'Enter' && handleTypeFilter()}
				placeholder="타입 필터 (Enter)"
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			/>
		</div>

		<!-- 페이지당 항목 수 -->
		<div class="w-1/6 min-w-32">
			<select
				bind:value={itemsPerPage}
				onchange={handleItemsPerPageChange}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="10">10개씩 보기</option>
				<option value="20">20개씩 보기</option>
				<option value="50">50개씩 보기</option>
				<option value="100">100개씩 보기</option>
			</select>
		</div>

		<!-- 아이템 추가 버튼 -->
		<button
			class="ml-auto inline-flex items-center rounded-lg bg-orange-300 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-500"
			onclick={() => WindowService.openModal('admin-add-item')}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			아이템 추가
		</button>
	</div>

	<!-- 테이블 -->
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">아이템</th>
					<th scope="col" class="px-6 py-3">게임</th>
					<th scope="col" class="px-6 py-3">타입</th>
					<th scope="col" class="px-6 py-3">등급</th>
					<th scope="col" class="px-6 py-3">설명</th>
					<th scope="col" class="px-6 py-3">이미지</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">관리</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each itemList as item}
					<tr class="border-b bg-white hover:bg-gray-50">
						<!-- 이름 + 썸네일 -->
						<td class="px-6 py-4 font-medium text-gray-900">
							<div class="flex items-center gap-3">
								{#if item.imageUrl}
									<img
										src={getApiBaseUrl() + '/' + item.imageUrl}
										alt={item.name}
										class="h-10 w-10 rounded object-contain"
									/>
								{:else}
									<div
										class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-gray-300"
									>
										<i class="ri-image-line text-xl"></i>
									</div>
								{/if}
								<span class="text-sm font-medium">{item.name}</span>
							</div>
						</td>

						<!-- 게임 -->
						<td class="px-6 py-4">
							<p class="text-sm font-normal">{getGameName(item.gameId)}</p>
						</td>

						<!-- 타입 -->
						<td class="px-6 py-4">
							<span
								class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
							>
								{item.type}
							</span>
						</td>

						<!-- 등급 -->
						<td class="px-6 py-4">
							{#if item.rarity}
								<span class="text-sm font-medium text-amber-600">★{item.rarity}</span>
							{:else}
								<span class="text-xs text-gray-400">-</span>
							{/if}
						</td>

						<!-- 설명 -->
						<td class="px-6 py-4">
							<p class="max-w-xs truncate text-sm text-gray-600">{item.description || '-'}</p>
						</td>

						<!-- 이미지 상태 -->
						<td class="px-6 py-4">
							<div class="flex items-center gap-2">
								<div
									class="h-2.5 w-2.5 rounded-full {getImageStatus(item.imageUrl).color}"
								></div>
								<p class="text-sm">{getImageStatus(item.imageUrl).status}</p>
							</div>
						</td>

						<!-- 수정 / 아이템 페이지 / 삭제 -->
						<td class="px-6 py-4 text-right">
							<button
								aria-label="수정"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => WindowService.openModal('admin-add-item', item)}
							>
								<i class="ri-edit-box-line text-xl"></i>
								수정
							</button>
							{#if getGameSlug(item.gameId)}
								<a
									aria-label="아이템 페이지"
									class="rounded-lg px-3 py-2 font-medium text-blue-400 hover:bg-blue-100 hover:text-blue-600"
									href="/item/{getGameSlug(item.gameId)}"
								>
									<i class="ri-external-link-line text-xl"></i>
									아이템 페이지
								</a>
							{/if}
							<button
								aria-label="삭제"
								class="rounded-lg px-3 py-2 font-medium text-red-400 hover:bg-red-100 hover:text-red-600"
								onclick={() => handleDelete(item)}
							>
								<i class="ri-delete-bin-line text-xl"></i>
								삭제
							</button>
						</td>
					</tr>
				{/each}
				{#if itemList.length === 0}
					<tr>
						<td colspan="7" class="py-12 text-center text-gray-400">등록된 아이템이 없습니다.</td>
					</tr>
				{/if}
			</tbody>
		</table>

		<!-- 페이지네이션 -->
		<div
			class="flex items-center justify-center bg-gray-50 p-2 text-xs uppercase text-gray-600"
		>
			<span class="ml-4 text-sm font-normal text-gray-600">
				현재 <span class="font-semibold text-orange-500">{currentPage}</span> /
				<span class="font-semibold text-orange-500">{totalPages}</span>
				페이지 총
				<span class="font-semibold text-orange-500">{totalItems}</span> 아이템이 있습니다.
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
</div>
