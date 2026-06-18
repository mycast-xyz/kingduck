<script lang="ts">
	import client, { getApiBaseUrl } from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { toastStore } from '../../../service/ToastService';
	import { authTokenService } from '../../../service/auth/AuthTokenService';

	const { data } = $props<{ data: any }>();
	const currentUrl = data.url;

	let games = $state<any[]>([]);
	let selectedSlug = $state('');
	let elements = $state<any[]>([]);
	let uploadingId = $state<number | null>(null);

	// 타입 코드 → 표시 라벨(어드민용). 없으면 코드 그대로.
	const TYPE_LABEL: Record<string, string> = {
		DamageType: '속성',
		Path: '특성 / 운명의 길 / 무기',
		element: '속성',
		weapon: '무기',
		Afflatus: '아플라투스'
	};

	let grouped = $derived.by(() => {
		const g: Record<string, any[]> = {};
		for (const e of elements) (g[e.type] = g[e.type] || []).push(e);
		return g;
	});

	onMount(async () => {
		await loadGames();
	});

	async function loadGames() {
		try {
			const r = await client.get('/api/v0/admin/game/list');
			if (r.data.resultCode === 200) {
				games = r.data.data;
				if (games.length && !selectedSlug) {
					selectedSlug = games[0].slug;
					await loadElements();
				}
			}
		} catch (e) {
			console.error('게임 목록 조회 오류:', e);
		}
	}

	async function loadElements() {
		if (!selectedSlug) return;
		try {
			const r = await client.get(`/api/v0/admin/element/list?slug=${selectedSlug}`);
			if (r.data.resultCode === 200) elements = r.data.data.elements;
		} catch (e) {
			console.error('속성 목록 조회 오류:', e);
			toastStore.error('속성 목록을 불러오지 못했습니다.');
		}
	}

	function onSelectGame(e: Event) {
		selectedSlug = (e.currentTarget as HTMLSelectElement).value;
		loadElements();
	}

	// 한글 표시명 저장(영문 키 → 한글 매핑). 변경 없으면 무시.
	async function saveName(el: any, value: string) {
		const v = value.trim();
		if ((el.displayName || '') === v) return;
		try {
			const r = await client.put(`/api/v0/admin/element/${el.id}`, { displayName: v });
			if (r.data.resultCode === 200) {
				elements = elements.map((x) =>
					x.id === el.id ? { ...x, displayName: r.data.data.displayName } : x
				);
				toastStore.success(`${el.name} 한글명이 저장되었습니다.`);
			} else {
				toastStore.error(r.data.resultMsg || '한글명 저장에 실패했습니다.');
			}
		} catch (e) {
			console.error('한글명 저장 오류:', e);
			toastStore.error('한글명 저장에 실패했습니다.');
		}
	}

	// 원색(틴트) 저장. 빈 값이면 해제(null). 16진수 입력(#붙이기·소문자 정규화, 형식 검증).
	async function saveColor(el: any, value: string) {
		let v = (value || '').trim();
		if (v) {
			if (!v.startsWith('#')) v = '#' + v;
			v = v.toLowerCase();
			if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(v)) {
				toastStore.error('16진수 색상 형식이 아닙니다. 예: #e0533d');
				return;
			}
		}
		if ((el.color || '') === v) return;
		try {
			const r = await client.put(`/api/v0/admin/element/${el.id}`, { color: v });
			if (r.data.resultCode === 200) {
				elements = elements.map((x) => (x.id === el.id ? { ...x, color: r.data.data.color } : x));
				toastStore.success(`${el.name} 색상이 ${v ? '저장' : '해제'}되었습니다.`);
			} else {
				toastStore.error(r.data.resultMsg || '색상 저장에 실패했습니다.');
			}
		} catch (e) {
			console.error('색상 저장 오류:', e);
			toastStore.error('색상 저장에 실패했습니다.');
		}
	}

	function onPickIcon(el: any, e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) uploadIcon(el, file);
		input.value = '';
	}

	async function uploadIcon(el: any, file: File) {
		if (!file.type.startsWith('image/')) {
			toastStore.error('이미지 파일만 업로드할 수 있습니다.');
			return;
		}
		uploadingId = el.id;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch(`${getApiBaseUrl()}/api/v0/admin/element/${el.id}/icon`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${authTokenService.getToken()}` },
				body: form
			});
			const json = await res.json();
			if (res.ok && json?.data?.iconUrl) {
				const newIcon = json.data.iconUrl;
				elements = elements.map((x) => (x.id === el.id ? { ...x, iconUrl: newIcon } : x));
				toastStore.success(`${el.name} 아이콘이 변경되었습니다.`);
			} else {
				toastStore.error(json?.resultMsg || '아이콘 업로드에 실패했습니다.');
			}
		} catch (err) {
			console.error('아이콘 업로드 오류:', err);
			toastStore.error('아이콘 업로드에 실패했습니다.');
		} finally {
			uploadingId = null;
		}
	}
</script>

<div class="rounded-lg bg-white p-6 shadow-md">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-bold text-gray-900">속성 / 특성 아이콘 관리</h2>
		<select
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm"
			value={selectedSlug}
			onchange={onSelectGame}
		>
			{#each games as g}
				<option value={g.slug}>{g.name}</option>
			{/each}
		</select>
	</div>

	<p class="mb-4 text-sm text-gray-500">
		아이콘을 클릭해 이미지를 업로드하면 리스트 필터에 즉시 반영됩니다. (필터 아이콘은 DB의 Element.iconUrl을 사용)
	</p>

	{#if elements.length === 0}
		<div class="py-12 text-center text-gray-500">이 게임에는 등록된 속성/특성이 없습니다.</div>
	{:else}
		{#each Object.entries(grouped) as [type, items]}
			<div class="mb-6">
				<h3 class="mb-3 border-b border-gray-100 pb-1 text-sm font-semibold text-gray-700">
					{TYPE_LABEL[type] || type}
					<span class="text-gray-400">({items.length})</span>
				</h3>
				<div class="flex flex-wrap gap-4">
					{#each items as el}
						<div class="flex w-24 flex-col items-center gap-2 text-center">
							<label
								class="group relative h-16 w-16 cursor-pointer"
								title="클릭하여 아이콘 업로드"
							>
								{#if el.iconUrl}
									<div
										class="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-1"
									>
										{#if el.color}
											<!-- 원색 틴트: 아이콘 알파를 mask로, background-color로 색을 입힘 -->
											<span
												class="h-full w-full"
												style="-webkit-mask:url('{currentUrl}/{el.iconUrl}') center/contain no-repeat; mask:url('{currentUrl}/{el.iconUrl}') center/contain no-repeat; background-color:{el.color};"
											></span>
										{:else}
											<img
												src={currentUrl + '/' + el.iconUrl}
												alt={el.name}
												class="h-full w-full object-contain"
											/>
										{/if}
									</div>
								{:else}
									<div
										class="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-300"
									>
										<i class="ri-image-add-line text-2xl"></i>
									</div>
								{/if}
								<span
									class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
								>
									{#if uploadingId === el.id}
										<i class="ri-loader-4-line animate-spin"></i>
									{:else}
										<i class="ri-camera-line"></i>
									{/if}
								</span>
								<input
									type="file"
									accept="image/*"
									class="hidden"
									onchange={(e) => onPickIcon(el, e)}
								/>
							</label>
							<div class="w-full">
								<input
									class="w-full rounded border border-gray-200 px-1 py-0.5 text-center text-xs font-medium text-gray-800 focus:border-orange-400 focus:outline-none"
									value={el.displayName || ''}
									placeholder={el.name}
									title="한글 표시명 (Enter 또는 포커스 해제 시 저장)"
									onblur={(e) => saveName(el, (e.currentTarget as HTMLInputElement).value)}
									onkeydown={(e) => {
										if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
									}}
								/>
								<div class="mt-0.5 truncate text-[10px] text-gray-400" title={el.name}>
									{el.name}
								</div>
								<!-- 원색(틴트) — 흰색/단색 아이콘에 입힐 16진수 색(#코드 직접 입력) -->
								<div class="mt-1 flex items-center justify-center gap-1">
									<span
										class="h-4 w-4 flex-shrink-0 rounded border border-gray-200"
										style="background-color:{el.color || 'transparent'}"
									></span>
									<input
										type="text"
										class="w-16 rounded border border-gray-200 px-1 py-0.5 text-center text-[10px] focus:border-orange-400 focus:outline-none"
										value={el.color || ''}
										placeholder="#e0533d"
										title="원색 16진수 (Enter 또는 포커스 해제 시 저장)"
										onblur={(e) => saveColor(el, (e.currentTarget as HTMLInputElement).value)}
										onkeydown={(e) => {
											if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
										}}
									/>
									{#if el.color}
										<button
											type="button"
											class="text-[10px] text-gray-400 hover:text-red-500"
											title="틴트 해제"
											onclick={() => saveColor(el, '')}
										>
											해제
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>
