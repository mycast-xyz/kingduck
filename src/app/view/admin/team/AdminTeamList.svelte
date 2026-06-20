<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { TeamType } from '../../../model/api/api';

	const { data } = $props<{ data: any }>();

	let teamList: TeamType[] = $state([]);
	let gameList: any[] = $state([]);

	// 페이지네이션 상태
	let itemsPerPage = $state(10);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);

	// 필터 상태
	let selectedGame = $state($page.url.searchParams.get('gameId') || '');
	let searchName = $state($page.url.searchParams.get('name') || '');

	onMount(async () => {
		await getGameList();
		await loadData();
	});

	// 모달이 닫히면 목록을 다시 불러온다
	const modalStore = WindowService.modal;
	let teamModalWasOpen = false;
	$effect(() => {
		const open = $modalStore === 'admin-add-team';
		if (teamModalWasOpen && !open) {
			loadData();
		}
		teamModalWasOpen = open;
	});

	async function loadData() {
		await getTeamList(currentPage, itemsPerPage, selectedGame, searchName);
	}

	async function getTeamList(pageNum: number, limit: number, gameId?: string, name?: string) {
		try {
			const params: Record<string, any> = { page: pageNum, limit };
			if (gameId) params.gameId = gameId;
			if (name) params.name = name;

			const response = await client.get('/api/v0/admin/team/list', { params });
			if (response.data.resultCode === 200) {
				const d = response.data.data;
				teamList = d.items;
				totalPages = d.totalPages;
				totalItems = d.total;
				currentPage = d.page;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('팀 목록 조회 중 오류 발생:', error);
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
		if (selectedGame) url.searchParams.set('gameId', selectedGame);
		else url.searchParams.delete('gameId');
		if (searchName) url.searchParams.set('name', searchName);
		else url.searchParams.delete('name');
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function addNewTeam() {
		WindowService.openModal('admin-add-team');
	}

	function editTeam(team: TeamType) {
		WindowService.openModal('admin-add-team', team);
	}

	async function deleteTeam(teamId: number) {
		if (!confirm('정말로 이 팀 추천을 삭제하시겠습니까?')) return;

		try {
			const response = await client.delete(`/api/v0/admin/team/${teamId}`);
			if (response.data.resultCode === 200) {
				toastStore.success('팀 추천이 삭제되었습니다.');
				await loadData();
			} else {
				toastStore.error(response.data.resultMsg || '삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('팀 삭제 중 오류 발생:', error);
			toastStore.error('팀 추천 삭제에 실패했습니다.');
		}
	}
</script>

<div class="mx-auto pb-4">
	<!-- 필터 및 검색 영역 -->
	<div class="mb-4 flex items-center gap-2">
		<!-- 이름 검색 -->
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchName}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder="팀 이름 검색..."
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
				value={itemsPerPage}
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
			onclick={addNewTeam}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			팀 추가
		</button>
	</div>

	<!-- 목록 테이블 -->
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">팀 이름</th>
					<th scope="col" class="px-6 py-3">게임</th>
					<th scope="col" class="px-6 py-3">앵커 캐릭터</th>
					<th scope="col" class="px-6 py-3">슬롯 수</th>
					<th scope="col" class="px-6 py-3">공개</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">액션</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each teamList as team}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							{team.name}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{team.game?.name ?? '-'}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{team.character?.name ?? '-'}
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							<span class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
								{team.slots?.length ?? 0}개
							</span>
						</td>
						<td class="px-6 py-4 text-sm font-normal">
							{#if team.published}
								<span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">공개</span>
							{:else}
								<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">비공개</span>
							{/if}
						</td>
						<td class="px-6 py-4 text-right">
							<button
								aria-label="편집"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => editTeam(team)}
							>
								<i class="ri-edit-box-line text-xl"></i>
								편집
							</button>
							<button
								aria-label="삭제"
								class="rounded-lg px-3 py-2 font-medium text-red-400 hover:bg-red-100 hover:text-red-600"
								onclick={() => deleteTeam(team.id)}
							>
								<i class="ri-delete-bin-line text-xl"></i>
								삭제
							</button>
						</td>
					</tr>
				{/each}
				{#if teamList.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-gray-400">
							팀 추천이 없습니다.
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
				<span class="font-semibold text-orange-500">{totalItems}</span> 팀이 있습니다.
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
