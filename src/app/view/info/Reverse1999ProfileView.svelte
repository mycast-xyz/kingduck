<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 리버스1999 캐릭터 정보 — metadata.lore(reverse1999.fandom.com 보강)를 표시.
	// lore = { cv:{kor,jpn,eng,zho}, birthday, age, fragrance, medium, nameKor }.
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	const lore = $derived(listData?.lore || null);

	let rows = $derived.by(() => {
		if (!lore) return [];
		const r: { label: string; value: string }[] = [];
		if (lore.birthday) r.push({ label: '생일', value: lore.birthday });
		if (lore.age && lore.age !== 'Unknown') r.push({ label: '나이', value: lore.age });
		if (lore.medium) r.push({ label: '매개체', value: lore.medium });
		if (lore.fragrance) r.push({ label: '향', value: lore.fragrance });
		return r;
	});

	let cvRows = $derived.by(() => {
		const cv = lore?.cv || {};
		const order: Array<[string, string]> = [
			['kor', '한국어'],
			['jpn', '일본어'],
			['eng', '영어'],
			['zho', '중국어']
		];
		return order.map(([k, label]) => ({ label, value: cv[k] || '' })).filter((c) => c.value);
	});

	let hasData = $derived(rows.length > 0 || cvRows.length > 0);
</script>

<Layer title={title || '캐릭터 정보'}>
	{#if !hasData}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="space-y-5 p-4">
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
			{#if cvRows.length > 0}
				<div>
					<h4 class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">성우</h4>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{#each cvRows as cv}
							<div
								class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700/50 dark:bg-[#1d1e2e]"
							>
								<span class="block text-[10px] text-gray-400">{cv.label}</span>
								<span
									class="block break-keep text-xs font-semibold text-gray-800 dark:text-gray-200"
									>{cv.value}</span
								>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</Layer>
