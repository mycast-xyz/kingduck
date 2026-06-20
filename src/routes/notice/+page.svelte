<script lang="ts">
	import FooterView from '../../app/view/footer/FooterView.svelte';
	import SeoHead from '../../app/view/SeoHead.svelte';
	import type { NoticeType } from '../../app/model/api/api';

	const { data } = $props<{ data: { notices: NoticeType[] } }>();

	let openId = $state<number | null>(null);

	// 고정 공지는 먼저, 그 다음 등록일 내림차순
	let sortedNotices = $derived([
		...data.notices.filter((n: NoticeType) => n.pinned),
		...data.notices.filter((n: NoticeType) => !n.pinned)
	]);

	function toggle(id: number) {
		openId = openId === id ? null : id;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}
</script>

<SeoHead
	title="공지사항"
	description="KingDuck(킹덕) 공지사항 — 서비스 업데이트, 점검, 이벤트 등 최신 소식을 확인하세요."
/>

<main class="mx-auto max-w-3xl px-5 py-10 text-gray-800 dark:text-gray-200">
	<h1 class="mb-6 text-2xl font-bold">공지사항</h1>

	{#if sortedNotices.length === 0}
		<p class="py-12 text-center text-gray-400">등록된 공지사항이 없습니다.</p>
	{:else}
		<ul class="space-y-2">
			{#each sortedNotices as notice (notice.id)}
				<li class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
					<!-- 헤더 (클릭으로 토글) -->
					<button
						type="button"
						class="flex w-full items-start gap-3 px-5 py-4 text-left"
						onclick={() => toggle(notice.id)}
					>
						<div class="flex-1">
							<div class="mb-1 flex flex-wrap items-center gap-2">
								{#if notice.pinned}
									<span class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
										<i class="ri-pushpin-fill text-xs"></i>고정
									</span>
								{/if}
								{#if notice.category}
									<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
										{notice.category}
									</span>
								{/if}
							</div>
							<p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{notice.title}</p>
						</div>
						<div class="flex shrink-0 flex-col items-end gap-1">
							<time class="text-xs text-gray-400">{formatDate(notice.createdAt)}</time>
							<i
								class="ri-arrow-down-s-line text-lg text-gray-400 transition-transform {openId === notice.id ? 'rotate-180' : ''}"
							></i>
						</div>
					</button>

					<!-- 내용 -->
					{#if openId === notice.id}
						<div class="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
							<p class="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								{notice.content}
							</p>
							{#if notice.startAt || notice.endAt}
								<p class="mt-3 text-xs text-gray-400">
									{#if notice.startAt}시작: {formatDate(notice.startAt)}{/if}
									{#if notice.startAt && notice.endAt} ~ {/if}
									{#if notice.endAt}종료: {formatDate(notice.endAt)}{/if}
								</p>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>

<FooterView />
