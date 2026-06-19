<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 블루 아카이브(Blue Archive) 학생 정보 — metadata에서 학교/공격·방어속성/역할/CV/생일 등을 표시.
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
		if (meta.fullName) r.push({ label: '이름', value: meta.fullName });
		if (meta.schoolKo) r.push({ label: '학교', value: meta.schoolKo });
		if (meta.clubKo) r.push({ label: '동아리', value: meta.clubKo });
		if (meta.roleKo) r.push({ label: '역할', value: meta.roleKo });
		if (meta.elementKo) r.push({ label: '공격 속성', value: meta.elementKo });
		if (meta.pathKo) r.push({ label: '방어 속성', value: meta.pathKo });
		if (meta.squadTypeKo) r.push({ label: '구분', value: meta.squadTypeKo });
		if (meta.position) r.push({ label: '포지션', value: meta.position });
		if (meta.age) r.push({ label: '나이', value: meta.age });
		if (meta.birthday) r.push({ label: '생일', value: meta.birthday });
		if (meta.cv) r.push({ label: '성우', value: meta.cv });
		if (meta.illustrator) r.push({ label: '일러스트', value: meta.illustrator });
		if (meta.hobby) r.push({ label: '취미', value: meta.hobby });
		return r;
	});

	let intro = $derived(meta.description || '');
	let hasData = $derived(rows.length > 0 || !!intro);
</script>

<Layer title={title || '학생 정보'}>
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
