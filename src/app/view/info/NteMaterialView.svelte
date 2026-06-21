<script lang="ts">
	// 이환(NTE) 재료/선물 뷰.
	// listData 두 형태 모두 처리:
	//  - 돌파(breakthrough): [{ level, materials: [{name,icon,amount}] }] → 레벨별 그룹
	//  - 선호 선물(gifts):    [{name,icon,amount}]                        → 평면 그리드
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	type Mat = { name: string; icon?: string; amount?: number };
	type Group = { level?: string; materials: Mat[] };

	const { listData, currentUrl, initData, title } = $props<{
		listData: any;
		currentUrl: string;
		initData?: any;
		title?: string;
	}>();

	const rows = $derived(Array.isArray(listData) ? listData : []);
	// 첫 항목에 materials가 있으면 레벨 그룹(돌파), 없으면 평면(선물).
	const grouped = $derived(rows.length > 0 && rows[0]?.materials !== undefined);
	const groups = $derived<Group[]>(grouped ? rows : [{ materials: rows as Mat[] }]);
</script>

<Layer title={title || initData?.name || '재료'}>
	{#if rows.length === 0}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="p-3">
			{#each groups as g}
				<div class="mb-4 last:mb-0">
					{#if grouped}
						<h5 class="mb-2 text-sm font-bold text-gray-700 dark:text-gray-200">Lv. {g.level}</h5>
					{/if}
					<div class="flex flex-wrap gap-3">
						{#each g.materials as m}
							<div class="flex w-16 flex-col items-center">
								<div
									class="relative h-12 w-12 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
								>
									{#if m.icon}
										<img
											class="h-full w-full object-contain p-1"
											src="{currentUrl}/{m.icon}"
											alt={m.name}
											loading="lazy"
										/>
									{/if}
									{#if m.amount}
										<span
											class="absolute -bottom-1 -right-1 rounded bg-gray-800/90 px-1 text-[10px] font-bold text-white"
											>{m.amount}</span
										>
									{/if}
								</div>
								<span
									class="mt-1 line-clamp-2 text-center text-[10px] leading-tight text-gray-600 dark:text-gray-300"
									>{m.name}</span
								>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Layer>
