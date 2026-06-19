<script lang="ts">
	import { onMount } from 'svelte';
	import { toastStore } from '../../../service/ToastService';
	import client from '../../../service/api/client';

	type GapItem = { name: string; originalId: string | null; missing: string[] };
	type GameGap = {
		slug: string;
		gameName: string;
		total: number;
		gapCount: number;
		completeness: number;
		items: GapItem[];
	};

	let games = $state<GameGap[]>([]);
	let loading = $state(true);
	let expanded = $state<Record<string, boolean>>({});
	let running = $state<string | null>(null);

	// 누락 항목 한글 라벨
	const GAP_LABEL: Record<string, string> = {
		image: '이미지',
		skills: '스킬',
		recommendations: '추천'
	};

	// 누락 종류 → 이를 채우는 크롤 타입. 스킬은 니케만 detail, 나머진 character.
	function crawlTypesFor(slug: string, items: GapItem[]): string[] {
		const types = new Set<string>();
		for (const it of items) {
			for (const m of it.missing) {
				if (m === 'image') types.add('character');
				else if (m === 'skills') types.add(slug === 'nikke' ? 'detail' : 'character');
				else if (m === 'recommendations') types.add('build');
			}
		}
		return [...types];
	}

	async function load() {
		loading = true;
		try {
			const res = await client.get('/api/v0/admin/data-gaps');
			games = res.data?.games ?? res.data?.data?.games ?? [];
		} catch (e) {
			console.error('데이터 공백 조회 실패:', e);
			toastStore.error('데이터 공백 조회에 실패했습니다.');
		} finally {
			loading = false;
		}
	}

	onMount(load);

	function toggle(slug: string) {
		expanded[slug] = !expanded[slug];
	}

	// 해당 게임의 공백을 채우는 크롤을 강제 모드로 실행.
	async function recrawl(g: GameGap) {
		const types = crawlTypesFor(g.slug, g.items);
		if (!types.length) return;
		if (!confirm(`${g.gameName}의 공백을 채우기 위해 ${types.join(', ')} 크롤을 강제 실행할까요?`)) return;
		running = g.slug;
		let ok = 0;
		for (const type of types) {
			try {
				await client.post('/api/v0/admin/crawler/run', {
					gameSlug: g.slug,
					crawlerType: type,
					mode: 'force'
				});
				ok++;
			} catch (e) {
				console.error(`재크롤 실패 (${g.slug}/${type}):`, e);
			}
		}
		running = null;
		toastStore.success(`${g.gameName} 재크롤 요청: ${ok}/${types.length}`);
	}
</script>

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h3 class="text-lg font-bold text-gray-800">데이터 공백 (재크롤 필요)</h3>
			<p class="text-xs text-gray-400">
				크롤 시점에 채우지 못한 캐릭터. 소스가 채워지면 재크롤로 자동 해제됩니다.
			</p>
		</div>
		<button onclick={load} class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
			새로고침
		</button>
	</div>

	{#if loading}
		<div class="flex h-32 items-center justify-center text-gray-400">불러오는 중…</div>
	{:else if games.length === 0}
		<div class="flex h-32 items-center justify-center text-green-600">
			🎉 데이터 공백 없음 — 모든 캐릭터가 완성됐습니다.
		</div>
	{:else}
		<div class="space-y-3">
			{#each games as g (g.slug)}
				<div class="rounded-lg border border-gray-200">
					<div class="flex items-center justify-between gap-3 p-3">
						<button class="flex flex-1 items-center gap-3 text-left" onclick={() => toggle(g.slug)}>
							<i class="ri-arrow-{expanded[g.slug] ? 'down' : 'right'}-s-line text-gray-400"></i>
							<span class="font-semibold text-gray-800">{g.gameName}</span>
							<span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">
								{g.gapCount}건 공백
							</span>
							<span class="text-xs text-gray-400">완성도 {g.completeness}% ({g.total - g.gapCount}/{g.total})</span>
						</button>
						<button
							onclick={() => recrawl(g)}
							disabled={running === g.slug}
							class="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
						>
							<i class="ri-refresh-line mr-1"></i>
							{running === g.slug ? '요청 중…' : '강제 재크롤'}
						</button>
					</div>

					{#if expanded[g.slug]}
						<div class="max-h-72 overflow-auto border-t border-gray-100 p-3">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-left text-xs text-gray-400">
										<th class="pb-2">캐릭터</th>
										<th class="pb-2">originalId</th>
										<th class="pb-2">누락</th>
									</tr>
								</thead>
								<tbody>
									{#each g.items as it}
										<tr class="border-t border-gray-50">
											<td class="py-1.5 font-medium text-gray-800">{it.name}</td>
											<td class="py-1.5 text-xs text-gray-400">{it.originalId ?? '-'}</td>
											<td class="py-1.5">
												<div class="flex flex-wrap gap-1">
													{#each it.missing as m}
														<span class="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
															{GAP_LABEL[m] ?? m}
														</span>
													{/each}
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
