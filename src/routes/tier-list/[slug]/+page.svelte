<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import Sortable from 'sortablejs';
	import LZString from 'lz-string';
	import { characterList } from '../../../app/service/character/CharacterListService';
	import DesktopListMenu from '../../../app/view/menu/DesktopListMenu.svelte';
	import FooterView from '../../../app/view/footer/FooterView.svelte';
	import { GameSettingInitService } from '../../../app/service/game/GameSettingService';
	import { CharacterRarityService } from '../../../app/service/character/CharacterRarityService';
	import { getCardBgStyle } from '../../../app/util/StyleUtils';

	// Props
	let { data } = $props<{ data: any }>();

	// Slug from URL
	let slug = $derived($page.params.slug);

	// Tiers State
	let tiers = $state([
		{ id: 'S', label: 'S', color: 'bg-red-500', items: [] as any[] },
		{ id: 'A', label: 'A', color: 'bg-orange-500', items: [] as any[] },
		{ id: 'B', label: 'B', color: 'bg-yellow-500', items: [] as any[] },
		{ id: 'C', label: 'C', color: 'bg-green-500', items: [] as any[] },
		{ id: 'D', label: 'D', color: 'bg-blue-500', items: [] as any[] }
	]);

	// Pool State
	// "filteredPool" is what we display in the bottom area.
	// It is derived from the global filtered list ($characterList) MINUS any characters already in tiers.
	let pool = $state([] as any[]);
	let allChars = $state([] as any[]); // Reference to the full unfiltered list if needed, usually $characterList is the filtered source
	let searchQuery = $state(''); // Search query for filtering characters
	let fullCharacterList = $state([] as any[]); // Store full unfiltered character list for restoration

	// Toast notification state
	let showToast = $state(false);
	let toastMessage = $state('');

	// Rarity Service for background colors
	let gameInit: any;
	let rarityService = $state<CharacterRarityService>();

	const _unsubShowList = GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});
	onDestroy(_unsubShowList);

	// Get rarity color
	const getRarityColor = (rarity: any) => {
		if (!gameInit?.list?.card?.rarityColors || !rarityService) {
			return null;
		}

		const rarityData = rarityService.rarityData(rarity);

		if (rarityData === undefined || rarityData === null || rarityData === 0) {
			return null;
		}

		const colorKey = rarityData.toString();
		const colors = gameInit.list.card.rarityColors[colorKey];
		return colors || null;
	};

	// Get card background style (gradient)
	const getCharBgStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';
		return getCardBgStyle(colors.background);
	};

	// Subscribe to characterList store (which is updated by sidebar filters)
	const unsub = characterList.subscribe((list) => {
		// When the sidebar filter changes, 'list' updates (e.g., only "Defense" chars).
		// We need to update 'pool' to show these chars, BUT exclude ones already placed in tiers.
		// Also store the full list for restoration purposes
		if (list.length > 0) {
			fullCharacterList = list;
		}
		updatePool(list);
	});

	function updatePool(sourceList: any[]) {
		// 1. Get all IDs currently in tiers
		const placedIds = new Set();
		tiers.forEach((t) => t.items.forEach((i) => placedIds.add(i.id)));

		// 2. Filter sourceList to exclude placed IDs
		let filtered = sourceList.filter((char) => !placedIds.has(char.id));

		// 3. Apply search filter if query exists
		if (searchQuery.trim()) {
			filtered = filtered.filter((char) =>
				char.name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		pool = filtered;
	}

	onDestroy(() => {
		unsub();
	});

	onDestroy(() => {
		unsub();
	});

	// Watch search query and update pool accordingly
	$effect(() => {
		// Trigger pool update when searchQuery changes
		if (searchQuery !== undefined) {
			// Re-run updatePool with current character list
			characterList.subscribe((list) => {
				updatePool(list);
			})();
		}
	});

	// Sortable Refs
	let tierRefs: HTMLElement[] = $state([]);
	let poolRef: HTMLElement;

	// Store Sortable instances
	let sortableInstances: Sortable[] = [];
	let poolSortable: Sortable | null = null;
	let sortableInitialized = false;

	// Restore tier list from URL on mount AND initialize Sortable
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const compressed = urlParams.get('d');

		if (compressed) {
			const state = deserializeTierList(compressed);
			if (state && state.tiers) {
				// Get all characters to restore from IDs
				// Wait for character list to be available, then restore
				const unsubRestore = characterList.subscribe((allCharacters) => {
					if (allCharacters.length === 0) return; // Wait until characters are loaded

					// Restore tiers with character data
					state.tiers.forEach((savedTier: any, index: number) => {
						if (index < tiers.length) {
							tiers[index].label = savedTier.label;
							tiers[index].color = savedTier.color;
							tiers[index].items = savedTier.items
								.map((id: number) => allCharacters.find((c) => c.id === id))
								.filter((c: any) => c !== undefined);
						}
					});

					// Update pool to exclude placed characters
					updatePool(allCharacters);

					// Unsubscribe after restoration is complete
					unsubRestore();
				});
			}
		}

		// Initialize Sortable instances ONCE when component mounts
		// Use a small delay to ensure DOM elements are ready
		setTimeout(() => {
			if (sortableInitialized) return;
			sortableInitialized = true;

			// Initialize Sortable for Tiers
			tierRefs.forEach((el) => {
				if (!el) return;
				const instance = new Sortable(el, {
					group: 'shared',
					animation: 150,
					onEnd: (evt) => {
						syncTiersFromEvent(evt);
					}
				});
				sortableInstances.push(instance);
			});

			// Initialize Sortable for Pool
			if (poolRef) {
				poolSortable = new Sortable(poolRef, {
					group: 'shared',
					animation: 150,
					sort: false,
					onEnd: (evt) => {
						syncTiersFromEvent(evt);
					}
				});
			}
		}, 100);

		// Cleanup function when component unmounts
		return () => {
			sortableInstances.forEach((instance) => instance?.destroy());
			poolSortable?.destroy();
		};
	});

	// Sync Svelte state from Sortable drag event
	// This function is called by the onEnd callback and receives the event data
	function syncTiersFromEvent(evt: any) {
		// CRITICAL: Remove the DOM element that Sortable moved
		// This prevents duplication when Svelte re-renders
		evt.item.remove();

		// Get the character ID from the dragged element
		const charId = parseInt(evt.item.getAttribute('data-id'));
		const character = fullCharacterList.find((c) => c.id === charId);

		if (!character) return;

		// Determine which tier the element was dragged FROM and TO
		const fromContainer = evt.from;
		const toContainer = evt.to;

		// Find the tier indices by matching the DOM elements
		const fromTierIndex = tierRefs.findIndex((ref) => ref === fromContainer);
		const toTierIndex = tierRefs.findIndex((ref) => ref === toContainer);

		const isFromPool = fromContainer === poolRef;
		const isToPool = toContainer === poolRef;

		// Remove character from source
		if (isFromPool) {
			// Remove from pool - updatePool will handle this automatically
		} else if (fromTierIndex !== -1) {
			// Remove from tier
			tiers[fromTierIndex] = {
				...tiers[fromTierIndex],
				items: tiers[fromTierIndex].items.filter((c) => c.id !== charId)
			};
		}

		// Add character to destination
		if (isToPool) {
			// Moving back to pool - just refresh the pool
			const unsubRefresh = characterList.subscribe((list) => {
				updatePool(list);
			});
			unsubRefresh();
		} else if (toTierIndex !== -1) {
			// Add to tier at the correct position
			const newItems = [...tiers[toTierIndex].items];
			newItems.splice(evt.newIndex, 0, character);

			tiers[toTierIndex] = {
				...tiers[toTierIndex],
				items: newItems
			};
		}

		// Refresh the pool to remove characters that are now in tiers
		const unsubRefresh = characterList.subscribe((list) => {
			updatePool(list);
		});
		unsubRefresh();
	}

	// Utility to get image URL
	function getImgUrl(char: any) {
		return `${data.url}/${char.imageUrl}`;
	}

	// 카드 배경 스타일 생성 (반응형)
	const getCardStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) return '';

		if (colors.gradient) {
			return `background: linear-gradient(180deg, ${colors.gradient.from}, ${colors.background} ${colors.gradient.stop}); border-bottom-color: ${colors.background};`;
		} else {
			return `background: ${colors.background}; border-bottom-color: ${colors.background};`;
		}
	};

	// Serialize tier list state to compressed URL parameter
	function serializeTierList() {
		const state = {
			version: 1,
			tiers: tiers.map((tier) => ({
				id: tier.id,
				label: tier.label,
				color: tier.color,
				items: tier.items.map((item) => item.id) // Only store character IDs
			}))
		};
		const json = JSON.stringify(state);
		const compressed = LZString.compressToEncodedURIComponent(json);
		return compressed;
	}

	// Deserialize tier list from URL parameter
	function deserializeTierList(compressed: string) {
		try {
			const json = LZString.decompressFromEncodedURIComponent(compressed);
			if (!json) return null;
			const state = JSON.parse(json);
			return state;
		} catch (e) {
			console.error('Failed to deserialize tier list:', e);
			return null;
		}
	}

	// Generate shareable URL
	function generateShareUrl() {
		const compressed = serializeTierList();
		const url = `${window.location.origin}${window.location.pathname}?d=${compressed}`;
		return url;
	}

	// Copy URL to clipboard and show toast
	async function handleShare() {
		try {
			const url = generateShareUrl();

			// Try modern clipboard API first
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(url);
			} else {
				// Fallback for non-HTTPS environments
				const textArea = document.createElement('textarea');
				textArea.value = url;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				textArea.style.top = '-999999px';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();

				const successful = document.execCommand('copy');
				document.body.removeChild(textArea);

				if (!successful) {
					throw new Error('execCommand failed');
				}
			}

			toastMessage = '링크가 복사되었습니다!';
			showToast = true;
			setTimeout(() => {
				showToast = false;
			}, 3000);
		} catch (e) {
			console.error('Failed to copy to clipboard:', e);
			toastMessage = '링크 복사에 실패했습니다.';
			showToast = true;
			setTimeout(() => {
				showToast = false;
			}, 3000);
		}
	}

	// Show toast notification
	function showToastMessage(message: string) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}
</script>

<div class="h-screen w-screen min-w-[1700px] overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="list-component"
		class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden"
	>
		<!-- Sidebar Menu -->
		<DesktopListMenu {data} />

		<!-- Main Content Area -->
		<div class="list h-auto w-[calc(100%-100px)] w-[inherit] overflow-y-auto pr-2 pt-16">
			<div class="mx-auto w-full p-4 min-h-screen">
				<div class="flex justify-between items-center mb-6">
					<h1 class="text-3xl font-bold uppercase text-gray-800 dark:text-white">
						{data.info?.name} Tier List
					</h1>
					<div class="space-x-2">
						<button
							class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
							onclick={handleShare}
						>
							<i class="ri-share-line mr-1"></i>
							공유
						</button>
						<button
							class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
							onclick={() => {
								// Reset: Move everything back to pool (conceptually)
								// In practice: Clear tiers, update pool from master list

								// Force pool update from current store value
								// We can't access $characterList directly easily inside simple function without store get
								// But `unsub` logic handles store updates.
								// We can trigger re-sync if we tracked the last list.
								// Simplest: reload page or just clear tiers visually?
								// Let's just clear tiers. The reactive pool update will happen if we trigger it.
								// Actually, simpler:
								location.reload();
							}}>Reset</button
						>
					</div>
				</div>

				<!-- Tier List Area -->
				<div
					class="flex flex-col gap-2 mb-8 bg-w p-4 rounded-lg shadow-lg bg-white dark:bg-gray-700"
				>
					{#each tiers as tier, index}
						<div
							class="flex min-h-[120px] bg-gray-200 rounded overflow-hidden border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
						>
							<!-- Label -->
							<div
								class="{tier.color} w-28 flex items-center justify-center text-2xl font-bold text-white shrink-0"
							>
								<span contenteditable="true" class="outline-none text-center w-full"
									>{tier.label}</span
								>
							</div>
							<!-- Drop Area -->
							<div
								class="flex-1 p-2 flex flex-wrap gap-2 min-h-full items-center content-start"
								bind:this={tierRefs[index]}
							>
								<!-- Render tier items -->
								{#each tier.items as char (char.id)}
									{@const charBgStyle = getCharBgStyle(char.rarity)}
									<div
										class="w-28 h-28 bg-gray-300 rounded-lg overflow-hidden cursor-move relative shrink-0 group hover:ring-2 ring-gray-100 dark:ring-gray-700"
										style={getCardStyle(char.rarity) || 'background: rgba(0, 0, 0, 0.7);'}
										data-id={char.id}
									>
										<img
											src={getImgUrl(char)}
											alt={char.name}
											class="w-full h-full object-cover pointer-events-none"
										/>
										<div
											class="absolute bottom-0 left-0 right-0 text-white text-[14px] text-center truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity"
											style={charBgStyle || 'background: rgba(0, 0, 0, 0.7);'}
										>
											{char.name}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<!-- Character Pool -->
				<div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md mb-20">
					<h2
						class="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2"
					>
						캐릭터 리스트
					</h2>

					<div class="flex flex-wrap gap-2" bind:this={poolRef}>
						{#each pool as char (char.id)}
							{@const charBgStyle = getCharBgStyle(char.rarity)}
							<div
								class="w-28 h-28 bg-gray-300 rounded-lg overflow-hidden cursor-move relative shrink-0 group hover:ring-2 ring-gray-100"
								style={getCardStyle(char.rarity) || 'background: rgba(0, 0, 0, 0.7);'}
								data-id={char.id}
							>
								<img
									src={getImgUrl(char)}
									alt={char.name}
									class="w-full h-full object-cover pointer-events-none"
								/>
								<div
									class="absolute bottom-0 left-0 right-0 text-white text-[14px] text-center truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity"
									style={charBgStyle || 'background: rgba(0, 0, 0, 0.7);'}
								>
									{char.name}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<FooterView />
		</div>
	</article>

	<!-- Toast Notification -->
	{#if showToast}
		<div
			class="fixed bottom-8 right-8 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up z-50"
		>
			<i class="ri-check-line text-green-400 dark:text-green-600 text-xl"></i>
			<span class="font-medium">{toastMessage}</span>
		</div>
	{/if}
</div>

<style lang="scss">
	#list-menu-content {
		-ms-overflow-style: none;
		scrollbar-width: none;
		overflow-y: scroll;
	}
	#list-menu-content::-webkit-scrollbar {
		display: none;
	}

	@keyframes slide-up {
		from {
			transform: translateY(100px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	:global(.animate-slide-up) {
		animation: slide-up 0.3s ease-out;
	}
</style>
