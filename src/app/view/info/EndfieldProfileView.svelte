<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { sanitizeHtml } from '../../util/sanitize';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 엔드필드 캐릭터 프로필 — metadata 전체를 받아 성우(cvName) + 프로필 기록(profileRecord)을 표시.
	// profileRecord[].recordDesc.text는 아크나이츠 리치텍스트 마커(`<@tag>...</>`)와 \n을 포함한다.
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	const meta = $derived(listData || {});

	// 성우: cvName.{Kor,Jap,Eng,Chi}CVName.text
	let cvRows = $derived.by(() => {
		const cv = meta.cvName || {};
		const order: Array<[string, string]> = [
			['KorCVName', '한국어'],
			['JapCVName', '일본어'],
			['EngCVName', '영어'],
			['ChiCVName', '중국어']
		];
		return order
			.map(([k, label]) => ({ label, value: cv[k]?.text || '' }))
			.filter((r) => r.value);
	});

	// 아크나이츠 리치텍스트 마커 제거 + 줄바꿈 → <br>.
	function clean(raw: string): string {
		return (raw || '')
			.replace(/<@[^>]*>/g, '') // 여는 태그 <@profile.key> 등
			.replace(/<\/>/g, '') // 닫는 태그 </>
			.replace(/\r?\n/g, '<br/>')
			.trim();
	}

	let records = $derived.by(() => {
		const recs = Array.isArray(meta.profileRecord) ? meta.profileRecord : [];
		return recs
			.map((r: any, i: number) => ({
				title: r.recordTitle?.text || (i === 0 ? '프로필' : `기록 ${i}`),
				text: clean(r.recordDesc?.text || '')
			}))
			.filter((r: { text: string }) => r.text);
	});

	let openIdx = $state(0);
	function toggle(i: number) {
		openIdx = openIdx === i ? -1 : i;
	}

	let hasData = $derived(cvRows.length > 0 || records.length > 0);
</script>

<Layer title={title || '캐릭터 정보'}>
	{#if !hasData}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="space-y-5 p-4">
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
			{#if records.length > 0}
				<div class="space-y-2">
					{#each records as record, i}
						<div class="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700/50">
							<button
								class="flex w-full items-center justify-between gap-2 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-[#1d1e2e] dark:hover:bg-gray-700/50"
								onclick={() => toggle(i)}
							>
								<span class="text-sm font-bold text-gray-900 dark:text-gray-100">{record.title}</span>
								<i
									class="ri-arrow-down-s-line text-lg text-gray-400 transition-transform {openIdx === i
										? 'rotate-180'
										: ''}"
								></i>
							</button>
							{#if openIdx === i}
								<div
									class="break-keep px-4 py-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
								>
									{@html sanitizeHtml(record.text)}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</Layer>
