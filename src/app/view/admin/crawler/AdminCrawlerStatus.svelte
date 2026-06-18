<script lang="ts">
	import { onMount } from 'svelte';
	import { toastStore } from '../../../service/ToastService';
	import type { GameType } from '../../../model/api/api';
	import client from '../../../service/api/client';

	const { gameList = [] } = $props<{ gameList: GameType[] }>();

	interface Crawler {
		id: string;
		name: string;
		type: string;
		status: string;
		lastRunTime: string | null;
		nextScheduledRun: string | null;
		itemsFound: number;
		successCount: number;
		failCount: number;
		errorMessage: string | null;
		progress: number;
		gameSlug: string;
		gameName: string;
	}

	interface CrawlerGroup {
		gameId: number;
		gameName: string;
		gameSlug: string;
		crawlers: Crawler[];
	}

	// 게임별 그룹화된 데이터
	let groupedCrawlers: CrawlerGroup[] = $state([]);

	// 모달 상태
	let showRunModal = $state(false);
	let selectedCrawlerForRun: Crawler | null = $state(null);
	let runningAllSlug: string | null = $state(null);

	onMount(async () => {
		await loadCrawlerStatus();
	});

	async function loadCrawlerStatus() {
		try {
			// API 호출
			const response = await client.get('/api/v0/admin/crawler/status');

			if (response.data.resultCode === 200) {
				// API 응답 구조: { resultCode: 200, data: [...] } 또는 { resultCode: 200, items: [...] }
				const apiData = response.data.data || response.data.items || [];
				groupedCrawlers = mapResponseToGroups(apiData);
			} else {
				console.error('크롤러 목록 조회 실패:', response.data.message);
				groupedCrawlers = [];
			}
		} catch (error) {
			console.error('크롤러 데이터 로딩 중 오류:', error);
			groupedCrawlers = [];
		}
	}

	function mapResponseToGroups(apiData: any[]): CrawlerGroup[] {
		if (!Array.isArray(apiData)) {
			console.warn('API Data is not array:', apiData);
			return [];
		}

		return apiData.map((group) => {
			const gameId = group.gameId || group.id;

			return {
				gameId: gameId,
				gameName: group.gameName,
				gameSlug: group.gameSlug,
				crawlers: (group.crawlers || []).map((c: any) => {
					// type 필드 확인 (type 또는 crawlerType)
					const type = c.type || c.crawlerType || 'unknown';

					return {
						id: `${gameId}-${type}`,
						name: c.name || getCrawlerName(type),
						type: type,
						status: c.status || 'IDLE',
						lastRunTime: c.lastRun || c.lastRunTime,
						nextScheduledRun: c.nextScheduled || c.nextScheduledRun,
						itemsFound: c.itemsFound || c.itemsCollected || 0,
						successCount: 0,
						failCount: 0,
						errorMessage: c.errorMsg || c.errorMessage || null,
						progress: c.progress || 0,
						gameSlug: group.gameSlug,
						gameName: group.gameName
					};
				})
			};
		});
	}

	function getCrawlerName(type: string): string {
		switch (type) {
			case 'character':
				return '캐릭터 크롤러';
			case 'event':
				return '이벤트 크롤러';
			case 'video':
				return '영상 크롤러';
			case 'item':
				return '아이템 크롤러';
			default:
				return `${type} 크롤러`;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'IDLE':
			case null:
				return 'bg-gray-500';
			case 'RUNNING':
				return 'bg-blue-500';
			case 'SUCCESS':
				return 'bg-green-500';
			case 'FAILED':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'IDLE':
			case null:
				return '대기';
			case 'RUNNING':
				return '실행중';
			case 'SUCCESS':
				return '성공';
			case 'FAILED':
				return '실패';
			default:
				return status;
		}
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'IDLE':
			case null:
				return 'ri-pause-circle-line';
			case 'RUNNING':
				return 'ri-loader-4-line animate-spin';
			case 'SUCCESS':
				return 'ri-checkbox-circle-line';
			case 'FAILED':
				return 'ri-error-warning-line';
			default:
				return 'ri-question-line';
		}
	}

	function formatTime(timeString: string | null): string {
		if (!timeString) return '-';
		const date = new Date(timeString);
		const now = new Date();
		const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // 분 단위

		if (diff < 60) return `${diff}분 전`;
		if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
		return `${Math.floor(diff / 1440)}일 전`;
	}

	function openRunConfirm(crawler: Crawler) {
		selectedCrawlerForRun = crawler;
		showRunModal = true;
	}

	function closeRunModal() {
		showRunModal = false;
		selectedCrawlerForRun = null;
	}

	async function handleRunConfirm() {
		if (!selectedCrawlerForRun) return;

		try {
			await client.post('/api/v0/admin/crawler/run', {
				gameSlug: selectedCrawlerForRun.gameSlug,
				crawlerType: selectedCrawlerForRun.type
			});

			toastStore.success(`크롤러 실행 요청이 전송되었습니다: ${selectedCrawlerForRun.name}`);

			// 상태 갱신
			await loadCrawlerStatus();
		} catch (error) {
			console.error('크롤러 실행 중 오류:', error);
			toastStore.error('크롤러 실행에 실패했습니다.');
		} finally {
			closeRunModal();
		}
	}

	// 게임의 모든 크롤러 타입을 한 번에 실행 요청(백엔드에서 각자 백그라운드 실행).
	async function runAllForGame(group: CrawlerGroup) {
		if (!group.crawlers.length) return;
		if (!confirm(`${group.gameName}의 크롤러 ${group.crawlers.length}개를 전체 실행할까요?`)) return;
		runningAllSlug = group.gameSlug;
		let ok = 0;
		let fail = 0;
		for (const c of group.crawlers) {
			try {
				await client.post('/api/v0/admin/crawler/run', {
					gameSlug: group.gameSlug,
					crawlerType: c.type
				});
				ok++;
			} catch (e) {
				console.error(`크롤러 실행 실패 (${group.gameSlug}/${c.type}):`, e);
				fail++;
			}
		}
		runningAllSlug = null;
		toastStore.success(`${group.gameName} 전체 실행 요청: ${ok}개${fail ? `, 실패 ${fail}` : ''}`);
		await loadCrawlerStatus();
	}

	function viewLogs(crawlerId: string) {
		toastStore.info(`로그 보기 기능은 하단 탭을 이용해주세요.`);
		// TODO: 로그 탭으로 이동 or 모달
	}
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	{#each groupedCrawlers as group}
		<div class="overflow-hidden rounded-lg bg-white shadow-md">
			<!-- 게임 헤더 -->
			<div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
				<h3 class="flex items-center gap-2 text-lg font-bold text-gray-900">
					<i class="ri-gamepad-line text-orange-500"></i>
					{group.gameName}
				</h3>
				<button
					onclick={() => runAllForGame(group)}
					disabled={runningAllSlug === group.gameSlug}
					class="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
				>
					<i class="ri-play-list-2-line mr-1"></i>
					{runningAllSlug === group.gameSlug ? '요청 중…' : '전체 실행'}
				</button>
			</div>

			<!-- 크롤러 리스트 -->
			<div class="divide-y divide-gray-100">
				{#each group.crawlers as crawler}
					<div class="p-6 transition-colors hover:bg-gray-50">
						<div class="mb-4 flex items-start justify-between">
							<div>
								<h4 class="text-base font-medium text-gray-900">{crawler.name}</h4>
								<p class="mt-1 text-xs text-gray-500">ID: {crawler.id}</p>
							</div>
							<span
								class="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold {getStatusColor(
									crawler.status
								)} text-white"
							>
								<i class={getStatusIcon(crawler.status)}></i>
								{getStatusText(crawler.status)}
							</span>
						</div>

						<!-- 상태 정보 -->
						<div class="mb-4 grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="mb-1 text-xs text-gray-500">마지막 실행</p>
								<p class="font-medium text-gray-900">{formatTime(crawler.lastRunTime)}</p>
							</div>
							<div>
								<p class="mb-1 text-xs text-gray-500">수집된 아이템</p>
								<p class="font-medium text-gray-900">{crawler.itemsFound}개</p>
							</div>
						</div>

						<!-- 진행률 (실행중일 때 - API 지원 시 활성화) -->
						{#if crawler.status === 'RUNNING' && crawler.progress > 0}
							<div class="mb-4">
								<div class="mb-1 flex justify-between text-xs">
									<span class="text-gray-600">진행률</span>
									<span class="font-medium text-blue-600">{crawler.progress}%</span>
								</div>
								<div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
									<div
										class="h-full rounded-full bg-blue-500 transition-all duration-500"
										style="width: {crawler.progress}%"
									></div>
								</div>
							</div>
						{/if}

						<!-- 에러 메시지 -->
						{#if crawler.errorMessage}
							<div class="mb-4 flex items-start gap-2 rounded bg-red-50 p-3 text-xs text-red-700">
								<i class="ri-error-warning-fill mt-0.5"></i>
								<span>{crawler.errorMessage}</span>
							</div>
						{/if}

						<!-- 액션 버튼 -->
						<div class="flex gap-2">
							<button
								onclick={() => openRunConfirm(crawler)}
								class="flex-1 rounded-md bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={crawler.status === 'RUNNING'}
							>
								<i class="ri-play-circle-line mr-1"></i>
								{crawler.status === 'RUNNING' ? '실행중' : '실행'}
							</button>
							<button
								onclick={() => viewLogs(crawler.id)}
								class="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
							>
								<i class="ri-file-list-line mr-1"></i>
								로그
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<!-- 크롤러가 없는 경우 -->
{#if groupedCrawlers.length === 0}
	<div class="rounded-lg bg-white p-12 text-center shadow-md">
		<i class="ri-robot-line mb-4 text-6xl text-gray-400"></i>
		<h3 class="mb-2 text-lg font-semibold text-gray-900">등록된 크롤러가 없습니다</h3>
		<p class="text-sm text-gray-600">크롤러를 설정하여 자동 데이터 수집을 시작하세요.</p>
	</div>
{/if}

<!-- 실행 확인 모달 -->
{#if showRunModal && selectedCrawlerForRun}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h3 class="mb-4 text-lg font-bold text-gray-900">크롤러 실행 확인</h3>
			<p class="mb-2 text-gray-700">
				<span class="font-semibold text-orange-600">{selectedCrawlerForRun.gameName}</span>의
				<span class="font-semibold">{selectedCrawlerForRun.name}</span>를 실행하시겠습니까?
			</p>
			<p class="mb-6 text-sm text-gray-500">
				크롤러 실행 중에는 시스템 리소스가 사용되며, 중복 실행은 불가능합니다.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={closeRunModal}
					class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					취소
				</button>
				<button
					onclick={handleRunConfirm}
					class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
				>
					실행
				</button>
			</div>
		</div>
	</div>
{/if}
