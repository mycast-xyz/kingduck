<script lang="ts">
	import client from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { TeamSlotType } from '../../../model/api/api';

	interface CharacterOption {
		id: number;
		name: string;
		originalId?: string;
		imageUrl?: string;
		rarity?: number;
	}

	let gameList: any[] = $state([]);
	let characterList: CharacterOption[] = $state([]);
	let isEditing = $state(false);
	let teamId = $state<number | null>(null);
	let isSaving = $state(false);
	let isLoadingCharacters = $state(false);

	// 폼 데이터
	let formData = $state({
		gameId: '' as string | number,
		characterId: '' as string | number,
		name: '',
		description: '',
		sortOrder: 0,
		published: true,
		tags: '' // 쉼표 구분 문자열로 입력받아 저장 시 배열 변환
	});

	// 슬롯 목록: 각 슬롯은 { main: originalId, backups: originalId[] }
	let slots: Array<{ main: string; backups: string[] }> = $state([]);

	onMount(async () => {
		await loadGameList();
		const editData = get(WindowService.modalData);
		if (editData) {
			await openForEdit(editData);
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

	async function loadCharacterList(gameId: string | number) {
		if (!gameId) {
			characterList = [];
			return;
		}
		isLoadingCharacters = true;
		try {
			const response = await client.get('/api/v0/admin/character/list', {
				params: { gameId, limit: 999 }
			});
			if (response.data.resultCode === 200) {
				characterList = response.data.data.items ?? [];
			}
		} catch (error) {
			console.error('캐릭터 목록 조회 중 오류 발생:', error);
		} finally {
			isLoadingCharacters = false;
		}
	}

	async function openForEdit(editData: any) {
		isEditing = true;
		teamId = editData.id;
		formData = {
			gameId: editData.gameId,
			characterId: editData.characterId,
			name: editData.name ?? '',
			description: editData.description ?? '',
			sortOrder: editData.sortOrder ?? 0,
			published: editData.published ?? true,
			tags: Array.isArray(editData.tags) ? editData.tags.join(', ') : (editData.tags ?? '')
		};

		await loadCharacterList(editData.gameId);

		// 슬롯 데이터 정규화: main/backups를 originalId(문자열)로 변환
		slots = (editData.slots ?? []).map((s: TeamSlotType) => ({
			main: String(s.main ?? ''),
			backups: (s.backups ?? []).map(String)
		}));
	}

	// 게임 변경 시 캐릭터 목록 갱신 및 의존 필드 초기화
	async function handleGameChange() {
		formData.characterId = '';
		slots = [];
		await loadCharacterList(formData.gameId);
	}

	function closeModal() {
		WindowService.closeModal();
	}

	// 슬롯 추가
	function addSlot() {
		slots = [...slots, { main: '', backups: [] }];
	}

	// 슬롯 삭제
	function removeSlot(index: number) {
		slots = slots.filter((_, i) => i !== index);
	}

	// 슬롯 메인 캐릭터 변경
	function updateSlotMain(index: number, value: string) {
		slots = slots.map((s, i) => (i === index ? { ...s, main: value } : s));
	}

	// 슬롯 백업 캐릭터 추가
	function addBackup(slotIndex: number) {
		slots = slots.map((s, i) => {
			if (i !== slotIndex) return s;
			return { ...s, backups: [...s.backups, ''] };
		});
	}

	// 슬롯 백업 캐릭터 변경
	function updateBackup(slotIndex: number, backupIndex: number, value: string) {
		slots = slots.map((s, i) => {
			if (i !== slotIndex) return s;
			const newBackups = s.backups.map((b, j) => (j === backupIndex ? value : b));
			return { ...s, backups: newBackups };
		});
	}

	// 슬롯 백업 캐릭터 제거
	function removeBackup(slotIndex: number, backupIndex: number) {
		slots = slots.map((s, i) => {
			if (i !== slotIndex) return s;
			return { ...s, backups: s.backups.filter((_, j) => j !== backupIndex) };
		});
	}

	async function handleSubmit() {
		if (!formData.name.trim()) {
			toastStore.warning('팀 이름은 필수 항목입니다.');
			return;
		}
		if (!formData.gameId) {
			toastStore.warning('게임을 선택해주세요.');
			return;
		}
		if (!formData.characterId) {
			toastStore.warning('앵커 캐릭터를 선택해주세요.');
			return;
		}

		// 슬롯 유효성: main이 있는 슬롯만 포함
		const validSlots = slots
			.filter((s) => s.main)
			.map((s) => ({
				main: s.main,
				backups: s.backups.filter(Boolean)
			}));

		const wasEditing = isEditing;

		isSaving = true;
		try {
			const tagsArray = formData.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean);

			if (wasEditing) {
				const body: any = {
					name: formData.name.trim(),
					description: formData.description.trim() || undefined,
					slots: validSlots,
					sortOrder: formData.sortOrder,
					published: formData.published
				};
				if (tagsArray.length > 0) body.tags = tagsArray;

				const response = await client.put(`/api/v0/admin/team/${teamId}`, body);
				const code = response.data.resultCode;
				if (code !== 200) {
					toastStore.error(response.data.resultMsg || '수정에 실패했습니다.');
					return;
				}
				toastStore.success('팀 추천이 수정되었습니다.');
			} else {
				const body: any = {
					gameId: Number(formData.gameId),
					characterId: Number(formData.characterId),
					name: formData.name.trim(),
					slots: validSlots,
					sortOrder: formData.sortOrder,
					published: formData.published
				};
				if (formData.description.trim()) body.description = formData.description.trim();
				if (tagsArray.length > 0) body.tags = tagsArray;

				const response = await client.post('/api/v0/admin/team', body);
				const code = response.data.resultCode;
				if (code !== 200 && code !== 201) {
					toastStore.error(response.data.resultMsg || '추가에 실패했습니다.');
					return;
				}
				toastStore.success('팀 추천이 추가되었습니다.');
			}

			closeModal();
		} catch (error: any) {
			if (error?.response?.status === 409) {
				toastStore.error('이미 존재하는 팀 이름입니다.');
			} else {
				console.error('팀 저장 중 오류 발생:', error);
				toastStore.error('저장에 실패했습니다.');
			}
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-5">
	<!-- 게임 선택 -->
	<div>
		<label for="team-gameId" class="mb-2 block text-sm font-medium text-gray-700">
			게임 <span class="text-red-500">*</span>
		</label>
		{#if isEditing}
			<p class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">
				{gameList.find((g) => Number(g.id) === Number(formData.gameId))?.name ??
					`ID: ${formData.gameId}`}
				<span class="ml-2 text-xs text-gray-400">(생성 후 변경 불가)</span>
			</p>
		{:else}
			<select
				id="team-gameId"
				bind:value={formData.gameId}
				onchange={handleGameChange}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			>
				<option value="">게임 선택...</option>
				{#each gameList as game}
					<option value={game.id}>{game.name}</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- 앵커 캐릭터 선택 -->
	<div>
		<label for="team-characterId" class="mb-2 block text-sm font-medium text-gray-700">
			앵커 캐릭터 <span class="text-red-500">*</span>
		</label>
		{#if isLoadingCharacters}
			<p class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
				<i class="ri-loader-4-line animate-spin mr-1"></i>캐릭터 목록 로딩 중...
			</p>
		{:else}
			<select
				id="team-characterId"
				bind:value={formData.characterId}
				disabled={!formData.gameId || characterList.length === 0}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
			>
				<option value="">캐릭터 선택...</option>
				{#each characterList as char}
					<option value={char.id}>{char.name}</option>
				{/each}
			</select>
		{/if}
		<p class="mt-1 text-xs text-gray-400">앵커 캐릭터 ID(DB id)가 characterId로 저장됩니다.</p>
	</div>

	<!-- 팀 이름 -->
	<div>
		<label for="team-name" class="mb-2 block text-sm font-medium text-gray-700">
			팀 이름 <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="team-name"
			bind:value={formData.name}
			placeholder="예: 원신 만개 국제팀"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 설명 -->
	<div>
		<label for="team-description" class="mb-2 block text-sm font-medium text-gray-700">
			설명
		</label>
		<textarea
			id="team-description"
			bind:value={formData.description}
			placeholder="팀 구성에 대한 설명을 입력하세요."
			rows="2"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		></textarea>
	</div>

	<!-- 태그 / 정렬순서 / 공개 -->
	<div class="grid grid-cols-3 gap-4">
		<div class="col-span-2">
			<label for="team-tags" class="mb-2 block text-sm font-medium text-gray-700">
				태그 <span class="text-xs font-normal text-gray-400">(쉼표로 구분)</span>
			</label>
			<input
				type="text"
				id="team-tags"
				bind:value={formData.tags}
				placeholder="예: 공략, 초보, 원거리"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
		<div>
			<label for="team-sortOrder" class="mb-2 block text-sm font-medium text-gray-700">
				정렬 순서
			</label>
			<input
				type="number"
				id="team-sortOrder"
				bind:value={formData.sortOrder}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<input
			type="checkbox"
			id="team-published"
			bind:checked={formData.published}
			class="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
		/>
		<label for="team-published" class="text-sm font-medium text-gray-700">공개</label>
	</div>

	<!-- 슬롯 에디터 -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">
				슬롯 구성
				<span class="ml-1 text-xs font-normal text-gray-400">(메인 + 대체 캐릭터)</span>
			</span>
			<button
				type="button"
				onclick={addSlot}
				class="inline-flex items-center rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-200"
			>
				<i class="ri-add-line mr-1"></i>슬롯 추가
			</button>
		</div>

		<div class="space-y-3">
			{#each slots as slot, slotIdx}
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
					<!-- 슬롯 헤더: 메인 캐릭터 선택 + 삭제 -->
					<div class="mb-2 flex items-center gap-2">
						<span class="min-w-[3rem] text-xs font-semibold text-gray-500">
							슬롯 {slotIdx + 1}
						</span>
						<select
							value={slot.main}
							onchange={(e) => updateSlotMain(slotIdx, (e.target as HTMLSelectElement).value)}
							disabled={!formData.gameId || characterList.length === 0}
							class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
						>
							<option value="">메인 캐릭터 선택 (originalId)...</option>
							{#each characterList as char}
								<option value={char.originalId != null ? String(char.originalId) : ''} disabled={char.originalId == null}>
									{char.name}
								</option>
							{/each}
						</select>
						<button
							type="button"
							aria-label="슬롯 삭제"
							onclick={() => removeSlot(slotIdx)}
							class="text-red-400 hover:text-red-600"
						>
							<i class="ri-delete-bin-line text-lg"></i>
						</button>
					</div>

					<!-- 백업 캐릭터 서브테이블 -->
					<div class="ml-14">
						{#if slot.backups.length > 0}
							<div class="mb-1 rounded border border-gray-100 overflow-hidden">
								<table class="w-full text-xs">
									<thead class="bg-white text-gray-500">
										<tr>
											<th class="px-3 py-1.5 text-left font-medium">대체 캐릭터</th>
											<th class="w-8 px-3 py-1.5">
												<span class="sr-only">삭제</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{#each slot.backups as backup, backupIdx}
											<tr class="border-t border-gray-100 hover:bg-gray-50">
												<td class="px-3 py-1.5">
													<select
														value={backup}
														onchange={(e) =>
															updateBackup(
																slotIdx,
																backupIdx,
																(e.target as HTMLSelectElement).value
															)}
														disabled={!formData.gameId || characterList.length === 0}
														class="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
													>
														<option value="">대체 캐릭터 선택...</option>
														{#each characterList as char}
															<option value={char.originalId != null ? String(char.originalId) : ''} disabled={char.originalId == null}>
																{char.name}
															</option>
														{/each}
													</select>
												</td>
												<td class="px-3 py-1.5 text-right">
													<button
														type="button"
														aria-label="대체 캐릭터 제거"
														onclick={() => removeBackup(slotIdx, backupIdx)}
														class="text-red-400 hover:text-red-600"
													>
														<i class="ri-delete-bin-line"></i>
													</button>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
						<button
							type="button"
							onclick={() => addBackup(slotIdx)}
							class="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200"
						>
							<i class="ri-add-line mr-1"></i>대체 추가
						</button>
					</div>
				</div>
			{/each}
			{#if slots.length === 0}
				<p class="rounded-lg border border-dashed border-gray-300 px-4 py-4 text-center text-xs text-gray-400">
					슬롯이 없습니다. 위 "슬롯 추가" 버튼으로 추가하세요.
				</p>
			{/if}
		</div>
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
