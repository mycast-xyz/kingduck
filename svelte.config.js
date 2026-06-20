import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess({ typescript: true, scss: true }),
	kit: {
		adapter: adapter({
			fallback: 'index.html' // CSR 모드에서는 index.html을 fallback으로 설정
		}),
		paths: {
			base: process.env.BASE_PATH || '' // GitHub Pages 경로 설정
		},
		prerender: {
			// SEO: 정적/법적 페이지·홈·게임 list 랜딩만 빌드 시 실제 HTML로 생성(부분 프리렌더).
			// 각 라우트가 `export const prerender = true`로 옵트인하고, list/[slug]는 entries()로 slug 열거.
			// crawl:false — 프리렌더 페이지의 링크를 따라가 비대상(login/calendar/content 등)을
			// 프리렌더하려다 에러나는 걸 막는다. 캐릭터 상세 등은 기존대로 CSR.
			entries: ['*'],
			crawl: false
		}
	}
};

export default config;
