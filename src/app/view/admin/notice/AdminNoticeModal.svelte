<script lang="ts">
	import client from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let isEditing = $state(false);
	let noticeId = $state<number | null>(null);
	let isSaving = $state(false);

	let formData = $state({
		title: '',
		content: '',
		category: '',
		pinned: false,
		published: false,
		startAt: '',
		endAt: ''
	});

	onMount(() => {
		const editData = get(WindowService.modalData);
		if (editData) {
			openForEdit(editData);
		}
	});

	function openForEdit(notice: any) {
		isEditing = true;
		noticeId = notice.id;
		formData = {
			title: notice.title,
			content: notice.content,
			category: notice.category ?? '',
			pinned: notice.pinned ?? false,
			published: notice.published ?? false,
			startAt: toDateTimeLocal(notice.startAt ?? ''),
			endAt: toDateTimeLocal(notice.endAt ?? '')
		};
	}

	function closeModal() {
		WindowService.closeModal();
	}

	async function handleSubmit() {
		if (!formData.title.trim()) {
			toastStore.warning('제목은 필수 항목입니다.');
			return;
		}
		if (!formData.content.trim()) {
			toastStore.warning('내용은 필수 항목입니다.');
			return;
		}

		const wasEditing = isEditing;

		isSaving = true;
		try {
			const body: any = {
				title: formData.title.trim(),
				content: formData.content.trim(),
				pinned: formData.pinned,
				published: formData.published
			};
			if (formData.category.trim()) body.category = formData.category.trim();
			if (formData.startAt) body.startAt = new Date(formData.startAt).toISOString();
			if (formData.endAt) body.endAt = new Date(formData.endAt).toISOString();

			if (wasEditing) {
				const response = await client.put(`/api/v0/admin/notice/${noticeId}`, body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 공지사항이 이미 존재합니다.');
					return;
				}
				if (code !== 200) {
					toastStore.error(response.data.resultMsg || '수정에 실패했습니다.');
					return;
				}
				toastStore.success('공지사항이 수정되었습니다.');
			} else {
				const response = await client.post('/api/v0/admin/notice', body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 공지사항이 이미 존재합니다.');
					return;
				}
				if (code !== 200 && code !== 201) {
					toastStore.error(response.data.resultMsg || '추가에 실패했습니다.');
					return;
				}
				toastStore.success('공지사항이 추가되었습니다.');
			}

			closeModal();
		} catch (error: any) {
			if (error?.response?.status === 409) {
				toastStore.error('동일한 공지사항이 이미 존재합니다.');
			} else {
				console.error('공지사항 저장 중 오류 발생:', error);
				toastStore.error('저장에 실패했습니다.');
			}
		} finally {
			isSaving = false;
		}
	}

	// 백엔드 ISO-8601 → datetime-local 포맷 변환
	function toDateTimeLocal(value: string): string {
		if (!value) return '';
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
		const d = new Date(value);
		if (isNaN(d.getTime())) return '';
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}
</script>

<div class="space-y-5">
	<!-- 제목 -->
	<div>
		<label for="notice-title" class="mb-2 block text-sm font-medium text-gray-700">
			제목 <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="notice-title"
			bind:value={formData.title}
			placeholder="공지사항 제목을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 내용 -->
	<div>
		<label for="notice-content" class="mb-2 block text-sm font-medium text-gray-700">
			내용 <span class="text-red-500">*</span>
		</label>
		<textarea
			id="notice-content"
			bind:value={formData.content}
			rows="6"
			placeholder="공지사항 내용을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		></textarea>
	</div>

	<!-- 카테고리 -->
	<div>
		<label for="notice-category" class="mb-2 block text-sm font-medium text-gray-700">
			카테고리
		</label>
		<input
			type="text"
			id="notice-category"
			bind:value={formData.category}
			placeholder="예: 업데이트, 점검, 이벤트 (선택)"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 시작/종료 일시 -->
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="notice-startAt" class="mb-2 block text-sm font-medium text-gray-700">
				시작 일시
			</label>
			<input
				type="datetime-local"
				id="notice-startAt"
				bind:value={formData.startAt}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
		<div>
			<label for="notice-endAt" class="mb-2 block text-sm font-medium text-gray-700">
				종료 일시
			</label>
			<input
				type="datetime-local"
				id="notice-endAt"
				bind:value={formData.endAt}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
	</div>

	<!-- 고정 / 공개 토글 -->
	<div class="flex gap-6">
		<label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
			<input
				type="checkbox"
				bind:checked={formData.pinned}
				class="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
			/>
			상단 고정
		</label>
		<label class="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
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
