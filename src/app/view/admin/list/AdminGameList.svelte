<script lang="ts">
	import client, { getApiBaseUrl } from '../../../service/api/client';
	import { onMount } from 'svelte';
	import { WindowService } from '../../../service/WindowService';
	import { toastStore } from '../../../service/ToastService';
	import { authTokenService } from '../../../service/auth/AuthTokenService';
	import AdminRarityColorEditor from './AdminRarityColorEditor.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	let gameList: any = $state([]);
	let uploadingSlug = $state<string | null>(null);
	let editingColors = $state<{ slug: string; name: string } | null>(null);

	onMount(async () => {
		await getGameList();
	});

	// generic admin/[slug] 라우트라 invalidateAll()로는 목록이 갱신되지 않는다.
	// 게임 추가/수정 모달이 닫히면 다시 불러온다.
	const modalStore = WindowService.modal;
	let gameModalWasOpen = false;
	$effect(() => {
		const open = $modalStore === 'admin-add-game';
		if (gameModalWasOpen && !open) {
			getGameList();
		}
		gameModalWasOpen = open;
	});

	// 파일 선택 → 아이콘 업로드.
	function onPickIcon(game: any, e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) uploadIcon(game, file);
		input.value = ''; // 같은 파일 재선택 허용
	}

	async function uploadIcon(game: any, file: File) {
		if (!file.type.startsWith('image/')) {
			toastStore.error('이미지 파일만 업로드할 수 있습니다.');
			return;
		}
		uploadingSlug = game.slug;
		try {
			const form = new FormData();
			form.append('file', file);
			// FormData는 fetch로 보내 multipart boundary가 자동 설정되게 한다(인증 토큰 수동 첨부).
			const res = await fetch(`${getApiBaseUrl()}/api/v0/admin/game/${game.slug}/icon`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${authTokenService.getToken()}` },
				body: form
			});
			const json = await res.json();
			if (res.ok && json?.data?.iconUrl) {
				const newIcon = json.data.iconUrl;
				// 캐시버스팅 포함된 새 iconUrl로 교체 → 즉시 미리보기 갱신.
				gameList = gameList.map((g: any) =>
					g.slug === game.slug ? { ...g, iconUrl: newIcon } : g
				);
				toastStore.success(`${game.name} 아이콘이 변경되었습니다.`);
			} else {
				toastStore.error(json?.resultMsg || '아이콘 업로드에 실패했습니다.');
			}
		} catch (err) {
			console.error('아이콘 업로드 오류:', err);
			toastStore.error('아이콘 업로드에 실패했습니다.');
		} finally {
			uploadingSlug = null;
		}
	}

	async function getGameList() {
		try {
			const response = await client.get('/api/v0/admin/game/list');
			if (response.data.resultCode === 200) {
				gameList = response.data.data;
			} else {
				console.error('서버 응답 코드 에러:', response.data.resultCode);
			}
		} catch (error) {
			console.error('게임 목록 조회 중 오류 발생:', error);
		}
	}

	// 검색어 상태
	let searchQuery = $state('');
</script>

<div class="mx-auto pb-4">
	<div class="mb-4 flex items-center justify-between">
		<div class="flex w-1/3">
			<div class="relative w-full">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="검색어를 입력하세요"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
				/>
				<button type="submit" class="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-900">
					<i class="ri-search-line text-lg"></i>
				</button>
			</div>
		</div>
		<button
			class="inline-flex items-center rounded-lg bg-orange-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
			onclick={() => WindowService.openModal('admin-add-game')}
		>
			<i class="ri-add-line mr-2 text-lg"></i>
			게임 추가
		</button>
	</div>
	<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
		<table class="w-full text-left text-sm text-gray-500">
			<thead class="bg-gray-50 text-xs uppercase text-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3">게임이름</th>
					<th scope="col" class="px-6 py-3">총 캐릭터 수</th>
					<th scope="col" class="px-6 py-3">총 아이템 수</th>
					<th scope="col" class="px-6 py-3">총 타입 수</th>
					<th scope="col" class="px-6 py-3">상태</th>
					<th scope="col" class="px-6 py-3">
						<span class="sr-only">편집</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each gameList as game}
					<tr class="border-b bg-white hover:bg-gray-50">
						<td class="px-6 py-4 font-medium text-gray-900">
							<div class="flex items-center">
								<!-- 클릭/호버로 아이콘 업로드 -->
								<label
									class="group relative mr-3 h-10 w-10 cursor-pointer"
									title="아이콘 변경 (클릭하여 이미지 업로드)"
								>
									<img
										src={data.url + '/' + game.iconUrl}
										alt={game.name}
										class="h-10 w-10 rounded-full object-cover"
									/>
									<span
										class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
									>
										{#if uploadingSlug === game.slug}
											<i class="ri-loader-4-line animate-spin"></i>
										{:else}
											<i class="ri-camera-line"></i>
										{/if}
									</span>
									<input
										id="icon-input-{game.slug}"
										type="file"
										accept="image/*"
										class="hidden"
										onchange={(e) => onPickIcon(game, e)}
									/>
								</label>

								<div>
									<div class="text-sm font-medium">{game.name}</div>
									<div class="text-xs font-normal text-gray-500">
										주소 : {game.slug}
									</div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center justify-between">
								<p>{game.counts.characters}</p>
								<a
									href="/admin/character?gameId={game.id}"
									aria-label="캐릭터 관리"
									class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-external-link-line"></i>
								</a>
							</div>
						</td>

						<td class="px-6 py-4">
							<div class="flex items-center justify-between">
								<p>{game.counts.items}</p>
								<a
									href="/admin/item?gameId={game.id}"
									aria-label="아이템 관리"
									class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-external-link-line"></i>
								</a>
							</div>
						</td>

						<td class="px-6 py-4">
							<div class="flex items-center justify-between">
								<p>{game.counts.types}</p>
								<a
									href="/admin/type?gameId={game.id}"
									aria-label="타입 관리"
									class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
								>
									<i class="ri-external-link-line"></i>
								</a>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center">
								<div class="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
								활성화
							</div>
						</td>
						<td class="px-6 py-4 text-right">
							<button
								type="button"
								aria-label="게임 수정"
								onclick={() => WindowService.openModal('admin-add-game', game)}
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-edit-box-line text-xl"></i>
								수정
							</button>
							<button
								type="button"
								aria-label="아이콘 변경"
								title="이미지를 업로드해 아이콘을 교체합니다"
								onclick={() => document.getElementById(`icon-input-${game.slug}`)?.click()}
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-image-edit-line text-xl"></i>
								아이콘 변경
							</button>
							<button
								type="button"
								aria-label="등급 색상"
								title="등급별 카드 색상 편집"
								onclick={() => (editingColors = { slug: game.slug, name: game.name })}
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-palette-line text-xl"></i>
								등급 색상
							</button>
							<button
								type="button"
								aria-label="변수 설정"
								onclick={() => toastStore.info('변수 설정은 준비 중입니다.')}
								class="rounded-lg px-3 py-2 font-medium text-orange-400 hover:bg-orange-100 hover:text-orange-600"
							>
								<i class="ri-code-box-line text-xl"></i>
								변수 설정
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if editingColors}
	<AdminRarityColorEditor
		slug={editingColors.slug}
		gameName={editingColors.name}
		onClose={() => (editingColors = null)}
	/>
{/if}
