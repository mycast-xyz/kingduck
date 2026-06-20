<script lang="ts">
	import client from '../../../service/api/client';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	interface RedeemCode {
		id?: number | string;
		groupId?: number | string;
		code: string;
		reward?: string;
	}

	let gameList: any[] = $state([]);
	let isEditing = $state(false);
	let groupId = $state<number | string | null>(null);
	let isSaving = $state(false);

	// 그룹 폼 데이터
	let formData = $state({
		gameId: '' as string | number,
		title: '',
		periodText: '',
		startTime: '',
		endTime: ''
	});

	// 코드 목록 (신규: 로컬 배열, 편집: 서버 실시간 반영)
	let codes: RedeemCode[] = $state([]);

	// 새 코드 입력 행
	let newCode = $state({ code: '', reward: '' });
	let isAddingCode = $state(false);

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

	async function openForEdit(editData: any) {
		isEditing = true;
		groupId = editData.id;
		formData = {
			gameId: editData.gameId,
			title: editData.title,
			periodText: editData.periodText ?? '',
			startTime: toDateTimeLocal(editData.startTime ?? ''),
			endTime: toDateTimeLocal(editData.endTime ?? '')
		};

		// 최신 코드 목록 로드
		try {
			const response = await client.get(`/api/v0/admin/redeem/group/${editData.id}`);
			if (response.data.resultCode === 200) {
				codes = response.data.data.codes ?? [];
			} else {
				// 폴백: editData에 포함된 codes 사용
				codes = editData.codes ?? [];
			}
		} catch (error) {
			console.error('그룹 코드 조회 중 오류 발생:', error);
			codes = editData.codes ?? [];
		}
	}

	function closeModal() {
		WindowService.closeModal();
	}

	// 편집 모드: 코드 즉시 추가
	async function addCodeLive() {
		if (!newCode.code.trim()) {
			toastStore.warning('코드를 입력해주세요.');
			return;
		}
		isAddingCode = true;
		try {
			const body: any = { code: newCode.code.trim() };
			if (newCode.reward.trim()) body.reward = newCode.reward.trim();

			const response = await client.post(`/api/v0/admin/redeem/group/${groupId}/code`, body);
			const code = response.data.resultCode;
			if (code !== 200 && code !== 201) {
				toastStore.error(response.data.resultMsg || '코드 추가에 실패했습니다.');
				return;
			}
			codes = [...codes, response.data.data];
			newCode = { code: '', reward: '' };
			toastStore.success('코드가 추가되었습니다.');
		} catch (err: any) {
			if (err?.response?.status === 409) {
				toastStore.error('이미 존재하는 코드입니다.');
			} else {
				console.error('코드 추가 중 오류 발생:', err);
				toastStore.error('코드 추가에 실패했습니다.');
			}
		} finally {
			isAddingCode = false;
		}
	}

	// 편집 모드: 코드 즉시 삭제
	async function deleteCodeLive(codeId: number | string) {
		if (!confirm('이 코드를 삭제하시겠습니까?')) return;
		try {
			const response = await client.delete(`/api/v0/admin/redeem/code/${codeId}`);
			if (response.data.resultCode === 200) {
				codes = codes.filter((c) => c.id !== codeId);
				toastStore.success('코드가 삭제되었습니다.');
			} else {
				toastStore.error(response.data.resultMsg || '코드 삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('코드 삭제 중 오류 발생:', error);
			toastStore.error('코드 삭제에 실패했습니다.');
		}
	}

	// 신규 모드: 로컬 코드 추가
	function addCodeLocal() {
		if (!newCode.code.trim()) {
			toastStore.warning('코드를 입력해주세요.');
			return;
		}
		const isDuplicate = codes.some((c) => c.code === newCode.code.trim());
		if (isDuplicate) {
			toastStore.error('이미 입력된 코드입니다.');
			return;
		}
		codes = [...codes, { code: newCode.code.trim(), reward: newCode.reward.trim() || undefined }];
		newCode = { code: '', reward: '' };
	}

	// 신규 모드: 로컬 코드 제거
	function removeCodeLocal(index: number) {
		codes = codes.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		if (!formData.title.trim()) {
			toastStore.warning('그룹 제목은 필수 항목입니다.');
			return;
		}
		if (!isEditing && !formData.gameId) {
			toastStore.warning('게임을 선택해주세요.');
			return;
		}

		// 진입 시점의 모드 보존
		const wasEditing = isEditing;

		isSaving = true;
		try {
			if (wasEditing) {
				// 그룹 정보만 수정 (gameId·코드는 별도 처리). 빈 값은 null로 명시해 해제 가능하게.
				// startTime은 스키마상 non-nullable이라 값이 있을 때만 전송. datetime-local → ISO 변환.
				const body: any = { title: formData.title.trim() };
				body.periodText = formData.periodText.trim() || null;
				if (formData.startTime) body.startTime = new Date(formData.startTime).toISOString();
				body.endTime = formData.endTime ? new Date(formData.endTime).toISOString() : null;

				const response = await client.put(`/api/v0/admin/redeem/group/${groupId}`, body);
				const code = response.data.resultCode;
				if (code !== 200) {
					toastStore.error(response.data.resultMsg || '수정에 실패했습니다.');
					return;
				}
				toastStore.success('쿠폰 그룹이 수정되었습니다.');
			} else {
				// 그룹 + 코드 일괄 생성
				const body: any = {
					gameId: Number(formData.gameId),
					title: formData.title.trim()
				};
				if (formData.periodText.trim()) body.periodText = formData.periodText.trim();
				if (formData.startTime) body.startTime = new Date(formData.startTime).toISOString();
				if (formData.endTime) body.endTime = new Date(formData.endTime).toISOString();
				if (codes.length > 0) {
					body.codes = codes.map((c) => {
						const entry: any = { code: c.code };
						if (c.reward) entry.reward = c.reward;
						return entry;
					});
				}

				const response = await client.post('/api/v0/admin/redeem/group', body);
				const code = response.data.resultCode;
				if (code !== 200 && code !== 201) {
					toastStore.error(response.data.resultMsg || '추가에 실패했습니다.');
					return;
				}
				toastStore.success('쿠폰 그룹이 추가되었습니다.');
			}

			closeModal();
		} catch (error: any) {
			if (error?.response?.status === 409) {
				toastStore.error('중복된 코드가 포함되어 있습니다.');
			} else {
				console.error('쿠폰 그룹 저장 중 오류 발생:', error);
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
	<!-- 게임 선택 (신규 모드에서만 변경 가능) -->
	<div>
		<label for="redeem-gameId" class="mb-2 block text-sm font-medium text-gray-700">
			게임 {#if !isEditing}<span class="text-red-500">*</span>{/if}
		</label>
		{#if isEditing}
			<p class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">
				{gameList.find((g) => Number(g.id) === Number(formData.gameId))?.name ??
					`ID: ${formData.gameId}`}
				<span class="ml-2 text-xs text-gray-400">(생성 후 변경 불가)</span>
			</p>
		{:else}
			<select
				id="redeem-gameId"
				bind:value={formData.gameId}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			>
				<option value="">게임 선택...</option>
				{#each gameList as game}
					<option value={game.id}>{game.name}</option>
				{/each}
			</select>
		{/if}
	</div>

	<!-- 그룹 제목 -->
	<div>
		<label for="redeem-title" class="mb-2 block text-sm font-medium text-gray-700">
			그룹 제목 <span class="text-red-500">*</span>
		</label>
		<input
			type="text"
			id="redeem-title"
			bind:value={formData.title}
			placeholder="예: 1주년 기념 코드"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 기간 텍스트 -->
	<div>
		<label for="redeem-periodText" class="mb-2 block text-sm font-medium text-gray-700">
			기간 텍스트
		</label>
		<input
			type="text"
			id="redeem-periodText"
			bind:value={formData.periodText}
			placeholder="예: 2026-01-01 ~ 2026-12-31 (빈 칸이면 시작/종료일로 표시)"
			class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
		/>
	</div>

	<!-- 시작/종료 일시 -->
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="redeem-startTime" class="mb-2 block text-sm font-medium text-gray-700">
				시작 일시
			</label>
			<input
				type="datetime-local"
				id="redeem-startTime"
				bind:value={formData.startTime}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
		<div>
			<label for="redeem-endTime" class="mb-2 block text-sm font-medium text-gray-700">
				종료 일시
			</label>
			<input
				type="datetime-local"
				id="redeem-endTime"
				bind:value={formData.endTime}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
			/>
		</div>
	</div>

	<!-- 코드 서브테이블 -->
	<div>
		<div class="mb-2 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">쿠폰 코드</span>
			<span class="text-xs text-gray-400">{codes.length}개</span>
		</div>

		<div class="rounded-lg border border-gray-200 overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 text-xs uppercase text-gray-600">
					<tr>
						<th class="px-4 py-2 text-left">코드</th>
						<th class="px-4 py-2 text-left">보상</th>
						<th class="px-4 py-2 w-12">
							<span class="sr-only">삭제</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each codes as codeItem, i}
						<tr class="border-t border-gray-100 hover:bg-gray-50">
							<td class="px-4 py-2 font-mono text-xs text-gray-800">{codeItem.code}</td>
							<td class="px-4 py-2 text-gray-600">{codeItem.reward ?? '-'}</td>
							<td class="px-4 py-2 text-right">
								{#if isEditing && codeItem.id}
									<button
										type="button"
										aria-label="코드 삭제"
										class="text-red-400 hover:text-red-600"
										onclick={() => deleteCodeLive(codeItem.id!)}
									>
										<i class="ri-delete-bin-line"></i>
									</button>
								{:else if !isEditing}
									<button
										type="button"
										aria-label="코드 제거"
										class="text-red-400 hover:text-red-600"
										onclick={() => removeCodeLocal(i)}
									>
										<i class="ri-delete-bin-line"></i>
									</button>
								{/if}
							</td>
						</tr>
					{/each}
					{#if codes.length === 0}
						<tr>
							<td colspan="3" class="px-4 py-4 text-center text-xs text-gray-400">
								코드가 없습니다. 아래에서 추가하세요.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- 새 코드 입력 행 -->
		<div class="mt-2 flex items-center gap-2">
			<input
				type="text"
				bind:value={newCode.code}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						isEditing ? addCodeLive() : addCodeLocal();
					}
				}}
				placeholder="코드 입력"
				class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
			/>
			<input
				type="text"
				bind:value={newCode.reward}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						isEditing ? addCodeLive() : addCodeLocal();
					}
				}}
				placeholder="보상 (선택)"
				class="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
			/>
			<button
				type="button"
				disabled={isAddingCode}
				onclick={() => (isEditing ? addCodeLive() : addCodeLocal())}
				class="inline-flex items-center rounded-lg bg-orange-100 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-200 disabled:opacity-50"
			>
				{#if isAddingCode}
					<i class="ri-loader-4-line animate-spin"></i>
				{:else}
					<i class="ri-add-line"></i>
				{/if}
				<span class="ml-1">추가</span>
			</button>
		</div>
		{#if isEditing}
			<p class="mt-1 text-xs text-gray-400">편집 모드에서 코드 추가·삭제는 즉시 반영됩니다.</p>
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
