<script lang="ts">
	import { onMount } from 'svelte';
	import client from '../../../service/api/client';
	import type { GameType } from '../../../model/api/api';
	import { toastStore } from '../../../service/ToastService';

	const { gameList = [] } = $props<{ gameList: GameType[] }>();

	// 로그 데이터
	let logs: any[] = $state([]);

	// 필터 상태
	let selectedGame = $state(''); // 전체 선택으로 변경 (필터링 문제 방지)
	let selectedStatus = $state('');
	let selectedType = $state('');

	// 로딩 상태
	let isLoading = $state(false);

	// 페이지네이션 (API가 지원한다면)
	let page = $state(1);
	let limit = $state(20);

	onMount(async () => {
		await loadLogs();
	});

	async function loadLogs() {
		isLoading = true;
		try {
			const params: any = {
				page,
				limit
			};

			// gameId 찾기 (이름으로)
			// 실제로는 gameId를 select option value로 써야 함.
			// 여기서는 selectedGame이 이름이라고 가정하고 API에는 그대로 보낼 수 없으니 gameId 매핑이 필요하거나,
			// UI를 gameId 기반으로 변경해야 함.
			// 편의상 API가 지원하는 파라미터에 맞게 수정.

			if (selectedGame) params.gameId = selectedGame; // value를 ID로 설정해야 함
			if (selectedStatus) params.status = selectedStatus;
			if (selectedType) params.crawlerType = selectedType;

			const response = await client.get('/api/v0/admin/crawler/logs', { params });

			console.log('API Response:', response.data);

			if (response.data.resultCode === 200) {
				const data = response.data;
				// 사용자가 제공한 구조: { resultCode: 200, data: { items: [] } }
				// 따라서 data.data.items를 먼저 확인해야 함
				let items;

				if (data.data && Array.isArray(data.data.items)) {
					items = data.data.items;
				} else if (Array.isArray(data.items)) {
					items = data.items;
				} else if (data.data && Array.isArray(data.data.list)) {
					items = data.data.list;
				} else if (Array.isArray(data.list)) {
					items = data.list;
				} else if (Array.isArray(data.data)) {
					items = data.data;
				} else {
					items = [];
				}

				logs = items;

				if (!Array.isArray(logs)) {
					console.warn('Logs is not array:', logs);
					logs = [];
				}
			} else {
				console.log('로그 조회 실패:', response.data.message);
				logs = [];
			}
		} catch (error) {
			console.error('로그 로딩 중 오류:', error);
			logs = [];
		} finally {
			isLoading = false;
		}
	}

	// 게임 목록 (API 연동 시 props로 받거나 별도 조회 필요)
	// 여기서는 logs에서 추출할 수 없으므로 (logs가 비어있을 수 있음)
	// 일단 하드코딩하거나 상위에서 받아야 함.
	// AdminCrawlerStatus처럼 gameList를 받는게 좋음.
	// 하지만 지금은 변경 범위를 최소화하기 위해 생략하거나 더미로 둠.
	// -> 상위에서 gameList를 넘겨주는게 베스트.

	function getStatusBadge(status: string): string {
		switch (status) {
			case 'SUCCESS':
				return 'bg-green-100 text-green-700';
			case 'FAILED':
				return 'bg-red-100 text-red-700';
			case 'RUNNING':
				return 'bg-blue-100 text-blue-700';
			case 'PARTIAL':
				return 'bg-yellow-100 text-yellow-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'SUCCESS':
				return '성공';
			case 'FAILED':
				return '실패';
			case 'RUNNING':
				return '실행중';
			case 'PARTIAL':
				return '부분 성공';
			default:
				return status;
		}
	}

	function formatDateTime(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleString('ko-KR', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function calculateDuration(startTime: string, endTime: string | null): string {
		if (!endTime) return '-';
		const start = new Date(startTime).getTime();
		const end = new Date(endTime).getTime();
		const durationMs = end - start;
		const seconds = Math.floor(durationMs / 1000);
		const minutes = Math.floor(seconds / 60);

		if (minutes > 0) {
			return `${minutes}분 ${seconds % 60}초`;
		}
		return `${seconds}초`;
	}

	function viewDetails(logId: string) {
		toastStore.info(`로그 상세 정보 기능은 준비 중입니다. (ID: ${logId})`);
	}

	function handleSearch() {
		page = 1;
		loadLogs();
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-md">
	<!-- 필터 영역 -->
	<div class="mb-4 flex items-center gap-3">
		<select
			bind:value={selectedGame}
			onchange={handleSearch}
			class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
		>
			<option value="">모든 게임</option>
			{#each gameList as game}
				<option value={game.id}>{game.name}</option>
			{/each}
		</select>

		<select
			bind:value={selectedStatus}
			onchange={handleSearch}
			class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
		>
			<option value="">모든 상태</option>
			<option value="SUCCESS">성공</option>
			<option value="FAILED">실패</option>
			<option value="RUNNING">실행중</option>
			<option value="PARTIAL">부분 성공</option>
		</select>

		<select
			bind:value={selectedType}
			onchange={handleSearch}
			class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
		>
			<option value="">모든 타입</option>
			<option value="character">캐릭터</option>
			<option value="event">이벤트</option>
		</select>

		<div class="ml-auto text-sm text-gray-600">
			총 <span class="font-semibold text-orange-500">{logs.length}</span>개 로그
		</div>
	</div>

	<!-- 로그 테이블 -->
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">실행 시간</th>
					<th scope="col" class="px-6 py-3">크롤러</th>
					<th scope="col" class="px-6 py-3">게임</th>
					<th scope="col" class="px-6 py-3">상태</th>
					<th scope="col" class="px-6 py-3">수집 개수</th>
					<th scope="col" class="px-6 py-3">소요 시간</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">액션</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#if isLoading}
					<tr>
						<td colspan="7" class="py-8 text-center text-gray-500">
							<i class="ri-loader-4-line animate-spin text-2xl"></i>
							<p class="mt-2">로그를 불러오는 중...</p>
						</td>
					</tr>
				{:else}
					{#each logs as log}
						<tr class="border-b bg-white hover:bg-gray-50">
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900">
									{formatDateTime(log.startTime)}
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm font-medium text-gray-900">{log.crawlerType}</div>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900">{log.game?.name || '-'}</div>
							</td>
							<td class="px-6 py-4">
								<span
									class="rounded-full px-2 py-1 text-xs font-medium {getStatusBadge(log.status)}"
								>
									{getStatusText(log.status)}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900">{log.itemsFound}개</div>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-gray-900">
									{calculateDuration(log.startTime, log.endTime)}
								</div>
							</td>
							<td class="px-6 py-4 text-right">
								<button
									onclick={() => viewDetails(log.id)}
									class="rounded-lg px-3 py-2 text-sm font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-eye-line mr-1"></i>
									상세
								</button>
							</td>
						</tr>
						{#if log.errorMsg}
							<tr class="border-b bg-red-50">
								<td colspan="7" class="px-6 py-3">
									<div class="flex items-center gap-2 text-sm text-red-700">
										<i class="ri-error-warning-line"></i>
										<span class="font-medium">메시지:</span>
										<span>{log.errorMsg}</span>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- 로그가 없는 경우 -->
	{#if !isLoading && logs.length === 0}
		<div class="py-12 text-center">
			<i class="ri-file-list-line mb-4 text-6xl text-gray-400"></i>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">로그가 없습니다</h3>
			<p class="text-sm text-gray-600">검색 조건에 맞는 로그가 없거나 실행 이력이 없습니다.</p>
		</div>
	{/if}
</div>
