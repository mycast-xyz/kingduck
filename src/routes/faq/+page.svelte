<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';
	import SeoHead from '../../app/view/SeoHead.svelte';
	import type { FaqType } from '../../app/model/api/api';

	const { data } = $props<{ data: { faqs: FaqType[] } }>();

	let openId = $state<number | null>(null);

	// 카테고리별 그룹 (sortOrder 오름차순)
	let grouped = $derived.by(() => {
		const sorted = [...data.faqs].sort((a, b) => a.sortOrder - b.sortOrder);
		const map = new Map<string, FaqType[]>();
		for (const faq of sorted) {
			const key = faq.category ?? '일반';
			const arr = map.get(key) ?? [];
			arr.push(faq);
			map.set(key, arr);
		}
		return map;
	});

	function toggle(id: number) {
		openId = openId === id ? null : id;
	}
</script>

<SeoHead
	title="자주 묻는 질문(FAQ)"
	description="KingDuck(킹덕) 자주 묻는 질문 — 서비스 이용 중 궁금한 점을 확인하세요."
/>

<main class="mx-auto max-w-3xl px-5 py-10 text-gray-800 dark:text-gray-200">
	<h1 class="mb-6 text-2xl font-bold">자주 묻는 질문 (FAQ)</h1>

	{#if data.faqs.length === 0}
		<p class="py-12 text-center text-gray-400">등록된 FAQ가 없습니다.</p>
	{:else}
		{#each [...grouped] as [category, items]}
			<section class="mb-8">
				<h2 class="mb-3 text-base font-bold text-orange-600">{category}</h2>
				<ul class="space-y-2">
					{#each items as faq (faq.id)}
						<li
							class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
						>
							<!-- 질문 헤더 -->
							<button
								type="button"
								class="flex w-full items-center justify-between px-5 py-4 text-left"
								onclick={() => toggle(faq.id)}
							>
								<span class="flex items-start gap-3 text-sm font-medium text-gray-900 dark:text-gray-100">
									<span class="mt-0.5 shrink-0 font-bold text-orange-500">Q.</span>
									{faq.question}
								</span>
								<i
									class="ri-arrow-down-s-line ml-3 shrink-0 text-lg text-gray-400 transition-transform {openId === faq.id ? 'rotate-180' : ''}"
								></i>
							</button>

							<!-- 답변 -->
							{#if openId === faq.id}
								<div class="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
									<p class="flex gap-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
										<span class="mt-0.5 shrink-0 font-bold text-blue-500">A.</span>
										{faq.answer}
									</p>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</main>

<FooterView />
