<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	let characterList: any = $state([]);
	let gameList: any = $state([]);

	// 페이지네이션 상태
	let itemsPerPage = $state(10);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);

	// 필터 상태
	let selectedGame = $state($page.url.searchParams.get('gameId') || '');
	let searchQuery = $state($page.url.searchParams.get('name') || '');

	onMount(async () => {
		await getGameList();
		await loadData();
	});

	// generic admin/[slug] 라우트라 invalidateAll()로는 목록이 갱신되지 않는다.
	// 캐릭터 추가/수정 모달이 닫히면 다시 불러온다.
	const modalStore = WindowService.modal;
	let charModalWasOpen = false;
	$effect(() => {
		const open = $modalStore === 'admin-add-character';
		if (charModalWasOpen && !open) {
			loadData();
		}
		charModalWasOpen = open;
	});

	async function loadData() {
		await getCharacterList(currentPage, itemsPerPage, selectedGame, searchQuery);
	}

	async function getCharacterList(page: number, limit: number, gameId?: string, name?: string) {
		try {
			const params: any = { page, limit };
			if (gameId) params.gameId = gameId;
			if (name) params.name = name;

			const response = await client.get('/api/v0/admin/character/list', { params });
			if (response.data.resultCode === 200) {
				const data = response.data.data;
				characterList = data.items;
				totalPages = data.totalPages;
				totalItems = data.total;
				currentPage = data.page;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('캐릭터 목록 조회 중 오류 발생:', error);
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

	// 게임 선택 변경
	function handleGameChange() {
		currentPage = 1;
		updateUrl();
		loadData();
	}

	// 페이지 변경
	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		// updateUrl(); // 페이지 변경은 URL에 반영할지 선택 사항이나, 보통 반영하는게 좋음
		loadData();
	}

	// 페이지당 항목 수 변경
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

		if (searchQuery) url.searchParams.set('name', searchQuery);
		else url.searchParams.delete('name');

		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	async function handleDelete(item: any) {
		if (!confirm(`'${item.name}' 캐릭터를 삭제하시겠습니까?`)) return;
		try {
			const response = await client.delete(`/api/v0/admin/character/${item.id}`);
			if (response.data.resultCode === 200) {
				toastStore.success('캐릭터가 삭제되었습니다.');
				await loadData();
			} else {
				toastStore.error(response.data.resultMsg || '삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('캐릭터 삭제 중 오류 발생:', error);
			toastStore.error('캐릭터 삭제에 실패했습니다.');
		}
	}

	// 이미지 상태를 체크하는 함수 — imageUrl이 문자열로 존재하면 이미지 있음으로 판정
	function getImageStatus(imageUrl: any) {
		if (!imageUrl) return { color: 'bg-gray-400', status: '없음' };
		return { color: 'bg-green-500', status: '있음' };
	}
	// 타입 상태를 체크하는 함수
	function getTypeStatus(type: any) {
		if (!type) return { color: 'bg-gray-500', status: '정보 없음' };
		// type 객체의 값들 중 0이 있는지 확인
		const hasZeroValue = Object.values(type).some((value) => value === 0);
		if (hasZeroValue) {
			return { color: 'bg-red-500', status: '타입 누락' };
		}
		return { color: 'bg-green-500', status: '완료' };
	}

	// 세부정보 상태를 체크하는 함수
	function getDetailsStatus(details: any) {
		if (!details) return { color: 'bg-gray-500', status: '정보 없음' };
		// itemData와 stats 값 체크
		if (!details.itemData) {
			return { color: 'bg-red-500', status: '아이템 정보 누락' };
		}
		if (!details.stats) {
			return { color: 'bg-red-500', status: '스탯 정보 누락' };
		}
		return { color: 'bg-green-500', status: '완료' };
	}

	// 메타데이터 상태를 체크하는 함수 — metadata 객체가 비어 있으면 미입력으로 판정
	function getSkillStatus(metadata: any) {
		if (!metadata || typeof metadata !== 'object') return { color: 'bg-gray-400', status: '없음' };
		if (Object.keys(metadata).length === 0) return { color: 'bg-red-500', status: '미입력' };
		return { color: 'bg-green-500', status: '있음' };
	}

	// 출시 여부 상태를 체크하는 함수
	function getIsReleasedStatus(isReleased: any, releaseDate: any) {
		if (!releaseDate) return { color: 'bg-red-500', status: '정보 없음' };
		if (isReleased) {
			return { color: 'bg-green-500', status: '' };
		} else {
			return { color: 'bg-red-500', status: '/출시 예정' };
		}
	}
</script>

<div class="mx-auto pb-4">
	<div class="mb-4 flex items-center">
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder="검색어를 입력하세요"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
				/>

				<button 
					type="button" 
					class="absolute right-5 top-2.5 text-gray-400 hover:text-gray-900"
					onclick={handleSearch}
				>
					<i class="ri-search-line text-lg"></i>
				</button>
			</div>
		</div>
		<div class="ml-2 flex w-1/6">
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
		<div class="ml-2 flex w-1/6">
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
		<button
			class="ml-auto inline-flex items-center rounded-lg bg-orange-300 px-5 py-2 text-center text-sm font-medium text-white hover:bg-orange-500"
			onclick={() => WindowService.openModal('admin-add-character')}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			캐릭터 개별 추가
		</button>
	</div>
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">캐릭터</th>
					<th scope="col" class="px-6 py-3">게임 이름</th>
					<th scope="col" class="px-6 py-3">이미지/영상</th>
					<th scope="col" class="px-6 py-3">타입</th>
					<th scope="col" class="px-6 py-3">메타데이터</th>
					<th scope="col" class="px-6 py-3">출시 여부</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">편집</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each characterList as item}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							<div class="flex items-center">
								<img
									src={data.url + '/' + item.imageUrl}
									alt={item.name}
									class="mr-3 h-10 w-10 rounded-full"
								/>

								<div>
									<div class="text-sm font-medium">{item.name}</div>
									<!-- <div class="text-xs font-normal text-gray-500">
										영문 : {item.name.en}, 일본어 : {item.name.jp} 
									</div> -->
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<p class="text-sm font-normal">{item.game?.name}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getImageStatus(item.imageUrl).color}"
								></div>
								<p class="text-sm font-normal">{getImageStatus(item.imageUrl).status}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div class="mr-2 h-2.5 w-2.5 rounded-full {getTypeStatus(item.elementId).color}"></div>
								<p class="text-sm font-normal">{getTypeStatus(item.elementId).status}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getSkillStatus(item.metadata).color}"
								></div>
								<p class="text-sm font-normal">{getSkillStatus(item.metadata).status}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getIsReleasedStatus(
										item.isReleased,
										item.releaseDate
									).color}"
								></div>
								<p class="text-sm font-normal">
									{item.releaseDate}{getIsReleasedStatus(item.isReleased, item.releaseDate).status}
								</p>
							</div>
						</td>
						<td class="px-6 py-4 text-right">
							<button
								aria-label="편집"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => WindowService.openModal('admin-add-character', item)}
							>
								<i class="ri-edit-box-line text-xl"></i>
								편집
							</button>
							<a
								aria-label="캐릭터 페이지 이동"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								href="/content/{item.game?.slug}/{item.id}"
							>
								<i class="ri-external-link-line"></i>
								캐릭터 페이지 이동
							</a>
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
			</tbody>
		</table>
		<div
			class="sticky top-0 flex items-center justify-center bg-gray-50 p-2 text-xs uppercase text-gray-600"
		>
			<span class="ml-4 text-sm font-normal text-gray-600 dark:text-gray-400">
				현재 <span class="font-semibold text-orange-500 dark:text-white">{currentPage}</span> /
				<span class="font-semibold text-orange-500 dark:text-white">{totalPages}</span>

				페이지 총
				<span class="font-semibold text-orange-500 dark:text-white">{totalItems}</span> 캐릭터가
				잇습니다.
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
						if (pageNum > 0 && pageNum <= totalPages) {
							return pageNum;
						}
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
