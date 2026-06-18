<script lang="ts">
	import Layer from '../../view-framework/content/ContentLayer.svelte';
	import type { ViewInitData } from '../../model/game/ViewInitData';

	// 캐릭터 음성 대사(스타레일). voiceLines = [{ id, title, text, krUrl/jpUrl/cnUrl/enUrl }].
	// url 필드는 starrailstation 오디오 자산 해시 → `${CDN}${hash}.mp3`로 재생.
	// (이미지는 .webp, 오디오는 .mp3 — 동일 CDN. <audio>는 CORS 없이 크로스오리진 재생됨.)
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: ViewInitData;
		title?: string;
	}>();

	const CDN = 'https://cdn.starrailstation.com/assets/';
	const LANGS: Array<{ key: string; label: string }> = [
		{ key: 'krUrl', label: '한' },
		{ key: 'jpUrl', label: '日' },
		{ key: 'cnUrl', label: '中' },
		{ key: 'enUrl', label: 'EN' }
	];

	let lang = $state('krUrl');

	let lines = $derived.by(() => {
		const raw = Array.isArray(listData) ? listData : [];
		return raw
			.map((v: any, i: number) => ({
				id: v.id ?? i,
				title: v.title || v.Title || '',
				text: v.text || v.Text || '',
				urls: {
					krUrl: v.krUrl || '',
					jpUrl: v.jpUrl || '',
					cnUrl: v.cnUrl || '',
					enUrl: v.enUrl || ''
				} as Record<string, string>
			}))
			.filter((l: { text: string }) => l.text);
	});

	let playingId = $state<number | string | null>(null);
	let audio: HTMLAudioElement | null = null;

	// 선택 언어 우선, 없으면 한→일→중→영 순으로 폴백.
	function audioUrl(line: { urls: Record<string, string> }): string | null {
		for (const k of [lang, 'krUrl', 'jpUrl', 'cnUrl', 'enUrl']) {
			const h = line.urls[k];
			if (h) return `${CDN}${h}.mp3`;
		}
		return null;
	}

	function toggle(line: any) {
		const url = audioUrl(line);
		if (!url) return;
		if (playingId === line.id) {
			audio?.pause();
			playingId = null;
			return;
		}
		audio?.pause();
		audio = new Audio(url);
		audio.onended = () => (playingId = null);
		audio.onerror = () => (playingId = null);
		audio.play().catch(() => (playingId = null));
		playingId = line.id;
	}
</script>

<Layer title={title || '음성 대사'}>
	{#if lines.length === 0}
		<div class="py-6 text-center text-sm text-gray-500">데이터가 없습니다.</div>
	{:else}
		<div class="p-4">
			<!-- 언어 선택 -->
			<div class="mb-3 flex gap-1">
				{#each LANGS as l}
					<button
						class="rounded px-3 py-1 text-xs font-medium transition-colors {lang === l.key
							? 'bg-orange-500 text-white'
							: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
						onclick={() => (lang = l.key)}>{l.label}</button
					>
				{/each}
			</div>
			<div class="max-h-[480px] space-y-2 overflow-y-auto pr-1">
				{#each lines as line}
					<div
						class="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-[#1d1e2e]"
					>
						<button
							class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition-opacity hover:bg-orange-600 disabled:opacity-30"
							onclick={() => toggle(line)}
							disabled={!audioUrl(line)}
							aria-label="음성 재생"
						>
							<i class="{playingId === line.id ? 'ri-pause-fill' : 'ri-play-fill'} text-lg"></i>
						</button>
						<div class="min-w-0">
							<div class="mb-0.5 text-xs font-bold text-orange-500">{line.title}</div>
							<div class="break-keep text-sm leading-relaxed text-gray-600 dark:text-gray-300">
								{line.text}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Layer>
