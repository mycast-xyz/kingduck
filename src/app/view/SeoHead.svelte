<script lang="ts">
	import { page } from '$app/stores';

	// 페이지별 SEO/공유 메타를 한 곳에서. title/description/keywords + canonical + Open Graph + Twitter.
	let {
		title = '',
		description = '',
		keywords = '',
		image = 'https://www.kingduck.xyz/favicon.png'
	} = $props<{ title?: string; description?: string; keywords?: string; image?: string }>();

	const SITE = 'https://www.kingduck.xyz';
	const fullTitle = $derived(title ? `${title} - KingDuck` : 'KingDuck');
	const url = $derived(SITE + $page.url.pathname);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	{#if description}<meta name="description" content={description} />{/if}
	{#if keywords}<meta name="keywords" content={keywords} />{/if}
	<link rel="canonical" href={url} />

	<meta property="og:title" content={fullTitle} />
	{#if description}<meta property="og:description" content={description} />{/if}
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />

	<meta name="twitter:title" content={fullTitle} />
	{#if description}<meta name="twitter:description" content={description} />{/if}
	<meta name="twitter:image" content={image} />
</svelte:head>
