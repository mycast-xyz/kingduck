<script lang="ts">
	import { onMount } from 'svelte';
	import { AdminSideMenuService } from '../../../app/service/AdminSiedMenuService';
	import AdminHeadMenu from '../../../app/view/menu/AdminHeadMenu.svelte';
	import { adminSettingService } from '../../../app/service/AdminSettingService';
	import { toastStore } from '../../../app/service/ToastService';

	const { data } = $props<{ data: { url: string } }>();

	// 사이드바 너비
	let sidebarStore = AdminSideMenuService.SidebarCollapsed;
	let isSidebarCollapsed = $derived($sidebarStore);
	let mainMargin = $derived(isSidebarCollapsed.collapsed ? 'ml-64' : 'ml-20');

	// 배경 선택 모드: 'random' | 'preset' | 'custom'
	let bgMode = $state<'random' | 'preset' | 'custom'>('random');
	// 프리셋 선택값
	let presetBg = $state('bg_01');
	// 커스텀 업로드 후 받은 imageUrl
	let customImageUrl = $state('');
	// 파일 입력 참조
	let fileInput: HTMLInputElement | null = $state(null);
	// 업로드 중
	let uploading = $state(false);

	// 최근 게임 표시 수
	let recentGamesLimit = $state(6);

	// 저장 중
	let saving = $state(false);

	// 서비스 로딩 상태
	let loadingStore = adminSettingService.loading;
	let loading = $derived($loadingStore);

	onMount(async () => {
		const s = await adminSettingService.fetchSetting();
		if (s) {
			recentGamesLimit = s.homeRecentGamesLimit;
			const bg = s.homeHeroBackground;
			if (!bg || bg === 'random') {
				bgMode = 'random';
			} else if (/^bg_0[1-5]$/.test(bg)) {
				bgMode = 'preset';
				presetBg = bg;
			} else {
				bgMode = 'custom';
				customImageUrl = bg;
			}
		}
	});

	// 프리셋 배경 썸네일 src
	function presetThumbSrc(preset: string): string {
		return `/assets/main/${preset}.webp`;
	}

	// 현재 미리보기 이미지
	let previewSrc = $derived.by(() => {
		if (bgMode === 'random') return `/assets/main/bg_01.webp`;
		if (bgMode === 'preset') return presetThumbSrc(presetBg);
		if (customImageUrl) {
			if (customImageUrl.startsWith('http://') || customImageUrl.startsWith('https://'))
				return customImageUrl;
			return `${data.url}/${customImageUrl.replace(/^\//, '')}`;
		}
		return '';
	});

	async function handleFileChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		uploading = true;
		const url = await adminSettingService.uploadHeroImage(file);
		uploading = false;
		if (url) {
			customImageUrl = url;
			toastStore.success('이미지가 업로드되었습니다.');
		}
	}

	async function handleSave() {
		saving = true;
		let homeHeroBackground: string;
		if (bgMode === 'random') {
			homeHeroBackground = 'random';
		} else if (bgMode === 'preset') {
			homeHeroBackground = presetBg;
		} else {
			if (!customImageUrl) {
				toastStore.warning('커스텀 이미지를 먼저 업로드해주세요.');
				saving = false;
				return;
			}
			homeHeroBackground = customImageUrl;
		}

		const result = await adminSettingService.updateSetting({
			homeHeroBackground,
			homeRecentGamesLimit: recentGamesLimit
		});
		saving = false;
		if (result) {
			toastStore.success('설정이 저장되었습니다.');
		}
	}
</script>

<main class="{mainMargin} min-h-screen flex-1 bg-gray-100 p-8">
	<AdminHeadMenu title="사이트 설정" infoText="홈페이지 배경 및 표시 옵션을 관리합니다." />

	{#if loading}
		<div class="flex items-center justify-center py-20 text-gray-400">
			<i class="ri-loader-4-line mr-2 animate-spin text-xl"></i>
			설정 불러오는 중...
		</div>
	{:else}
		<div class="mt-6 space-y-6">
			<!-- 홈 배경 설정 -->
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-800">홈 히어로 배경</h2>

				<div class="space-y-4">
					<!-- 랜덤 -->
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="radio"
							name="bgMode"
							value="random"
							bind:group={bgMode}
							class="accent-orange-500"
						/>
						<span class="font-medium text-gray-700">랜덤 (bg_01 ~ bg_05 중 매 로드마다 무작위)</span>
					</label>

					<!-- 프리셋 -->
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="radio"
							name="bgMode"
							value="preset"
							bind:group={bgMode}
							class="mt-1 accent-orange-500"
						/>
						<div class="flex-1">
							<span class="font-medium text-gray-700">프리셋 선택</span>
							{#if bgMode === 'preset'}
								<div class="mt-3 space-y-3">
									<select
										bind:value={presetBg}
										class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
									>
										{#each ['bg_01', 'bg_02', 'bg_03', 'bg_04', 'bg_05'] as p}
											<option value={p}>{p}</option>
										{/each}
									</select>
									<!-- 썸네일 미리보기 -->
									<div class="overflow-hidden rounded-lg border border-gray-200">
										<img
											src={presetThumbSrc(presetBg)}
											alt="프리셋 미리보기"
											class="h-40 w-full object-cover object-center"
										/>
									</div>
								</div>
							{/if}
						</div>
					</label>

					<!-- 커스텀 업로드 -->
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="radio"
							name="bgMode"
							value="custom"
							bind:group={bgMode}
							class="mt-1 accent-orange-500"
						/>
						<div class="flex-1">
							<span class="font-medium text-gray-700">커스텀 이미지 업로드</span>
							{#if bgMode === 'custom'}
								<div class="mt-3 space-y-3">
									<div class="flex items-center gap-3">
										<input
											bind:this={fileInput}
											type="file"
											accept="image/*"
											onchange={handleFileChange}
											class="hidden"
										/>
										<button
											type="button"
											onclick={() => fileInput?.click()}
											disabled={uploading}
											class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
										>
											{#if uploading}
												<i class="ri-loader-4-line mr-2 animate-spin"></i>
												업로드 중...
											{:else}
												<i class="ri-upload-2-line mr-2"></i>
												파일 선택
											{/if}
										</button>
										{#if customImageUrl}
											<span class="max-w-xs truncate text-xs text-gray-500">{customImageUrl}</span>
										{/if}
									</div>
									{#if customImageUrl}
										<div class="overflow-hidden rounded-lg border border-gray-200">
											<img
												src={previewSrc}
												alt="커스텀 배경 미리보기"
												class="h-40 w-full object-cover object-center"
											/>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</label>
				</div>
			</div>

			<!-- 최근 게임 표시 수 -->
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-800">홈 최근 게임 표시 수</h2>
				<div class="flex items-center gap-4">
					<input
						type="number"
						bind:value={recentGamesLimit}
						min="1"
						max="50"
						class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
					/>
					<span class="text-sm text-gray-500">개 (1 ~ 50)</span>
				</div>
				<p class="mt-2 text-xs text-gray-400">
					홈페이지 하단 "최근 추가된 게임" 섹션에 표시할 게임 수입니다.
				</p>
			</div>

			<!-- 저장 -->
			<div class="flex justify-end">
				<button
					type="button"
					onclick={handleSave}
					disabled={saving}
					class="inline-flex items-center rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
				>
					{#if saving}
						<i class="ri-loader-4-line mr-2 animate-spin"></i>
						저장 중...
					{:else}
						<i class="ri-save-line mr-2"></i>
						저장
					{/if}
				</button>
			</div>
		</div>
	{/if}
</main>
