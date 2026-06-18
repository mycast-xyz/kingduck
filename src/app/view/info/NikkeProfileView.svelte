<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 니케 캐릭터 정보 — metadata 전체에서 기본정보/성우/스탯/배경/코스튬을 표시.
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
	const CORP_KR: Record<string, string> = {
		elysion: '엘리시온',
		missilis: '미실리스',
		tetra: '테트라',
		pilgrim: '필그림',
		abnormal: '어브노멀'
	};
	const ELEMENT_KR: Record<string, string> = {
		fire: '작열',
		water: '수냉',
		wind: '풍압',
		electric: '전격',
		iron: '철갑'
	};
	const BURST_KR: Record<string, string> = {
		step1: 'I',
		step2: 'II',
		step3: 'III',
		'1': 'I',
		'2': 'II',
		'3': 'III'
	};

	const lc = (v: unknown) => String(v ?? '').toLowerCase();

	let rows = $derived.by(() => {
		const r: { label: string; value: string }[] = [];
		if (meta.class) r.push({ label: '클래스', value: CLASS_KR[lc(meta.class)] || meta.class });
		if (meta.burst) r.push({ label: '버스트', value: BURST_KR[lc(meta.burst)] || meta.burst });
		if (meta.corp) r.push({ label: '제조사', value: CORP_KR[lc(meta.corp)] || meta.corp });
		if (meta.element) r.push({ label: '코드', value: ELEMENT_KR[lc(meta.element)] || meta.element });
		if (meta.path) r.push({ label: '무기', value: meta.path });
		if (meta.squad) r.push({ label: '소속', value: meta.squad });
		return r;
	});

	// cv는 "CV : 한국어 / CV : 일본어" 형태의 문자열. 분리해서 성우 카드로.
	let cvRows = $derived.by(() => {
		const raw = String(meta.cv || '').trim();
		if (!raw) return [];
		const parts = raw
			.split('/')
			.map((p) => p.replace(/CV\s*[:：]/i, '').trim())
			.filter(Boolean);
		const labels = ['한국어', '일본어', '영어'];
		return parts.map((value, i) => ({ label: labels[i] || '성우', value }));
	});

	const fmt = (n: unknown) => {
		const v = Number(n);
		return Number.isFinite(v) ? v.toLocaleString('en-US') : '';
	};
	// criticalRatio/criticalDamage는 ×100 정수(1500=15.00%). 100으로 나눠 표기.
	const pct = (n: unknown) => {
		const v = Number(n);
		return Number.isFinite(v) ? `${(v / 100).toFixed(2)}%` : '';
	};

	let statRows = $derived.by(() => {
		const s = meta.stats || {};
		const r: { label: string; value: string }[] = [];
		if (s.hpMax != null) r.push({ label: 'HP', value: fmt(s.hpMax) });
		if (s.atkMax != null) r.push({ label: '공격력', value: fmt(s.atkMax) });
		if (s.defMax != null) r.push({ label: '방어력', value: fmt(s.defMax) });
		if (s.criticalRatio != null) r.push({ label: '치명타 확률', value: pct(s.criticalRatio) });
		if (s.criticalDamage != null) r.push({ label: '치명타 피해', value: pct(s.criticalDamage) });
		return r;
	});

	let lore = $derived(String(meta.lore || '').trim());

	// 코스튬은 별도 CostumeView(스킨 이미지)에서 표시한다.
	let hasData = $derived(rows.length > 0 || cvRows.length > 0 || statRows.length > 0 || !!lore);
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
								<span class="block break-keep text-xs font-semibold text-gray-800 dark:text-gray-200"
									>{cv.value}</span
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

			{#if lore}
				<div>
					<h4 class="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">배경</h4>
					<p
						class="whitespace-pre-line break-keep rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:border-gray-700/50 dark:bg-[#1d1e2e] dark:text-gray-300"
					>
						{lore}
					</p>
				</div>
			{/if}

		</div>
	{/if}
</Layer>
