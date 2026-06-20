<script lang="ts">
	import client from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let isEditing = $state(false);
	let gameSlug = $state('');
	let isSaving = $state(false);

	let formData = $state({
		slug: '',
		name: '',
		description: ''
	});

	onMount(() => {
		const editData = get(WindowService.modalData);
		if (editData) {
			openForEdit(editData);
		}
	});

	function openForEdit(game: any) {
		isEditing = true;
		gameSlug = game.slug;
		formData = {
			slug: game.slug,
			name: game.name,
			description: game.description ?? ''
		};
	}

	function closeModal() {
		WindowService.closeModal();
	}

	async function handleSubmit() {
		if (!formData.name.trim()) {
			toastStore.warning('이름은 필수 항목입니다.');
			return;
		}
		if (!isEditing && !formData.slug.trim()) {
			toastStore.warning('슬러그는 필수 항목입니다.');
			return;
		}

		isSaving = true;
		try {
			if (isEditing) {
				const body: any = { name: formData.name };
				if (formData.description) body.description = formData.description;
				const response = await client.put(`/api/v0/admin/game/${gameSlug}`, body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 슬러그의 게임이 이미 존재합니다.');
					return;
				}
				if (code !== 200) {
					toastStore.error(response.data.resultMsg || '수정에 실패했습니다.');
					return;
				}
				toastStore.success('게임이 수정되었습니다.');
			} else {
				const body: any = { slug: formData.slug, name: formData.name };
				if (formData.description) body.description = formData.description;
				const response = await client.post('/api/v0/admin/game', body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 슬러그의 게임이 이미 존재합니다.');
					return;
				}
				if (code !== 200 && code !== 201) {
					toastStore.error(response.data.resultMsg || '추가에 실패했습니다.');
					return;
				}
				toastStore.success('게임이 추가되었습니다.');
			}
			// watcher가 목록을 재갱신하므로 invalidateAll 불필요
			closeModal();
		} catch (err: any) {
			if (err?.response?.status === 409) {
				toastStore.error('동일한 슬러그의 게임이 이미 존재합니다.');
			} else {
				console.error('게임 저장 중 오류 발생:', err);
				toastStore.error('저장에 실패했습니다.');
			}
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-4">
	<!-- 슬러그 (신규만 입력) -->
	{#if !isEditing}
		<div>
			<label for="game-slug" class="mb-2 block text-sm font-medium text-gray-700">
				슬러그 <span class="text-red-500">*</span>
			</label>
			<input
				type="text"
				id="game-slug"
				bind:value={formData.slug}
				placeholder="예: genshin-impact"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
			<p class="mt-1 text-xs text-gray-500">URL 경로에 사용됩니다. 영문 소문자·숫자·하이픈만 사용하세요.</p>
		</div>
	{/if}

	<!-- 이름 -->
	<div>
		<label for="game-name" class="mb-2 block text-sm font-medium text-gray-700">
			이름 <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="game-name"
			bind:value={formData.name}
			placeholder="게임 이름을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 설명 -->
	<div>
		<label for="game-description" class="mb-2 block text-sm font-medium text-gray-700">설명</label>
		<textarea
			id="game-description"
			bind:value={formData.description}
			rows="3"
			placeholder="게임 설명을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		></textarea>
	</div>

	<!-- 액션 버튼 -->
	<div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
		<button
			type="button"
			onclick={closeModal}
			class="rounded-lg border-2 border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
		>
			취소
		</button>
		<button
			type="button"
			onclick={handleSubmit}
			disabled={isSaving}
			class="inline-flex items-center rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
		>
			{#if isSaving}
				<i class="ri-loader-4-line mr-2 animate-spin"></i>
			{/if}
			{isEditing ? '수정' : '추가'}
		</button>
	</div>
</div>
