<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 캐릭터 프로필/도감 정보. 원신 metadata(fetter/birthday/region)를 읽어 표시한다.
	// listData로 metadata 전체를 받는다(ContentView에서 meta를 그대로 전달).
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	const meta = $derived(listData || {});
	const fetter = $derived(meta.fetter || {});

	// 지역 영문 키 → 한글
	const REGION: Record<string, string> = {
		MONDSTADT: '몬드',
		LIYUE: '리월',
		INAZUMA: '이나즈마',
		SUMERU: '수메르',
		FONTAINE: '폰타인',
		NATLAN: '나타',
		SNEZHNAYA: '스네즈나야'
	};

	let birthday = $derived.by(() => {
		const b = meta.birthday;
		if (Array.isArray(b) && b.length === 2 && b[0] && b[1]) return `${b[0]}월 ${b[1]}일`;
		return '';
	});
	let region = $derived(meta.region ? REGION[meta.region] || meta.region : '');

	// 값 있는 항목만 노출
	let rows = $derived.by(() => {
		const r: { label: string; value: string }[] = [];
		if (fetter.title) r.push({ label: '칭호', value: fetter.title });
		if (fetter.native) r.push({ label: '소속', value: fetter.native });
		if (region) r.push({ label: '지역', value: region });
		if (birthday) r.push({ label: '생일', value: birthday });
		if (fetter.constellation) r.push({ label: '운명의 자리', value: fetter.constellation });
		return r;
	});

	// 성우(한국어/일본어/영어/중국어)
	let cvRows = $derived.by(() => {
		const cv = fetter.cv || {};
		const order: [string, string][] = [
			['KR', '한국어'],
			['JP', '일본어'],
			['EN', '영어'],
			['CHS', '중국어']
		];
		return order.filter(([k]) => cv[k]).map(([k, label]) => ({ label, value: cv[k] }));
	});

	let intro = $derived(fetter.detail || meta.description || '');
	let hasData = $derived(rows.length > 0 || cvRows.length > 0 || !!intro);
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
							<span class="w-24 shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400"
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
