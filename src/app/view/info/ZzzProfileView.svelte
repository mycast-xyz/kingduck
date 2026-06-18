<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// ZZZ 캐릭터 정보 — metadata에서 공격타입/소속 표시(속성/특성은 헤더에서 노출).
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
		if (meta.attackType) r.push({ label: '공격 타입', value: meta.attackType });
		if (meta.faction) r.push({ label: '소속', value: meta.faction });
		return r;
	});

	let hasData = $derived(rows.length > 0);
</script>

<Layer title={title || '캐릭터 정보'}>
	{#if !hasData}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
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
</Layer>
