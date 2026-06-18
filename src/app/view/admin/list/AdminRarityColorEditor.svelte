<script lang="ts">
	import client, { getApiBaseUrl } from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { toastStore } from '../../../service/ToastService';
	import { authTokenService } from '../../../service/auth/AuthTokenService';
	import { getGameInit } from '../../../model/game/GameRegistry';

	const { slug, gameName, onClose } = $props<{
		slug: string;
		gameName: string;
		onClose: () => void;
	}>();

	// {tier: {border, background, text, gradient:{from,to,stop}}}
	let colors = $state<Record<string, any>>({});
	// 등급 표시 방식: stars(별 반복) | image(티어별 이미지)
	let display = $state<{ mode: string; images: Record<string, string> }>({
		mode: 'stars',
		images: {}
	});
	let loading = $state(true);
	let saving = $state(false);
	let uploadingTier = $state<string | null>(null);
	const currentUrl = getApiBaseUrl();

	onMount(async () => {
		// 1) 코드 기본값(등급 구성 + 기본 색)
		const base = getGameInit(slug)?.list?.card?.rarityColors ?? {};
		let merged: Record<string, any> = JSON.parse(JSON.stringify(base));
		// 2) DB 저장값으로 덮어쓰기
		try {
			const r = await client.get(`/api/v0/game/${slug}`);
			const db = r.data?.rarityColors;
			if (db) merged = { ...merged, ...JSON.parse(JSON.stringify(db)) };
			const rd = r.data?.rarityDisplay;
			if (rd) display = { mode: rd.mode || 'stars', images: rd.images || {} };
		} catch (e) {
			console.error('게임 정보 조회 오류:', e);
		}
		// gradient 누락 시 기본 채움
		for (const k of Object.keys(merged)) {
			merged[k].gradient = merged[k].gradient ?? { from: '#000000', to: '#000000', stop: '53%' };
		}
		colors = merged;
		loading = false;
	});

	// ListCardView.getCardStyle 과 동일한 그라데이션 미리보기.
	function preview(c: any): string {
		if (!c) return '';
		const g = c.gradient;
		if (g) {
			return `background: linear-gradient(180deg, ${g.from}, ${c.background} ${g.stop}); border: 2px solid ${c.border};`;
		}
		return `background: ${c.background}; border: 2px solid ${c.border};`;
	}

	// 표시 방식(모드) 저장.
	async function saveDisplayMode(mode: string) {
		display.mode = mode;
		try {
			await client.put(`/api/v0/admin/game/${slug}/rarity-display`, {
				rarityDisplay: { mode: display.mode, images: display.images }
			});
			toastStore.success(`등급 표시: ${mode === 'image' ? '이미지' : '별 반복'} (목록 재진입 시 반영)`);
		} catch (e) {
			console.error('표시 방식 저장 오류:', e);
			toastStore.error('표시 방식 저장에 실패했습니다.');
		}
	}

	// 티어 이미지 업로드 → 서버가 rarity_display.images[tier] 갱신.
	async function uploadTierImage(tier: string, e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			toastStore.error('이미지 파일만 업로드할 수 있습니다.');
			return;
		}
		uploadingTier = tier;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch(`${currentUrl}/api/v0/admin/game/${slug}/rarity-image/${tier}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${authTokenService.getToken()}` },
				body: form
			});
			const json = await res.json();
			if (res.ok && json?.data?.rarityDisplay) {
				display = {
					mode: json.data.rarityDisplay.mode || 'image',
					images: json.data.rarityDisplay.images || {}
				};
				toastStore.success(`★${tier} 등급 이미지가 업로드되었습니다.`);
			} else {
				toastStore.error(json?.resultMsg || '이미지 업로드에 실패했습니다.');
			}
		} catch (err) {
			console.error('등급 이미지 업로드 오류:', err);
			toastStore.error('이미지 업로드에 실패했습니다.');
		} finally {
			uploadingTier = null;
		}
	}

	async function save() {
		saving = true;
		try {
			const r = await client.put(`/api/v0/admin/game/${slug}/rarity-colors`, {
				rarityColors: colors
			});
			if (r.data.resultCode === 200) {
				toastStore.success('등급 색상이 저장되었습니다. (목록 재진입 시 반영)');
				onClose();
			} else {
				toastStore.error(r.data.resultMsg || '저장에 실패했습니다.');
			}
		} catch (e) {
			console.error('등급 색상 저장 오류:', e);
			toastStore.error('등급 색상 저장에 실패했습니다.');
		} finally {
			saving = false;
		}
	}

	const tiers = $derived(
		Object.keys(colors).sort((a, b) => Number(b) - Number(a))
	);
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
	onclick={onClose}
	role="presentation"
>
	<div
		class="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold text-gray-900">{gameName} — 등급 카드 색상</h3>
			<button
				aria-label="닫기"
				class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
				onclick={onClose}
			>
				<i class="ri-close-line text-2xl"></i>
			</button>
		</div>

		{#if loading}
			<div class="py-12 text-center text-gray-500">불러오는 중…</div>
		{:else if tiers.length === 0}
			<div class="py-12 text-center text-gray-500">이 게임에는 등급 색상 설정이 없습니다.</div>
		{:else}
			<!-- 등급 표시 방식 -->
			<div class="mb-4 rounded-lg border border-gray-100 p-3">
				<div class="mb-2 text-sm font-semibold text-gray-700">등급 표시 방식</div>
				<div class="flex gap-4 text-sm">
					<label class="flex items-center gap-1">
						<input
							type="radio"
							checked={display.mode !== 'image'}
							onchange={() => saveDisplayMode('stars')}
						/> 별 반복 (아이콘 N개)
					</label>
					<label class="flex items-center gap-1">
						<input
							type="radio"
							checked={display.mode === 'image'}
							onchange={() => saveDisplayMode('image')}
						/> 티어별 이미지 (예: 니케 SSR)
					</label>
				</div>
				{#if display.mode === 'image'}
					<div class="mt-3 flex flex-wrap gap-3">
						{#each tiers as tier}
							<div class="flex flex-col items-center gap-1">
								<label class="group relative h-12 w-12 cursor-pointer" title="클릭하여 이미지 업로드">
									{#if display.images[tier]}
										<img
											src="{currentUrl}/{display.images[tier]}"
											alt="★{tier}"
											class="h-12 w-12 rounded border border-gray-200 bg-gray-50 object-contain p-1"
										/>
									{:else}
										<div
											class="flex h-12 w-12 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-gray-300"
										>
											<i class="ri-image-add-line"></i>
										</div>
									{/if}
									<span
										class="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
									>
										{#if uploadingTier === tier}
											<i class="ri-loader-4-line animate-spin"></i>
										{:else}
											<i class="ri-camera-line"></i>
										{/if}
									</span>
									<input
										type="file"
										accept="image/*"
										class="hidden"
										onchange={(e) => uploadTierImage(tier, e)}
									/>
								</label>
								<span class="text-xs font-bold text-gray-600">★{tier}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="space-y-4">
				{#each tiers as tier}
					<div class="flex items-start gap-4 rounded-lg border border-gray-100 p-3">
						<!-- 미리보기 카드 -->
						<div class="flex flex-col items-center gap-1">
							<div class="h-24 w-16 rounded-md" style={preview(colors[tier])}></div>
							<span class="text-xs font-bold" style="color:{colors[tier].text}">★{tier}</span>
						</div>
						<!-- 색상 필드 -->
						<div class="grid flex-1 grid-cols-3 gap-2 text-xs">
							{#each [['border', '테두리'], ['background', '배경'], ['text', '텍스트']] as [field, label]}
								<label class="flex flex-col gap-0.5">
									<span class="text-gray-500">{label}</span>
									<input
										type="text"
										class="rounded border border-gray-200 px-1 py-0.5 focus:border-orange-400 focus:outline-none"
										bind:value={colors[tier][field]}
										placeholder="#000000"
									/>
								</label>
							{/each}
							<label class="flex flex-col gap-0.5">
								<span class="text-gray-500">그라데이션 시작</span>
								<input
									type="text"
									class="rounded border border-gray-200 px-1 py-0.5 focus:border-orange-400 focus:outline-none"
									bind:value={colors[tier].gradient.from}
									placeholder="#000000"
								/>
							</label>
							<label class="flex flex-col gap-0.5">
								<span class="text-gray-500">그라데이션 끝</span>
								<input
									type="text"
									class="rounded border border-gray-200 px-1 py-0.5 focus:border-orange-400 focus:outline-none"
									bind:value={colors[tier].gradient.to}
									placeholder="#000000"
								/>
							</label>
							<label class="flex flex-col gap-0.5">
								<span class="text-gray-500">전환 지점</span>
								<input
									type="text"
									class="rounded border border-gray-200 px-1 py-0.5 focus:border-orange-400 focus:outline-none"
									bind:value={colors[tier].gradient.stop}
									placeholder="53%"
								/>
							</label>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button
					class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
					onclick={onClose}>취소</button
				>
				<button
					class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
					disabled={saving}
					onclick={save}>{saving ? '저장 중…' : '저장'}</button
				>
			</div>
		{/if}
	</div>
</div>
