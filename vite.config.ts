import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],

	// 다른 프로젝트가 5173을 쓰므로 전용 포트 고정. strictPort로 충돌 시 조용히 다른 포트로
	// 넘어가지 않고 즉시 실패하게 한다(엉뚱한 서버에 붙는 사고 방지).
	server: {
		port: 4173,
		strictPort: true
	},
	preview: {
		port: 4174,
		strictPort: true
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
