<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Layer from '../../view-framework/content/ContentLayer.svelte';

	// 니케 L2D(Spine) 뷰어 — metadata.nikkeId(cXXX) + metadata.spineVersion(4.0|4.1) 기반.
	// 백엔드 크롤러가 채우기 전에는 nikkeId 가 없으므로 "L2D 데이터 없음"만 표시한다.
	// SpinePlayer 동적 import: spine-player-40 / spine-player-41 별칭 패키지.
	// 메인 번들에 Spine 런타임이 포함되지 않도록 모든 import 는 onMount 내부에서만 수행한다.
	const { listData, title } = $props<{
		listData: any;
		currentUrl?: string;
		isMobile?: boolean;
		initData?: any;
		title?: string;
	}>();

	const BASE_URL = 'https://raw.githubusercontent.com/Nikke-db/Nikke-db.github.io/master';

	// bind:this 를 Svelte 5 에서 사용하려면 $state 로 선언해야 한다.
	let containerEl = $state<HTMLDivElement | undefined>(undefined);
	let player: any = null;
	let loadError = $state('');
	let loading = $state(false);

	const nikkeId = $derived((listData?.nikkeId ?? '') as string);
	const spineVersion = $derived((listData?.spineVersion ?? '4.0') as string);
	const hasL2d = $derived(!!nikkeId);

	onMount(async () => {
		if (!hasL2d || !containerEl) return;

		loading = true;
		loadError = '';

		try {
			const folder = `${BASE_URL}/l2d/${nikkeId}`;
			// .skel 은 이진 형식 → SpinePlayerConfig 의 binaryUrl 로 전달한다.
			const binaryUrl = `${folder}/${nikkeId}_00.skel`;
			const atlasUrl = `${folder}/${nikkeId}_00.atlas`;

			// 버전별 런타임 동적 import — 4.0 스켈레톤을 4.1 런타임으로 로드하면 깨진다.
			let SpinePlayerClass: any;
			if (spineVersion === '4.1') {
				const mod = await import('spine-player-41');
				SpinePlayerClass = mod.SpinePlayer;
			} else {
				const mod = await import('spine-player-40');
				SpinePlayerClass = mod.SpinePlayer;
			}

			player = new SpinePlayerClass(containerEl, {
				binaryUrl,
				atlasUrl,
				animation: 'idle',
				premultipliedAlpha: true,
				alpha: true,
				backgroundColor: '#00000000',
				showControls: false,
				success: (p: any) => {
					loading = false;
					try {
						// setViewport(animationName) — 해당 애니메이션의 바운딩 박스에 맞게 뷰포트 조정
						p.setViewport('idle');
					} catch (_) {
						// 일부 캐릭터에 idle 애니메이션이 없을 수 있으므로 무시
					}
				},
				error: (_p: any, msg: string) => {
					loading = false;
					loadError = msg || 'L2D 에셋 로드 중 오류가 발생했습니다.';
				}
			});
		} catch (e) {
			loading = false;
			loadError = 'L2D 모듈 로드에 실패했습니다.';
			console.error('[NikkeL2dView] SpinePlayer 초기화 오류:', e);
		}
	});

	onDestroy(() => {
		if (player) {
			try {
				player.dispose();
			} catch (_) {}
			player = null;
		}
	});
</script>

<Layer title={title || 'L2D'}>
	{#if !hasL2d}
		<div class="py-6 text-center text-sm text-gray-500">L2D 데이터 없음</div>
	{:else if loadError}
		<div class="flex flex-col items-center gap-2 py-6 text-center">
			<i class="ri-error-warning-line text-2xl text-red-400"></i>
			<p class="text-sm text-red-500">{loadError}</p>
		</div>
	{:else}
		<!--
			spine-player 는 containerEl 안에 canvas(position:absolute; width:100%; height:100%)를 생성한다.
			바깥 wrapper 의 height 와 position:relative 가 필수.
		-->
		<div class="relative w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5" style="height:600px">
			{#if loading}
				<div
					class="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
				>
					<i class="ri-loader-4-line animate-spin text-xl"></i>
					<span>로딩 중...</span>
				</div>
			{/if}
			<div bind:this={containerEl} class="relative h-full w-full"></div>
		</div>
	{/if}
</Layer>
