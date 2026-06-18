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
									<img
										src={currentUrl + '/' + el.iconUrl}
										alt={el.name}
										class="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 object-contain p-1"
									/>
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
							<span class="w-full truncate text-xs font-medium text-gray-700" title={el.name}>
								{el.name}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>
