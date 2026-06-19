<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/stores';

	// 애드센스 수동 광고 슬롯. 애드센스에서 광고 유닛을 만들어 받은 slot ID를 넘겨 배치한다.
	// 예) <AdUnit slot="1234567890" />. (자동 광고는 app.html 스크립트가 알아서 배치하므로 별도 불필요.)
	// CSR/SPA라 라우트 전환 시 <ins>를 리마운트(key=path)하고 다시 push해야 새 광고가 채워진다.
	let {
		slot,
		format = 'auto',
		responsive = true,
		style = 'display:block'
	} = $props<{ slot: string; format?: string; responsive?: boolean; style?: string }>();

	// app.html <head>의 애드센스 스크립트와 동일한 퍼블리셔 ID.
	const client = 'ca-pub-7085750843275776';
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
