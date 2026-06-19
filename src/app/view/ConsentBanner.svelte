<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// 쿠키/광고 동의 배너. 동의 전까지 하단 고정. (개인화 광고용 정식 CMP는 후속 — 기본 고지/동의.)
	const KEY = 'kd_consent';
	let show = $state(false);

	onMount(() => {
		if (browser && !localStorage.getItem(KEY)) show = true;
	});

	function accept() {
		if (browser) localStorage.setItem(KEY, '1');
		show = false;
	}
</script>

{#if show}
	<div
		class="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95"
	>
		<div class="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row">
			<p class="flex-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
				본 사이트는 서비스 제공·통계·광고를 위해 쿠키를 사용합니다. Google 등 제3자 광고 쿠키가 사용될 수
				있습니다. 자세한 내용은
				<a href="/privacy" class="text-orange-600 hover:underline">개인정보처리방침</a>을 확인하세요.
			</p>
			<button
				onclick={accept}
				class="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
			>
				동의
			</button>
		</div>
	</div>
{/if}
