<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 니케 캐릭터 정보 — metadata 전체를 받아 클래스/버스트/제조사/소속/무기 + 성우를 표시.
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	const meta = $derived(listData || {});

	const CLASS_KR: Record<string, string> = {
		attacker: '화력형',
		defender: '방어형',
		supporter: '지원형'
	};
	const MAKER_KR: Record<string, string> = {
		elysion: '엘리시온',
		missilis: '미실리스',
		tetra: '테트라',
		pilgrim: '필그림',
		abnormal: '어브노멀'
	};
	const BURST_KR: Record<string, string> = { '1': 'I', '2': 'II', '3': 'III' };

	let rows = $derived.by(() => {
		const r: { label: string; value: string }[] = [];
		const cls = (meta.class || '').toLowerCase();
		const mk = (meta.manufacturer || '').toLowerCase();
		if (cls) r.push({ label: '클래스', value: CLASS_KR[cls] || meta.class });
		if (meta.burst) r.push({ label: '버스트', value: BURST_KR[String(meta.burst)] || meta.burst });
		if (mk) r.push({ label: '제조사', value: MAKER_KR[mk] || meta.manufacturer });
		if (meta.squad) r.push({ label: '소속', value: meta.squad });
		if (meta.weaponName) r.push({ label: '무기', value: meta.weaponName });
		return r;
	});

	let cvRows = $derived.by(() => {
		const cv = meta.cv || {};
		const order: Array<[string, string]> = [
			['kor', '한국어'],
			['jpn', '일본어'],
			['eng', '영어']
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
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
