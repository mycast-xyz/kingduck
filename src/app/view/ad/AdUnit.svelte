<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';

	// 애드센스 광고 슬롯. PUBLIC_ADSENSE_CLIENT가 설정됐을 때만 렌더(승인 전엔 아무것도 안 보임).
	// CSR/SPA라 라우트 전환 시 <ins>를 리마운트(key=path)하고 다시 push해야 새 광고가 채워진다.
	let {
		slot,
		format = 'auto',
		responsive = true,
		style = 'display:block'
	} = $props<{ slot: string; format?: string; responsive?: boolean; style?: string }>();

	const client = env.PUBLIC_ADSENSE_CLIENT;
	const path = $derived($page.url.pathname);

	function pushAd() {
		try {
			// @ts-expect-error adsbygoogle는 외부 스크립트가 주입
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch {
			/* 스크립트 미로드/중복 push 무시 */
		}
	}

	// 경로가 바뀔 때마다(초기 포함) 새 <ins> 렌더 후 push.
	$effect(() => {
		path;
		if (client && slot) tick().then(pushAd);
	});
</script>

{#if client && slot}
	<div class="my-4 flex justify-center">
		{#key path}
			<ins
				class="adsbygoogle"
				{style}
				data-ad-client={client}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive ? 'true' : 'false'}
			></ins>
		{/key}
	</div>
{/if}
