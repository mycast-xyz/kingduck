<script lang="ts">
	import client from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let isEditing = $state(false);
	let faqId = $state<number | null>(null);
	let isSaving = $state(false);

	let formData = $state({
		category: '',
		question: '',
		answer: '',
		sortOrder: 0,
		published: false
	});

	onMount(() => {
		const editData = get(WindowService.modalData);
		if (editData) {
			openForEdit(editData);
		}
	});

	function openForEdit(faq: any) {
		isEditing = true;
		faqId = faq.id;
		formData = {
			category: faq.category ?? '',
			question: faq.question,
			answer: faq.answer,
			sortOrder: faq.sortOrder ?? 0,
			published: faq.published ?? false
		};
	}

	function closeModal() {
		WindowService.closeModal();
	}

	async function handleSubmit() {
		if (!formData.question.trim()) {
			toastStore.warning('질문은 필수 항목입니다.');
			return;
		}
		if (!formData.answer.trim()) {
			toastStore.warning('답변은 필수 항목입니다.');
			return;
		}

		const wasEditing = isEditing;

		isSaving = true;
		try {
			const body: any = {
				question: formData.question.trim(),
				answer: formData.answer.trim(),
				sortOrder: Number(formData.sortOrder),
				published: formData.published
			};
			if (formData.category.trim()) body.category = formData.category.trim();

			if (wasEditing) {
				const response = await client.put(`/api/v0/admin/faq/${faqId}`, body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 FAQ가 이미 존재합니다.');
					return;
				}
				if (code !== 200) {
					toastStore.error(response.data.resultMsg || '수정에 실패했습니다.');
					return;
				}
				toastStore.success('FAQ가 수정되었습니다.');
			} else {
				const response = await client.post('/api/v0/admin/faq', body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 FAQ가 이미 존재합니다.');
					return;
				}
				if (code !== 200 && code !== 201) {
					toastStore.error(response.data.resultMsg || '추가에 실패했습니다.');
					return;
				}
				toastStore.success('FAQ가 추가되었습니다.');
			}

			closeModal();
		} catch (error: any) {
			if (error?.response?.status === 409) {
				toastStore.error('동일한 FAQ가 이미 존재합니다.');
			} else {
				console.error('FAQ 저장 중 오류 발생:', error);
				toastStore.error('저장에 실패했습니다.');
			}
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-5">
	<!-- 카테고리 -->
	<div>
		<label for="faq-category" class="mb-2 block text-sm font-medium text-gray-700">
			카테고리
		</label>
		<input
			type="text"
			id="faq-category"
			bind:value={formData.category}
			placeholder="예: 계정, 결제, 서비스 (선택)"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 질문 -->
	<div>
		<label for="faq-question" class="mb-2 block text-sm font-medium text-gray-700">
			질문 <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="faq-question"
			bind:value={formData.question}
			placeholder="질문을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 답변 -->
	<div>
		<label for="faq-answer" class="mb-2 block text-sm font-medium text-gray-700">
			답변 <span class="text-red-500">*</span>
		</label>
		<textarea
			id="faq-answer"
			bind:value={formData.answer}
			rows="5"
			placeholder="답변을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		></textarea>
	</div>

	<!-- 정렬 순서 / 공개 -->
	<div class="flex items-end gap-6">
		<div class="w-32">
			<label for="faq-sortOrder" class="mb-2 block text-sm font-medium text-gray-700">
				정렬 순서
			</label>
			<input
				type="number"
				id="faq-sortOrder"
				bind:value={formData.sortOrder}
				min="0"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
		<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium text-gray-700">
			<input
				type="checkbox"
				bind:checked={formData.published}
				class="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
			/>
			공개
		</label>
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
