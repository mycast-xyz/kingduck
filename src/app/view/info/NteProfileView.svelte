<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 이환(NTE) 캐릭터 정보 — metadata에서 진영/생일/이능력/형질 등을 표시.
	// listData로 metadata 전체를 받는다(ContentView에서 meta를 그대로 전달).
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	const meta = $derived(listData || {});

	let rows = $derived.by(() => {
		const r: { label: string; value: string }[] = [];
		if (meta.abilityName) r.push({ label: '이능력', value: meta.abilityName });
		if (meta.faction) r.push({ label: '진영', value: meta.faction });
		if (meta.path) r.push({ label: '형질', value: meta.path });
		if (meta.birthday) r.push({ label: '생일', value: meta.birthday });
		return r;
	});

	let intro = $derived(meta.description || '');
	let hasData = $derived(rows.length > 0 || !!intro);
</script>

<Layer title={title || '캐릭터 정보'}>
	{#if !hasData}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="space-y-5 p-4">
			{#if intro}
				<p class="break-keep text-sm leading-relaxed text-gray-600 dark:text-gray-300">{intro}</p>
			{/if}
			{#if rows.length > 0}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each rows as row}
						<div
							class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700/50 dark:bg-[#1d1e2e]"
						>
							<span class="w-20 shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400"
								>{row.label}</span
							>
							<span class="break-keep text-sm font-semibold text-gray-900 dark:text-gray-100"
								>{row.value}</span
							>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Layer>
