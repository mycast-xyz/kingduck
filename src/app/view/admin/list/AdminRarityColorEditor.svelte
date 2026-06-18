<script lang="ts">
	import client from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { toastStore } from '../../../service/ToastService';
	import { getGameInit } from '../../../model/game/GameRegistry';

	const { slug, gameName, onClose } = $props<{
		slug: string;
		gameName: string;
		onClose: () => void;
	}>();

	// {tier: {border, background, text, gradient:{from,to,stop}}}
	let colors = $state<Record<string, any>>({});
	let loading = $state(true);
	let saving = $state(false);

	onMount(async () => {
		// 1) 코드 기본값(등급 구성 + 기본 색)
		const base = getGameInit(slug)?.list?.card?.rarityColors ?? {};
		let merged: Record<string, any> = JSON.parse(JSON.stringify(base));
		// 2) DB 저장값으로 덮어쓰기
		try {
			const r = await client.get(`/api/v0/game/${slug}`);
			const db = r.data?.rarityColors;
			if (db) merged = { ...merged, ...JSON.parse(JSON.stringify(db)) };
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
