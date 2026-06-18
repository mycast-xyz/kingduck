<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import { sanitizeHtml } from '../../util/sanitize';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 캐릭터 스토리(접이식). { title, text } 배열을 받아 카드로 렌더한다.
	// text는 <br/> 등 HTML을 포함하므로 sanitize 후 표시.
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	let stories = $derived.by(() => {
		const raw = Array.isArray(listData) ? listData : [];
		return raw
			.map((s: any) => ({ title: s.title || s.Title || '', text: s.text || s.Text || '' }))
			.filter((s: { text: string }) => s.text);
	});

	// 첫 항목(캐릭터 상세)만 기본 펼침
	let openIdx = $state(0);
	function toggle(i: number) {
		openIdx = openIdx === i ? -1 : i;
	}
</script>

<Layer title={title || '캐릭터 스토리'}>
	{#if stories.length === 0}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="space-y-2 p-4">
			{#each stories as story, i}
				<div class="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700/50">
					<button
						class="flex w-full items-center justify-between gap-2 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-[#1d1e2e] dark:hover:bg-gray-700/50"
						onclick={() => toggle(i)}
					>
						<span class="text-sm font-bold text-gray-900 dark:text-gray-100"
							>{story.title || `스토리 ${i + 1}`}</span
						>
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
							{@html sanitizeHtml(story.text)}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</Layer>
