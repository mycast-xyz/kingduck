<script lang="ts">
	import type { PageData } from './$types';
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import DesktopMainMenu from '../app/view/agent/desktop//MainMenu.svelte';
	import MobileMainMenu from '../app/view/agent/mobile/MainMenu.svelte';
	import Toast from '../app/view/toast/Toast.svelte';
	import ConsentBanner from '../app/view/ConsentBanner.svelte';

	const {
		data,
		children,
		title = '게임 정보 사이트'
	} = $props<{ data: PageData; children: any; title?: string }>();

	const GA_ID = env.PUBLIC_GA_ID;
	const ADSENSE_CLIENT = env.PUBLIC_ADSENSE_CLIENT;

	// 분석/광고 스크립트는 env가 설정됐을 때만 로드(미설정 시 아무 영향 없음).
	onMount(() => {
		if (!browser) return;
		// Google Analytics (GA4)
		if (GA_ID) {
			const s = document.createElement('script');
			s.async = true;
			s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
			document.head.appendChild(s);
			// @ts-expect-error gtag dataLayer
			window.dataLayer = window.dataLayer || [];
			// @ts-expect-error gtag
			window.gtag = function () {
				// @ts-expect-error gtag
				window.dataLayer.push(arguments);
			};
			// @ts-expect-error gtag
			window.gtag('js', new Date());
			// @ts-expect-error gtag — SPA라 자동 page_view 끄고 네비게이션마다 수동 전송.
			window.gtag('config', GA_ID, { send_page_view: false });
		}
		// Google AdSense
		if (ADSENSE_CLIENT) {
			const s = document.createElement('script');
			s.async = true;
			s.crossOrigin = 'anonymous';
			s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
			document.head.appendChild(s);
		}
	});

	// SPA 라우트 전환마다 GA page_view 전송.
	afterNavigate(() => {
		// @ts-expect-error gtag
		if (browser && GA_ID && window.gtag) {
			// @ts-expect-error gtag
			window.gtag('event', 'page_view', {
				page_path: location.pathname + location.search,
				page_location: location.href
			});
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<!-- 토스트 메시지 -->
<Toast />

<!-- 메인 메뉴 -->
{#if !data.isNotLayoutPage}
	{#if data.isMobile}
		<MobileMainMenu {data} />
	{:else}
		<DesktopMainMenu {data} />
	{/if}
{/if}

<!-- 페이지 컨텐츠 -->
{@render children()}

<!-- 쿠키/광고 동의 배너 -->
<ConsentBanner />
