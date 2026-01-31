<script lang="ts">
	import { onMount } from 'svelte';
	import { register } from 'swiper/element/bundle';
	import ContentLayer from '../../view-framework/content/ContentLayer.svelte';
	import TeamMember from './TeamMember.svelte';

	// Props
	interface TeamData {
		TeamID: number;
		AvatarID: number;
		Position: number;
		MemberList: number[];
		BackupList1: number[];
		BackupList2: number[];
		BackupList3: number[];
	}

	const { listData, currentUrl, isMobile, gameId, initData, gameSlug } = $props<{
		listData?: TeamData[];
		currentUrl?: string;
		isMobile?: boolean;
		gameId?: number;
		initData?: any;
		gameSlug?: string; // Passed from parent
	}>();

	// Swiper 등록
	onMount(() => {
		register();
	});

	// 팀 구성 데이터 처리
	let teams = $derived(Array.isArray(listData) ? listData : []);

	// 백업 슬롯 상태 관리 (어떤 팀의 몇 번째 슬롯이 활성화되었는지)
	// format: `${teamIdx}-${slotIdx}`
	let activeBackupKey = $state<string | null>(null);

	function toggleBackups(teamIdx: number, slotIdx: number) {
		const key = `${teamIdx}-${slotIdx}`;
		if (activeBackupKey === key) {
			activeBackupKey = null;
		} else {
			activeBackupKey = key;
		}
	}

	// 팀 슬롯 생성 헬퍼
	function getTeamSlots(team: TeamData) {
		return [
			{ main: team.AvatarID, backups: [] },
			{ main: team.MemberList[0], backups: team.BackupList1 },
			{ main: team.MemberList[1], backups: team.BackupList2 },
			{ main: team.MemberList[2], backups: team.BackupList3 }
		];
	}
</script>

<ContentLayer title={initData?.title || '추천 팀 구성'}>
	<div class="space-y-8 p-4">
		{#if teams.length === 0}
			<div
				class="py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
			>
				<div class="mb-2 text-2xl">📋</div>
				추천 조합 데이터가 없습니다.
			</div>
		{/if}

		{#each teams as team, idx}
			<div class="overflow-hidden">
				<!-- 팀 헤더 -->
				<div
					class="flex flex-col items-start border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/30 sm:flex-row sm:items-center sm:justify-between"
				>
					<div class="flex items-center">
						<span
							class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-sm"
						>
							{idx + 1}
						</span>
						<h3 class="text-base font-bold text-gray-900 dark:text-gray-100">
							추천 조합 #{idx + 1}
						</h3>
					</div>
				</div>

				<!-- 캐릭터 리스트 -->
				<div class="p-3 sm:p-5">
					<div class="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
						{#each getTeamSlots(team) as slot, slotIdx}
							<div
								class="flex flex-col items-center gap-2 min-h-[120px] sm:min-h-[200px] justify-start"
							>
								<!-- 메인 캐릭터 -->
								<TeamMember
									originalId={slot.main}
									gameId={gameId || 0}
									{currentUrl}
									{initData}
									{isMobile}
									isMain={slotIdx === 0}
								/>

								<!-- 백업 토글 버튼 -->
								{#if slot.backups && slot.backups.length > 0}
									<button
										class="flex items-center justify-center gap-1 rounded-full font-bold transition-all
                                            px-2 py-1 text-[9px] sm:px-4 sm:py-2 sm:text-xs
                                            {activeBackupKey === `${idx}-${slotIdx}`
											? 'bg-orange-500 text-white shadow-md'
											: 'bg-gray-100/80 text-gray-500 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-400'}"
										onclick={() => toggleBackups(idx, slotIdx)}
									>
										<i
											class={activeBackupKey === `${idx}-${slotIdx}`
												? 'ri-close-line'
												: 'ri-add-line'}
										></i>
										<span>BACKUP</span>
									</button>
								{:else}
									<!-- 버튼이 없는 슬롯도 공간을 차지하도록 유지 (정렬 목적) -->
									<div class="h-[22px] sm:h-[32px]"></div>
								{/if}
							</div>
						{/each}
					</div>

					<!-- 백업 캐릭터 캐러셀 (활성화 시 표시) -->
					{#each getTeamSlots(team) as slot, slotIdx}
						{#if activeBackupKey === `${idx}-${slotIdx}`}
							<div
								class="mt-4 rounded-xl bg-gray-50/50 p-4 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50"
							>
								<div class="mb-3 flex items-center justify-between px-1">
									<span class="text-xs font-bold text-gray-500 dark:text-gray-400">
										대체 가능 캐릭터
									</span>
									<span class="text-[10px] text-gray-400">
										<i class="ri-arrow-left-right-line mr-1"></i>스와이프하여 보기
									</span>
								</div>
								<swiper-container
									slides-per-view={isMobile ? 3.5 : 5.5}
									space-between="10"
									free-mode="true"
									class="w-full"
								>
									{#each slot.backups as backupId}
										<swiper-slide>
											<div class="w-full">
												<TeamMember
													originalId={backupId}
													gameId={gameId || 0}
													{currentUrl}
													{initData}
													{isMobile}
												/>
											</div>
										</swiper-slide>
									{/each}
								</swiper-container>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</ContentLayer>

<style>
</style>
