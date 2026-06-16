<script lang="ts">
	import client from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { invalidateAll } from '$app/navigation';

	let gameList: any = $state([]);
	let isEditing = $state(false);
	let eventId = $state('');

	// 폼 데이터
	let formData = $state({
		gameId: '',
		title: '',
		type: 'GACHA' as 'GACHA' | 'EVENT' | 'MAINTENANCE',
		startTime: '',
		endTime: '',
		description: '',
		image: '',
		officialLink: '',
		characterName: ''
	});

	onMount(async () => {
		await loadGameList();
		// 편집 모드인 경우 WindowService.modalData에서 이벤트 데이터를 읽어 폼에 채운다
		const editData = get(WindowService.modalData);
		if (editData) {
			openForEdit(editData);
		}
	});

	async function loadGameList() {
		try {
			const response = await client.get('/api/v0/admin/game/list');
			if (response.data.resultCode === 200) {
				gameList = response.data.items;
			}
		} catch (error) {
			console.error('게임 목록 조회 중 오류 발생:', error);
		}
	}

	function closeModal() {
		WindowService.closeModal();
		resetForm();
	}

	function resetForm() {
		formData = {
			gameId: '',
			title: '',
			type: 'GACHA',
			startTime: '',
			endTime: '',
			description: '',
			image: '',
			officialLink: '',
			characterName: ''
		};
		isEditing = false;
		eventId = '';
	}

	async function handleSubmit() {
		try {
			// 유효성 검증
			if (!formData.gameId || !formData.title || !formData.startTime || !formData.endTime) {
				alert('필수 항목을 모두 입력해주세요.');
				return;
			}

			if (isEditing) {
				await client.put(`/api/v0/admin/event/${eventId}`, formData);
			} else {
				await client.post('/api/v0/admin/event', formData);
			}

			// 모달 닫고 목록 새로고침
			closeModal();
			await invalidateAll();
		} catch (error) {
			console.error('이벤트 저장 중 오류 발생:', error);
			alert('이벤트 저장에 실패했습니다.');
		}
	}

	// 백엔드는 ISO-8601(예: 2026-07-01T10:00:00.000Z)을 줄 수 있는데
	// <input type="datetime-local">은 'YYYY-MM-DDTHH:mm'(로컬, TZ 없음)만 받는다.
	// 이미 해당 포맷이면 그대로 두고, 아니면 로컬 시각으로 변환한다.
	function toDateTimeLocal(value: string): string {
		if (!value) return '';
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
		const d = new Date(value);
		if (isNaN(d.getTime())) return '';
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	// 외부에서 수정 모드로 열 수 있도록
	export function openForEdit(event: any) {
		isEditing = true;
		eventId = event.id;
		formData = {
			gameId: event.gameId,
			title: event.title,
			type: event.type,
			startTime: toDateTimeLocal(event.startTime),
			endTime: toDateTimeLocal(event.endTime),
			description: event.description || '',
			image: event.image || '',
			officialLink: event.officialLink || '',
			characterName: event.characterName || ''
		};
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={closeModal}>
	<div
		class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- 모달 헤더 -->
		<div class="mb-6 flex items-center justify-between border-b pb-4">
			<h2 class="text-2xl font-bold text-gray-900">
				{isEditing ? '이벤트 수정' : '새 이벤트 추가'}
			</h2>
			<button class="rounded-full p-2 hover:bg-gray-100" onclick={closeModal} aria-label="닫기">
				<i class="ri-close-line text-xl"></i>
			</button>
		</div>

		<!-- 폼 -->
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="space-y-4">
				<!-- 게임 선택 -->
				<div>
					<label for="gameId" class="mb-2 block text-sm font-medium text-gray-700">
						게임 <span class="text-red-500">*</span>
					</label>
					<select
						id="gameId"
						bind:value={formData.gameId}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
					>
						<option value="">게임 선택...</option>
						{#each gameList as game}
							<option value={game.id}>{game.name}</option>
						{/each}
					</select>
				</div>

				<!-- 이벤트명 -->
				<div>
					<label for="title" class="mb-2 block text-sm font-medium text-gray-700">
						이벤트명 <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="title"
						bind:value={formData.title}
						required
						placeholder="이벤트 이름을 입력하세요"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
					/>
				</div>

				<!-- 이벤트 타입 -->
				<div>
					<label for="type" class="mb-2 block text-sm font-medium text-gray-700">
						타입 <span class="text-red-500">*</span>
					</label>
					<select
						id="type"
						bind:value={formData.type}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
					>
						<option value="GACHA">가챠</option>
						<option value="EVENT">이벤트</option>
						<option value="MAINTENANCE">점검</option>
					</select>
				</div>

				<!-- 날짜/시간 -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="startTime" class="mb-2 block text-sm font-medium text-gray-700">
							시작일시 <span class="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							id="startTime"
							bind:value={formData.startTime}
							required
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="endTime" class="mb-2 block text-sm font-medium text-gray-700">
							종료일시 <span class="text-red-500">*</span>
						</label>
						<input
							type="datetime-local"
							id="endTime"
							bind:value={formData.endTime}
							required
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
						/>
					</div>
				</div>

				<!-- 설명 -->
				<div>
					<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
						설명
					</label>
					<textarea
						id="description"
						bind:value={formData.description}
						rows="3"
						placeholder="이벤트 설명을 입력하세요"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
					></textarea>
				</div>

				<!-- 캐릭터명 (가챠인 경우) -->
				{#if formData.type === 'GACHA'}
					<div>
						<label for="characterName" class="mb-2 block text-sm font-medium text-gray-700">
							캐릭터명
						</label>
						<input
							type="text"
							id="characterName"
							bind:value={formData.characterName}
							placeholder="가챠 캐릭터 이름"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
						/>
					</div>
				{/if}

				<!-- 이미지 URL -->
				<div>
					<label for="image" class="mb-2 block text-sm font-medium text-gray-700">
						이미지 URL
					</label>
					<input
						type="text"
						id="image"
						bind:value={formData.image}
						placeholder="이미지 경로 (예: events/banner.webp)"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
					/>
					<p class="mt-1 text-sm text-gray-500">
						CDN 기본 URL은 자동으로 추가됩니다. 상대 경로만 입력하세요.
					</p>
				</div>

				<!-- 공식 링크 -->
				<div>
					<label for="officialLink" class="mb-2 block text-sm font-medium text-gray-700">
						공식 링크
					</label>
					<input
						type="url"
						id="officialLink"
						bind:value={formData.officialLink}
						placeholder="https://..."
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
					/>
				</div>
			</div>

			<!-- 버튼 -->
			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onclick={closeModal}
					class="rounded-lg border-2 border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
				>
					취소
				</button>
				<button
					type="submit"
					class="rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600"
				>
					{isEditing ? '수정' : '추가'}
				</button>
			</div>
		</form>
	</div>
</div>
