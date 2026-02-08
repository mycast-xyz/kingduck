<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { WindowService } from '../../../service/WindowService';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const { data } = $props<{ data: any }>();

	let allEventList: any = $state([]);
	let gameList: any = $state([]);

	// 페이지네이션 상태
	let itemsPerPage = $state(10);
	let currentPage = $state(1);
	let totalPages = $state(0);
	let totalItems = $state(0);

	// 필터 상태
	let selectedGame = $state($page.url.searchParams.get('gameId') || '');
	let selectedType = $state($page.url.searchParams.get('type') || '');
	let selectedStatus = $state($page.url.searchParams.get('status') || '');
	let searchQuery = $state($page.url.searchParams.get('name') || '');

	// 클라이언트 사이드 상태 필터링
	let eventList = $derived(
		selectedStatus === ''
			? allEventList
			: allEventList.filter((event: any) => {
					const status = getEventStatus(event.startTime, event.endTime);
					return status === selectedStatus;
				})
	);

	onMount(async () => {
		await getGameList();
		await loadData();
	});

	async function loadData() {
		await getEventList(currentPage, itemsPerPage, selectedGame, selectedType, searchQuery);
	}

	async function getEventList(
		page: number,
		limit: number,
		gameId?: string,
		type?: string,
		name?: string
	) {
		try {
			const params: any = { page, limit };
			if (gameId) params.gameId = gameId;
			if (type && type !== '') params.type = type;
			if (name) params.name = name;
			// status는 클라이언트에서 필터링

			const response = await client.get('/api/v0/admin/event/list', { params });
			if (response.data.resultCode === 200) {
				const data = response.data.data;
				allEventList = data.items;
				totalPages = data.totalPages;
				totalItems = data.total;
				currentPage = data.page;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('이벤트 목록 조회 중 오류 발생:', error);
		}
	}

	async function getGameList() {
		try {
			const response = await client.get('/api/v0/admin/game/list');
			if (response.data.resultCode === 200) {
				gameList = response.data.items;
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
	function handleItemsPerPageChange(event: any) {
		itemsPerPage = parseInt(event.target.value);
		currentPage = 1;
		loadData();
	}

	function updateUrl() {
		const url = new URL(window.location.href);
		if (selectedGame) url.searchParams.set('gameId', selectedGame);
		else url.searchParams.delete('gameId');

		if (selectedType) url.searchParams.set('type', selectedType);
		else url.searchParams.delete('type');

		if (selectedStatus) url.searchParams.set('status', selectedStatus);
		else url.searchParams.delete('status');

		if (searchQuery) url.searchParams.set('name', searchQuery);
		else url.searchParams.delete('name');

		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	// 상태 계산 함수
	function getEventStatus(startTime: string, endTime: string): string {
		const now = new Date();
		const start = new Date(startTime);
		const end = new Date(endTime);

		if (now < start) return 'UPCOMING';
		if (now >= start && now <= end) return 'ACTIVE';
		return 'ENDED';
	}

	// 상태 색상
	function getStatusColor(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return 'bg-green-500';
			case 'UPCOMING':
				return 'bg-blue-500';
			case 'ENDED':
				return 'bg-gray-500';
			default:
				return 'bg-gray-500';
		}
	}

	// 상태 텍스트
	function getStatusText(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return '진행중';
			case 'UPCOMING':
				return '예정';
			case 'ENDED':
				return '종료';
			default:
				return '알 수 없음';
		}
	}

	// 타입 색상
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

	// 타입 텍스트
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

	// 새 이벤트 추가
	function addNewEvent() {
		// TODO: 모달 열기
		WindowService.openModal('admin-add-event');
	}

	// 이벤트 편집
	function editEvent(eventId: string) {
		// TODO: 모달 열기
		console.log('Edit event:', eventId);
	}

	// 이벤트 삭제
	async function deleteEvent(eventId: string) {
		if (!confirm('정말로 이 이벤트를 삭제하시겠습니까?')) return;

		try {
			await client.delete(`/api/v0/admin/event/${eventId}`);
			await loadData();
		} catch (error) {
			console.error('이벤트 삭제 중 오류 발생:', error);
			alert('이벤트 삭제에 실패했습니다.');
		}
	}

	// 날짜 포맷팅
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
</script>

<div class="mx-auto pb-4">
	<!-- 필터 및 검색 영역 -->
	<div class="mb-4 flex items-center gap-2">
		<!-- 검색창 -->
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder="이벤트명 검색..."
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
		<div class="flex w-1/6">
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

		<!-- 타입 필터 -->
		<div class="flex w-1/6">
			<select
				bind:value={selectedType}
				onchange={handleFilterChange}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="">모든 타입</option>
				<option value="GACHA">가챠</option>
				<option value="EVENT">이벤트</option>
				<option value="MAINTENANCE">점검</option>
			</select>
		</div>

		<!-- 상태 필터 -->
		<div class="flex w-1/6">
			<select
				bind:value={selectedStatus}
				onchange={handleFilterChange}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="">모든 상태</option>
				<option value="ACTIVE">진행중</option>
				<option value="UPCOMING">예정</option>
				<option value="ENDED">종료</option>
			</select>
		</div>

		<!-- 페이지당 항목 수 -->
		<div class="flex w-1/6">
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

		<!-- 추가 버튼 -->
		<button
			class="ml-auto inline-flex items-center rounded-lg bg-orange-300 px-5 py-2 text-center text-sm font-medium text-white hover:bg-orange-500 whitespace-nowrap"
			onclick={addNewEvent}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			이벤트 추가
		</button>
	</div>

	<!-- 이벤트 목록 테이블 -->
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">이벤트명</th>
					<th scope="col" class="px-6 py-3">게임</th>
					<th scope="col" class="px-6 py-3">타입</th>
					<th scope="col" class="px-6 py-3">시작일</th>
					<th scope="col" class="px-6 py-3">종료일</th>
					<th scope="col" class="px-6 py-3">상태</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">액션</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each eventList as event}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							<div class="flex items-center">
								{#if event.image}
									<img
										src={data.url + '/' + event.image}
										alt={event.title}
										class="mr-3 h-10 w-10 rounded object-cover"
									/>
								{/if}
								<div class="text-sm font-medium">{event.title}</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="text-sm font-normal">{event.game?.name}</div>
						</td>
						<td class="px-6 py-4">
							<span class="rounded-full px-2 py-1 text-xs {getTypeColor(event.type)}">
								{getTypeText(event.type)}
							</span>
						</td>
						<td class="px-6 py-4">
							<div class="text-sm font-normal">{formatDate(event.startTime)}</div>
						</td>
						<td class="px-6 py-4">
							<div class="text-sm font-normal">{formatDate(event.endTime)}</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getStatusColor(
										getEventStatus(event.startTime, event.endTime)
									)}"
								></div>
								<p class="text-sm font-normal">
									{getStatusText(getEventStatus(event.startTime, event.endTime))}
								</p>
							</div>
						</td>
						<td class="px-6 py-4 text-right">
							<button
								aria-label="편집"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => editEvent(event.id)}
							>
								<i class="ri-edit-box-line text-xl"></i>
								편집
							</button>
							<button
								aria-label="삭제"
								class="rounded-lg px-3 py-2 font-medium text-red-400 hover:bg-red-100 hover:text-red-600"
								onclick={() => deleteEvent(event.id)}
							>
								<i class="ri-delete-bin-line text-xl"></i>
								삭제
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- 페이지네이션 -->
		<div
			class="sticky top-0 flex items-center justify-center bg-gray-50 p-2 text-xs uppercase text-gray-600"
		>
			<span class="ml-4 text-sm font-normal text-gray-600 dark:text-gray-400">
				현재 <span class="font-semibold text-orange-500 dark:text-white">{currentPage}</span> /
				<span class="font-semibold text-orange-500 dark:text-white">{totalPages}</span>

				페이지 총
				<span class="font-semibold text-orange-500 dark:text-white">{totalItems}</span> 이벤트가 있습니다.
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
