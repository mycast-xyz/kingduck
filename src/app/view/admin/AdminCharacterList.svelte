<script lang="ts">
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { WindowService } from '../../service/WindowService';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	let characterListData: any = $state([]);
	let characterList: any = $state([]);
	let gameList: any = $state([]);

	onMount(async () => {
		await getCharacterList();
		await getGameList();
	});

	async function getCharacterList() {
		try {
			const response = await axios.get(data.url + '/api/v0/character/admin');
			if (response.data.resultCode === 200) {
				characterListData = response.data.items;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('게임 목록 조회 중 오류 발생:', error);
		}
	}
	async function getGameList() {
		try {
			const response = await axios.get(data.url + '/api/v0/game/admin/list');
			if (response.data.resultCode === 200) {
				gameList = response.data.items;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('게임 목록 조회 중 오류 발생:', error);
		}
	}

	// 검색어 상태
	let searchQuery = $state('');

	// 이미지 상태를 체크하는 함수
	function getImageStatus(imageCount: any) {
		if (!imageCount) return { color: 'bg-gray-500', status: '정보 없음' };
		const hasCard = imageCount.card > 0;
		const hasArt = imageCount.art > 0;
		const hasVideo = imageCount.video > 0;
		if (!hasCard || !hasArt) {
			return { color: 'bg-red-500', status: '필수 이미지 누락' };
		}
		if (!hasVideo) {
			return { color: 'bg-yellow-500', status: '동영상 누락' };
		}
		return { color: 'bg-green-500', status: '완료' };
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

	let selectedGame = $state('');

	$effect(() => {
		// 필터링된 캐릭터 리스트 처리
		let filteredList = characterListData;
		// 선택된 게임이 있으면 해당 게임의 캐릭터만 필터링
		if (selectedGame) {
			filteredList = characterListData.filter((character) => character.game.id === selectedGame);
		} else {
			filteredList = characterListData;
		}

		// 검색어가 있으면 이름으로 필터링 (한글, 영문, 일본어 모두 검색)
		if (searchQuery) {
			filteredList = filteredList.filter(
				(character) =>
					character.name.kr.toLowerCase().includes(searchQuery.toLowerCase()) ||
					character.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
					character.name.jp.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		characterList = filteredList;

		//페이지네이션된 캐릭터 리스트 계산
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		paginatedList = characterList.slice(startIndex, endIndex);
		totalPages = Math.ceil(characterList.length / itemsPerPage);
	});

	// 페이지당 표시할 항목 수
	let itemsPerPage = $state(10);
	let currentPage = $state(1);

	// 페이지네이션을 위한 상태
	let paginatedList = $state([]);
	let totalPages = $state(0);

	// 페이지당 항목 수 변경 처리
	function handleItemsPerPageChange(event: any) {
		itemsPerPage = parseInt(event.target.value);
		totalPages = Math.ceil(characterList.length / itemsPerPage);
		currentPage = 1; // 페이지 수가 변경되면 첫 페이지로 이동
	}
</script>

<div class="mx-auto pb-4">
	<div class="mb-4 flex items-center">
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="검색어를 입력하세요"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
				/>

				<button type="submit" class="absolute right-5 top-2.5 text-gray-400 hover:text-gray-900">
					<i class="ri-search-line text-lg"></i>
				</button>
			</div>
		</div>
		<div class="ml-2 flex w-1/6">
			<select
				bind:value={selectedGame}
				class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal text-gray-900"
			>
				<option value="">모든 게임</option>
				{#each gameList as game}
					<option value={game.id}>{game.title.kr}</option>
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
					<th scope="col" class="px-6 py-3">세부정보</th>
					<th scope="col" class="px-6 py-3">스킬</th>
					<th scope="col" class="px-6 py-3">출시 여부</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">편집</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedList as item}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							<div class="flex items-center">
								<img
									src={data.url + '/' + item.images.url + '.webp'}
									alt={item.name.kr}
									class="mr-3 h-10 w-10 rounded-full"
								/>

								<div>
									<div class="text-sm font-medium">{item.name.kr}</div>
									<div class="text-xs font-normal text-gray-500">
										영문 : {item.name.en}, 일본어 : {item.name.jp}
									</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<p class="text-sm font-normal">{item.game.title.kr}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getImageStatus(item.imageCount).color}"
								></div>
								<p class="text-sm font-normal">{getImageStatus(item.imageCount).status}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div class="mr-2 h-2.5 w-2.5 rounded-full {getTypeStatus(item.type).color}"></div>
								<p class="text-sm font-normal">{getTypeStatus(item.type).status}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getDetailsStatus(item.details).color}"
								></div>
								<p class="text-sm font-normal">{getDetailsStatus(item.details).status}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div
									class="mr-2 h-2.5 w-2.5 rounded-full {getSkillStatus(item.skillCount).color}"
								></div>
								<p class="text-sm font-normal">{getSkillStatus(item.skillCount).status}</p>
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
							<button
								aria-label="변수 설정"
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-code-box-line text-xl"></i>
								변수 설정
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
				<span class="font-semibold text-orange-500 dark:text-white">{characterList.length}</span> 캐릭터가
				잇습니다.
			</span>
			<div class="ml-auto mr-4 flex items-center gap-2">
				<button
					aria-label="이전 페이지"
					onclick={() => currentPage > 1 && (currentPage = currentPage - 1)}
					class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
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
								class="w-12 rounded-lg px-3 py-2 hover:bg-orange-100 hover:text-orange-600"
								onclick={() => (currentPage = pageNum)}
							>
								<p class="text-base font-medium text-orange-400">{pageNum}</p>
							</button>
						{/if}
					{/each}

					{#if currentPage + 3 < totalPages}{/if}
				</div>
				<button
					aria-label="다음 페이지"
					onclick={() => (currentPage = currentPage + 1)}
					class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
				>
					<i class="ri-arrow-right-s-line text-xl"></i>
				</button>
			</div>
		</div>
	</div>
</div>
