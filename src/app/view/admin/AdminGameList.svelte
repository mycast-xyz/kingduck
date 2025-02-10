<script lang="ts">
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { WindowService } from '../../service/WindowService';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	console.log(data.url + '/api/v0/game/list');
	let gameList: any = $state([]);

	onMount(async () => {
		await getGameList();
	});

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
</script>

<div class="mx-auto pb-4">
	<div class="mb-4 flex items-center justify-between">
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="검색어를 입력하세요"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
				/>
				<button type="submit" class="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-900">
					<i class="ri-search-line text-lg"></i>
				</button>
			</div>
		</div>
		<button
			class="inline-flex items-center rounded-lg bg-orange-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
			onclick={() => WindowService.openModal('admin-add-game')}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			게임 추가
		</button>
	</div>
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">게임이름</th>
					<th scope="col" class="px-6 py-3">총 캐릭터 수</th>
					<th scope="col" class="px-6 py-3">총 아이템 수</th>
					<th scope="col" class="px-6 py-3">총 타입 수</th>
					<th scope="col" class="px-6 py-3">상태</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">편집</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each gameList as game}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							<div class="flex items-center">
								<img
									src={data.url + '/' + game.images[0].url}
									alt={game.title.kr}
									class="mr-3 h-10 w-10 rounded-full"
								/>

								<div>
									<div class="text-sm font-medium">{game.title.kr}</div>
									<div class="text-xs font-normal text-gray-500">
										영문 : {game.title.en}, 주소 : {game.title.slug}
									</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center justify-between">
								<p>{game.characterCount}</p>
								<a
									href="/admin/character?gameId={game.id}"
									aria-label="캐릭터 관리"
									class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-external-link-line"></i>
								</a>
							</div>
						</td>

						<td class="px-6 py-4">
							<div class="flex items-center justify-between">
								<p>{game.itemCount}</p>
								<a
									href="/admin/item?gameId={game.id}"
									aria-label="아이템 관리"
									class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-external-link-line"></i>
								</a>
							</div>
						</td>

						<td class="px-6 py-4">
							<div class="flex items-center justify-between">
								<p>{game.typeCount}</p>
								<a
									href="/admin/type?gameId={game.id}"
									aria-label="타입 관리"
									class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-external-link-line"></i>
								</a>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div class="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
								활성화
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
	</div>
</div>
