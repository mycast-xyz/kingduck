<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 블루 아카이브(Blue Archive) 학생 정보 — metadata에서 학교/공격·방어속성/역할/CV/생일 + 스탯/지형적응/무기를 표시.
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

	const fmt = (n: unknown) => {
		const v = Number(n);
		return Number.isFinite(v) ? v.toLocaleString('en-US') : '';
	};

	// 기본 스탯(만렙) — 공격/HP/방어/회복/회피/명중/치명.
	let statRows = $derived.by(() => {
		const s = meta.stats || {};
		const defs: [string, string][] = [
			['AttackPower', '공격력'],
			['MaxHP', 'HP'],
			['DefensePower', '방어력'],
			['HealPower', '회복력'],
			['DodgePoint', '회피'],
			['AccuracyPoint', '명중'],
			['CriticalPoint', '치명']
		];
		return defs
			.filter(([k]) => s[k] != null)
			.map(([k, label]) => ({ label, value: fmt(s[k]) }));
	});

	// 지형 적응 0~5 → D/C/B/A/S/SS 등급 + 색상.
	const ADAPT_GRADE = ['D', 'C', 'B', 'A', 'S', 'SS'];
	const ADAPT_COLOR: Record<string, string> = {
		SS: 'bg-rose-500',
		S: 'bg-amber-500',
		A: 'bg-violet-500',
		B: 'bg-sky-500',
		C: 'bg-emerald-500',
		D: 'bg-gray-400'
	};
	const grade = (v: unknown): string | null => {
		const n = Number(v);
		if (!Number.isFinite(n) || n < 0 || n > 5) return null;
		return ADAPT_GRADE[n];
	};
	let terrainRows = $derived.by(() => {
		const t = meta.terrain || {};
		const defs: [string, unknown][] = [
			['시가전', t.street],
			['야전', t.outdoor],
			['실내전', t.indoor]
		];
		return defs
			.map(([label, v]) => ({ label, grade: grade(v) }))
			.filter((x) => x.grade !== null) as { label: string; grade: string }[];
	});

	let weaponRows = $derived.by(() => {
		const r: { label: string; value: string }[] = [];
		if (meta.weaponType) r.push({ label: '무기 종류', value: meta.weaponType });
		if (meta.weaponName) r.push({ label: '고유 무기', value: meta.weaponName });
		if (meta.gearName) r.push({ label: '고유 장비', value: meta.gearName });
		if (Array.isArray(meta.equipment) && meta.equipment.length > 0)
			r.push({ label: '장비 슬롯', value: meta.equipment.join(' · ') });
		return r;
	});

	let intro = $derived(meta.description || '');
	let hasData = $derived(
		rows.length > 0 ||
			statRows.length > 0 ||
			terrainRows.length > 0 ||
			weaponRows.length > 0 ||
			!!intro
	);
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

			{#if terrainRows.length > 0}
				<div>
					<h4 class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">지형 적응</h4>
					<div class="grid grid-cols-3 gap-2">
						{#each terrainRows as t}
							<div
								class="flex flex-col items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700/50 dark:bg-[#1d1e2e]"
							>
								<span class="text-xs text-gray-500 dark:text-gray-400">{t.label}</span>
								<span
									class="flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold text-white {ADAPT_COLOR[
										t.grade
									] || 'bg-gray-400'}">{t.grade}</span
								>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if statRows.length > 0}
				<div>
					<h4 class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">기본 스탯 (만렙)</h4>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{#each statRows as st}
							<div
								class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700/50 dark:bg-[#1d1e2e]"
							>
								<span class="block text-[10px] text-gray-400">{st.label}</span>
								<span class="block text-sm font-bold text-gray-900 dark:text-gray-100">{st.value}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if weaponRows.length > 0}
				<div>
					<h4 class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">무기 / 장비</h4>
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{#each weaponRows as w}
							<div
								class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700/50 dark:bg-[#1d1e2e]"
							>
								<span class="w-20 shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400"
									>{w.label}</span
								>
								<span class="break-keep text-sm font-semibold text-gray-900 dark:text-gray-100"
									>{w.value}</span
								>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</Layer>
