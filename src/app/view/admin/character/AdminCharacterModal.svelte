<script lang="ts">
	import client, { getApiBaseUrl } from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { authTokenService } from '../../../service/auth/AuthTokenService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let gameList: any[] = $state([]);
	let isEditing = $state(false);
	let characterId = $state<number | null>(null);
	let pendingImageFile = $state<File | null>(null);
	let isSaving = $state(false);
	let isUploading = $state(false);

	let formData = $state({
		gameId: '' as string | number,
		name: '',
		rarity: '',
		originalId: '',
		description: '',
		imageUrl: ''
	});

	onMount(async () => {
		await loadGameList();
		const editData = get(WindowService.modalData);
		if (editData) {
			openForEdit(editData);
		}
	});

	async function loadGameList() {
		try {
			const response = await client.get('/api/v0/admin/game/list');
			if (response.data.resultCode === 200) {
				gameList = response.data.data;
			}
		} catch (error) {
			console.error('게임 목록 조회 중 오류 발생:', error);
		}
	}

	function openForEdit(item: any) {
		isEditing = true;
		characterId = item.id;
		formData = {
			gameId: item.gameId,
			name: item.name,
			rarity: item.rarity != null ? String(item.rarity) : '',
			originalId: item.originalId ?? '',
			description: item.description ?? '',
			imageUrl: item.imageUrl ?? ''
		};
	}

	function closeModal() {
		WindowService.closeModal();
	}

	function handleImagePick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		pendingImageFile = input.files?.[0] ?? null;
	}

	async function uploadImage(id: number): Promise<string | null> {
		if (!pendingImageFile) return null;
		isUploading = true;
		try {
			const form = new FormData();
			form.append('file', pendingImageFile);
			const res = await fetch(`${getApiBaseUrl()}/api/v0/admin/character/${id}/image`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${authTokenService.getToken()}` },
				body: form
			});
			const json = await res.json();
			if (res.ok && json?.data?.imageUrl) {
				formData.imageUrl = json.data.imageUrl;
				return json.data.imageUrl;
			} else {
				toastStore.error(json?.resultMsg || '이미지 업로드에 실패했습니다.');
				return null;
			}
		} catch (err) {
			console.error('이미지 업로드 오류:', err);
			toastStore.error('이미지 업로드에 실패했습니다.');
			return null;
		} finally {
			isUploading = false;
		}
	}

	async function handleSubmit() {
		if (!formData.gameId || !formData.name.trim()) {
			toastStore.warning('게임과 이름은 필수 항목입니다.');
			return;
		}

		// 진입 시점의 모드를 보존
		const wasEditing = isEditing;

		isSaving = true;
		try {
			const body: any = {
				gameId: Number(formData.gameId),
				name: formData.name
			};
			const rarityNum = parseInt(formData.rarity, 10);
			if (formData.rarity.trim() !== '' && !isNaN(rarityNum)) body.rarity = rarityNum;
			if (formData.originalId) body.originalId = formData.originalId;
			if (formData.description) body.description = formData.description;
			if (formData.imageUrl) body.imageUrl = formData.imageUrl;

			let savedId = characterId;

			if (wasEditing) {
				const response = await client.put(`/api/v0/admin/character/${characterId}`, body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 게임·원본 ID의 캐릭터가 이미 존재합니다.');
					return;
				}
				if (code !== 200) {
					toastStore.error(response.data.resultMsg || '수정에 실패했습니다.');
					return;
				}
			} else {
				const response = await client.post('/api/v0/admin/character', body);
				const code = response.data.resultCode;
				if (code === 409) {
					toastStore.error('동일한 게임·원본 ID의 캐릭터가 이미 존재합니다.');
					return;
				}
				if (code !== 200 && code !== 201) {
					toastStore.error(response.data.resultMsg || '추가에 실패했습니다.');
					return;
				}
				savedId = response.data.data?.id ?? null;
				// 신규 생성 후 이미지 업로드를 위해 id 보관
				if (savedId) {
					characterId = savedId;
					isEditing = true;
				}
			}

			// 이미지 파일이 선택돼 있으면 id 확보 후 업로드
			if (pendingImageFile && savedId) {
				const newUrl = await uploadImage(savedId);
				if (newUrl) {
					toastStore.success(
						wasEditing
							? '캐릭터와 이미지가 저장되었습니다.'
							: '캐릭터가 추가되고 이미지가 업로드되었습니다.'
					);
				} else {
					toastStore.warning('캐릭터는 저장됐으나 이미지 업로드는 실패했습니다.');
				}
			} else {
				toastStore.success(wasEditing ? '캐릭터가 수정되었습니다.' : '캐릭터가 추가되었습니다.');
			}

			// watcher가 목록을 재갱신하므로 invalidateAll 불필요
			closeModal();
		} catch (err: any) {
			if (err?.response?.status === 409) {
				toastStore.error('동일한 게임·원본 ID의 캐릭터가 이미 존재합니다.');
			} else {
				console.error('캐릭터 저장 중 오류 발생:', err);
				toastStore.error('저장에 실패했습니다.');
			}
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-4">
	<!-- 게임 선택 -->
	<div>
		<label for="char-gameId" class="mb-2 block text-sm font-medium text-gray-700">
			게임 <span class="text-red-500">*</span>
		</label>
		<select
			id="char-gameId"
			bind:value={formData.gameId}
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		>
			<option value="">게임 선택...</option>
			{#each gameList as game}
				<option value={game.id}>{game.name}</option>
			{/each}
		</select>
	</div>

	<!-- 이름 -->
	<div>
		<label for="char-name" class="mb-2 block text-sm font-medium text-gray-700">
			이름 <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="char-name"
			bind:value={formData.name}
			placeholder="캐릭터 이름을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<!-- 등급 -->
		<div>
			<label for="char-rarity" class="mb-2 block text-sm font-medium text-gray-700">등급</label>
			<input
				type="number"
				id="char-rarity"
				bind:value={formData.rarity}
				min="1"
				max="6"
				placeholder="예: 5"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>

		<!-- 원본 ID -->
		<div>
			<label for="char-originalId" class="mb-2 block text-sm font-medium text-gray-700">
				원본 ID
			</label>
			<input
				type="text"
				id="char-originalId"
				bind:value={formData.originalId}
				placeholder="외부 소스 식별자 (선택)"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
	</div>

	<!-- 설명 -->
	<div>
		<label for="char-description" class="mb-2 block text-sm font-medium text-gray-700">설명</label>
		<textarea
			id="char-description"
			bind:value={formData.description}
			rows="3"
			placeholder="캐릭터 설명을 입력하세요"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		></textarea>
	</div>

	<!-- 이미지 URL (직접 입력) -->
	<div>
		<label for="char-imageUrl" class="mb-2 block text-sm font-medium text-gray-700">
			이미지 URL
		</label>
		<input
			type="text"
			id="char-imageUrl"
			bind:value={formData.imageUrl}
			placeholder="상대 경로 (예: characters/hu-tao.webp)"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
		<p class="mt-1 text-xs text-gray-500">상대 경로만 입력하세요. CDN 기본 URL은 자동으로 추가됩니다.</p>
	</div>

	<!-- 이미지 파일 업로드 -->
	<div>
		<label class="mb-2 block text-sm font-medium text-gray-700">이미지 파일 업로드</label>

		{#if formData.imageUrl}
			<div class="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
				<img
					src={getApiBaseUrl() + '/' + formData.imageUrl}
					alt="현재 캐릭터 이미지"
					class="h-12 w-12 rounded object-contain"
				/>
				<p class="truncate text-xs text-gray-500">{formData.imageUrl}</p>
			</div>
		{/if}

		<label class="flex cursor-pointer items-center gap-2">
			<input type="file" accept="image/*" class="hidden" onchange={handleImagePick} />
			<span
				class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
			>
				<i class="ri-upload-2-line mr-2"></i>
				{pendingImageFile ? pendingImageFile.name : '파일 선택'}
			</span>
		</label>
		{#if !isEditing && pendingImageFile}
			<p class="mt-1 text-xs text-gray-500">
				저장 버튼을 누르면 캐릭터를 먼저 생성한 후 이미지가 자동으로 업로드됩니다.
			</p>
		{/if}
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
			disabled={isSaving || isUploading}
			class="inline-flex items-center rounded-lg bg-orange-500 px-6 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
		>
			{#if isSaving || isUploading}
				<i class="ri-loader-4-line mr-2 animate-spin"></i>
			{/if}
			{isEditing ? '수정' : '추가'}
		</button>
	</div>
</div>
