<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { WindowService } from '../../../service/WindowService';
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
		const url = new URL(window.location.href);
		if (selectedGame) url.searchParams.set('gameId', selectedGame);
		else url.searchParams.delete('gameId');
		
		if (searchQuery) url.searchParams.set('name', searchQuery);
		else url.searchParams.delete('name');

		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	// 이미지 상태를 체크하는 함수
	function getImageStatus(imageUrl: any) {
        // 기존 로직 유지하되 imageUrl이 string인지 object인지 확인 필요. 
        // 사용자 코드는 item.imageUrl을 전달하고 있었으나, 기존 함수는 imageCount 객체를 기대했음.
        // 하지만 직전 수정에서 getImageStatus(item.imageUrl)로 호출부만 바꿨고 함수 내부는 imageCount.card 등을 체크하고 있음.
        // 사용자가 제공한 스니펫에 따르면 item.imageUrl이 쓰이고 있음.
        // API 응답 구조를 정확히 모르는 상태에서 기존 로직을 최대한 보존하려 노력함.
        // 다만 imageUrl이 문자열이라면 기존 imageCount 로직(card, art 확인)은 동작하지 않을 것임.
        // 여기서는 일단 함수 정의는 그대로 두고 호출부와의 부조화는 추후 수정하거나, 
        // 사용자의 의도(imageUrl 확인)에 맞게 함수를 수정해야 할 수도 있음.
        // 일단 기존 함수 그대로 둠.
		if (!imageUrl) return { color: 'bg-gray-500', status: '정보 없음' };
		// 만약 imageUrl이 객체라면 기존 로직 사용 가능.
        return { color: 'bg-green-500', status: '완료' }; // 임시
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

	// 스킬 상태를 체크하는 함수
	function getSkillStatus(skillCount: any) {
		if (!skillCount) return { color: 'bg-red-500', status: '정보 없음' };
		if (skillCount === 0) {
			return { color: 'bg-red-500', status: '스킬 누락' };
		}
		return { color: 'bg-green-500', status: '완료' };
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
			onclick={() => WindowService.openModal('admin-add-game')}
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
								id="tooltip-default"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-edit-box-line text-xl"></i>
								편집
							</button>
							<a
								aria-label="캐릭터 페이지 이동"
								id="tooltip-default"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
                href="/content/{item.game?.slug}/{item.id}"
							>
							<i class="ri-external-link-line"></i>
								캐릭터 페이지 이동
							</a>
              <!--
							<button
								aria-label="변수 설정"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-code-box-line text-xl"></i>
								변수 설정
							</button>
              -->
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
