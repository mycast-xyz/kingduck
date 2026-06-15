<script lang="ts">
	import { fade } from 'svelte/transition';
	import DesktopListMenu from '../../../../app/view/menu/DesktopListMenu.svelte';
	import FooterView from '../../../../app/view/footer/FooterView.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Load Data
	let event = $derived(data.event);
	let game = $derived(data.game);

	const now = new Date();

	// Helper: Calculate Remaining Time / D-Day
	function getStatus(start: Date, end: Date) {
		if (now < start) {
			const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
			return { type: 'upcoming', text: `D-${diff}`, label: '예정' };
		} else if (now > end) {
			return { type: 'ended', text: '종료됨', label: '종료' };
		} else {
			const diff = end.getTime() - now.getTime();
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			if (days > 0) return { type: 'active', text: `${days}일 ${hours}시간 남음`, label: '진행중' };
			return { type: 'urgent', text: `${hours}시간 남음`, label: '곧 종료' };
		}
	}

	let status = $derived(getStatus(event.startDate, event.endDate));

	// Helper: Date Formatter
	function formatDate(date: Date) {
		return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	// Gacha Progress (Active only)
	let progress = $derived.by(() => {
		if (status.type === 'upcoming') return 0;
		if (status.type === 'ended') return 100;
		const total = event.endDate.getTime() - event.startDate.getTime();
		const elapsed = now.getTime() - event.startDate.getTime();
		return Math.min(100, Math.max(0, (elapsed / total) * 100));
	});

	// Content Text Logic
	let contentText = $derived(
		event.type === 'EVENT' && event.metadata?.full_content
			? event.metadata.full_content
			: event.metadata?.content
	);
	// Text Formatting Helper
	function parseInline(text: string) {
		return text
			.replace(
				/「(.*?)」/g,
				'<span class="font-bold text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-sm mx-1">$1</span>'
			)
			.replace(
				/\[(.*?)\]/g,
				'<span class="font-semibold text-indigo-600 dark:text-indigo-400">$1</span>'
			);
	}

	function formatContent(text: string) {
		if (!text) return '';
		return text
			.split('\n')
			.map((line) => {
				const trimmed = line.trim();
				if (!trimmed) return '';

				// Header ✦Title✦
				const headerMatch = trimmed.match(/✦(.+)✦/);
				if (headerMatch) {
					return `<h3 class="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-3 flex items-center gap-2 border-b border-indigo-100 dark:border-indigo-800/30 pb-2">
						<i class="ri-sparkling-fill text-indigo-400"></i> ${headerMatch[1].trim()}
					</h3>`;
				}

				// List Item - Item
				if (trimmed.startsWith('-')) {
					return `<div class="flex items-start gap-3 mb-2 text-gray-600 dark:text-gray-300 pl-2 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded transition-colors">
						<span class="mt-2 w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"></span>
						<span class="leading-relaxed flex-1">${parseInline(trimmed.substring(1).trim())}</span>
					</div>`;
				}

				// Regular Paragraph
				return `<p class="mb-2 text-gray-600 dark:text-gray-300 leading-relaxed">${parseInline(trimmed)}</p>`;
			})
			.join('');
	}

	// List Card View Logic
	import { GameSettingInitService } from '../../../../app/service/game/GameSettingService';
	import { CharacterRarityService } from '../../../../app/service/character/CharacterRarityService';
	import { getCardBgStyle as getGradientStyle } from '../../../../app/util/StyleUtils';
	import { sanitizeHtml } from '../../../../app/util/sanitize';

	let gameInit: any;
	let rarityService = $state<CharacterRarityService>();

	GameSettingInitService.showList.subscribe((value) => {
		gameInit = value;
		if (gameInit) {
			rarityService = new CharacterRarityService(gameInit);
		}
	});

	// 등급별 색상 가져오기 (반응형)
	const getRarityColor = (rarity: any) => {
		if (!gameInit?.list?.card?.rarityColors || !rarityService) {
			// Fallback colors if service not ready
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

	// 카드 배경 스타일 생성 (반응형)
	const getCardStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) {
			// Default styling based on rarity number if config not loaded
			if (rarity == 5)
				return 'background: linear-gradient(180deg, #885550, #c9a36a 53%); border-bottom-color: #c9a36a;';
			if (rarity == 4)
				return 'background: linear-gradient(180deg, #343659, #8a5fcc 53%); border-bottom-color: #8a5fcc;';
			if (rarity == 3)
				return 'background: linear-gradient(180deg, #303051, #4175bb 53%); border-bottom-color: #4175bb;';
			return '';
		}

		if (colors.gradient) {
			return `background: linear-gradient(180deg, ${colors.gradient.from}, ${colors.background} ${colors.gradient.stop}); border-bottom-color: ${colors.background};`;
		} else {
			return `background: ${colors.background}; border-bottom-color: ${colors.background};`;
		}
	};

	// 카드 배경 그라데이션 스타일 생성 (반응형)
	const getCardBgStyle = (rarity: any) => {
		const colors = getRarityColor(rarity);
		if (!colors) {
			if (rarity == 5)
				return 'background: linear-gradient(0deg, rgba(201, 163, 106, 1) 0%, rgba(201, 163, 106, 0) 100%);';
			if (rarity == 4)
				return 'background: linear-gradient(0deg, rgba(138, 95, 204, 1) 0%, rgba(138, 95, 204, 0) 100%);';
			if (rarity == 3)
				return 'background: linear-gradient(0deg, rgba(65, 117, 187, 1) 0%, rgba(65, 117, 187, 0) 100%);';
			return '';
		}
		return getGradientStyle(colors.background);
	};

	// Helper to sort rarity entries descending (5 -> 4 -> 3)
	const getSortedRarityEntries = (metadataSection: any) => {
		if (!metadataSection) return [];
		return Object.entries(metadataSection).sort(([keyA], [keyB]) => {
			const numA = parseInt(keyA.replace('rarity', '')) || 0;
			const numB = parseInt(keyB.replace('rarity', '')) || 0;
			return numB - numA;
		});
	};
</script>

<div class="h-screen w-screen overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="weather-page"
		class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden"
	>
		<!-- Sidebar Menu -->
		<DesktopListMenu {data} />

		<div class="min-h-screen text-gray-800 dark:text-gray-100 font-sans pb-20 w-full">
			<!-- Header / Banner -->
			<div class="relative h-auto w-full overflow-hidden my-8">
				<!-- Content -->
				<div class="w-full p-6 md:p-10 max-w-5xl flex items-end justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-4">
							<span
								class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
						{status.type === 'active' ? 'bg-green-500 text-white' : ''}
						{status.type === 'urgent' ? 'bg-red-500 text-white animate-pulse' : ''}
						{status.type === 'upcoming' ? 'bg-blue-500 text-white' : ''}
						{status.type === 'ended' ? 'bg-gray-500 text-white' : ''}
					"
							>
								{status.label}
							</span>
							<span
								class="text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-1"
							>
								<div class="w-2 h-2 rounded-full {game.color}"></div>
								{game.name}
							</span>
						</div>
						<h1
							class="text-3xl md:text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2 leading-tight drop-shadow-md"
						>
							{event.name}
						</h1>
						<p
							class="text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-2xl drop-shadow-sm"
						>
							{formatDate(event.startDate)} - {formatDate(event.endDate)}
						</p>
					</div>

					<!-- Game Icon (Optional) -->
					<!-- <div class="hidden md:block w-20 h-20 rounded-2xl {game.color} shadow-lg opacity-90"></div> -->
				</div>
			</div>

			<!-- Main Content Grid -->
			<div
				class="max-w-full mx-auto px-6 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6"
			>
				<!-- Left Column: Main Info -->
				<div class="md:col-span-2 space-y-6">
					<!-- Timeline Card -->
					<div
						class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
					>
						<h2 class="text-lg font-bold mb-4 flex items-center gap-2">
							<i class="ri-time-line text-blue-500"></i> 일정 상세
						</h2>

						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-gray-500 dark:text-gray-400">진행률</span>
							<span
								class="text-sm font-bold {status.type === 'urgent'
									? 'text-red-500'
									: 'text-blue-500'}"
							>
								{status.text}
							</span>
						</div>

						<!-- Progress Bar -->
						<div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-6">
							<div
								class="h-full transition-all duration-1000 {status.type === 'urgent'
									? 'bg-red-500'
									: 'bg-blue-500'}"
								style="width: {progress}%"
							></div>
						</div>

						<div class="grid grid-cols-2 gap-4 text-sm">
							<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
								<span class="block text-gray-500 dark:text-gray-400 mb-1">시작일</span>
								<span class="font-semibold">{formatDate(event.startDate)}</span>
							</div>
							<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-right">
								<span class="block text-gray-500 dark:text-gray-400 mb-1">종료일</span>
								<span class="font-semibold">{formatDate(event.endDate)}</span>
							</div>
						</div>
					</div>
					<div class="">
						<!-- Weapons List -->
						{#if event.metadata?.weapons}
							<div class="mb-6">
								<h3
									class="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1 text-sm"
								>
									<i class="ri-sword-line"></i> 무기 픽업
								</h3>
								<div class="flex flex-wrap gap-3">
									{#each getSortedRarityEntries(event.metadata.weapons) as [rarityKey, items]}
										{@const fallbackRarity = parseInt(rarityKey.replace('rarity', '')) || 0}
										{#if items && Array.isArray(items)}
											{#each items as item}
												{@const name = typeof item === 'string' ? item : item.name}
												{@const rarity =
													typeof item === 'object' && item.rarity ? item.rarity : fallbackRarity}
												{@const imageUrl =
													typeof item === 'object' && item.imageUrl ? item.imageUrl : null}

												{@const cardStyle = getCardStyle(rarity)}
												{@const cardBgStyle = getCardBgStyle(rarity)}

												<div
													class="relative w-40 h-60 rounded-lg overflow-hidden shadow-lg border border-gray-100 dark:border-gray-600 transition-transform hover:scale-105 bg-gray-600"
													style={cardStyle || 'background-color: #555;'}
												>
													<!-- Main Content Area -->
													<div class="h-full flex flex-col items-center p-0">
														{#if imageUrl}
															<div class="w-full h-60 overflow-hidden bg-gray-800/20">
																<img
																	src="{data.url}/{imageUrl}"
																	alt={name}
																	class="w-full h-full object-cover transform scale-105"
																/>
															</div>
														{:else}
															<div
																class="h-32 flex items-center justify-center p-2 text-center w-full"
															>
																<span
																	class="text-lg font-bold text-white text-center break-keep leading-tight drop-shadow-md opacity-90"
																	>{name}</span
																>
																<i class="ri-sword-fill text-4xl text-white/10 absolute z-0"></i>
															</div>
														{/if}
													</div>

													<!-- Bottom Info -->
													<div
														class="absolute inset-x-0 bottom-0 px-2 py-2 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent"
														style={cardBgStyle}
													>
														{#if imageUrl}
															<span
																class="text-[10px] font-bold text-white text-center truncate w-full px-1 drop-shadow-md mb-0.5"
																>{name}</span
															>
														{/if}
														<div class="flex justify-center gap-0.5">
															{#each { length: rarity } as _}
																<i class="ri-star-fill text-yellow-300 text-[10px] drop-shadow-sm"
																></i>
															{/each}
														</div>
													</div>
												</div>
											{/each}
										{/if}
									{/each}
								</div>
							</div>
						{/if}

						<!-- Characters List -->
						{#if event.metadata?.characters}
							<div class="mb-6">
								<h3
									class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1"
								>
									<i class="ri-user-star-line"></i> 캐릭터 픽업
								</h3>
								<div class="flex flex-wrap gap-3">
									{#if data.params === 'endfield'}
										<!-- Endfield Special Layout -->
										{#if Array.isArray(event.metadata.featuredCharacters)}
											{#each event.metadata.featuredCharacters as item}
												{@const name = typeof item === 'string' ? item : item.name}
												{@const id = typeof item === 'object' && item.id ? item.id : null}
												{@const cardStyle = getCardStyle(6)}
												{@const cardBgStyle = getCardBgStyle(6)}
												<svelte:element
													this={id ? 'a' : 'div'}
													href={id ? `/content/${data.params}/${id}` : undefined}
													class="relative block h-80 w-60 overflow-hidden rounded-lg bg-gray-600 shadow-lg border border-gray-100 dark:border-gray-600 transition-transform hover:scale-105"
													style={cardStyle || 'background-color: #555;'}
												>
													<div
														class="absolute top-2 left-2 z-20 rounded-sm bg-yellow-400 px-2 py-0.5 text-[10px] font-black text-black shadow-sm"
													>
														MAIN
													</div>
													<div class="h-full flex flex-col items-center p-0">
														{#if typeof item === 'object' && item.imageUrl}
															<div class="w-full h-80 overflow-hidden bg-gray-800/20">
																<img
																	src="{data.url}/{item.imageUrl}"
																	alt={name}
																	class="w-full h-full translate-y-2 scale-110 transform object-cover"
																/>
															</div>
														{:else}
															<div
																class="h-28 flex items-center justify-center p-2 text-center w-full"
															>
																<span
																	class="relative z-10 break-keep text-sm font-extrabold leading-tight text-white drop-shadow-md"
																	>{name}</span
																>
																<i class="ri-user-fill absolute z-0 text-5xl text-white/10"></i>
															</div>
														{/if}
													</div>
													<div
														class="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent px-2 py-2"
														style={cardBgStyle}
													>
														{#if typeof item === 'object' && item.imageUrl}<span
																class="mb-0.5 w-full truncate px-1 text-center text-[14px] font-bold text-white drop-shadow-md"
																>{name}</span
															>{/if}
														<div class="flex justify-center gap-0.5">
															{#each { length: 6 } as _}<i
																	class="ri-star-fill text-[10px] text-yellow-300 drop-shadow-sm"
																></i>{/each}
														</div>
													</div>
												</svelte:element>
											{/each}
										{/if}
										{#if Array.isArray(event.metadata.characters)}
											{#each event.metadata.characters as item}
												{@const itemName = typeof item === 'string' ? item : item.name}
												{#if !(event.metadata.featuredCharacters || []).some((fc: any) => (typeof fc === 'string' ? fc : fc.name) === itemName)}
													{@const id = typeof item === 'object' && item.id ? item.id : null}
													{@const cardStyle = getCardStyle(6)}
													{@const cardBgStyle = getCardBgStyle(6)}
													<svelte:element
														this={id ? 'a' : 'div'}
														href={id ? `/content/${data.params}/${id}` : undefined}
														class="relative block h-80 w-60 overflow-hidden rounded-lg bg-gray-600 shadow-lg border border-gray-100 dark:border-gray-600 transition-transform hover:scale-105"
														style={cardStyle || 'background-color: #555;'}
													>
														<div class="h-full flex flex-col items-center p-0">
															{#if typeof item === 'object' && item.imageUrl}
																<div class="w-full h-80 overflow-hidden bg-gray-800/20">
																	<img
																		src="{data.url}/{item.imageUrl}"
																		alt={itemName}
																		class="w-full h-full translate-y-2 scale-110 transform object-cover"
																	/>
																</div>
															{:else}
																<div
																	class="h-28 flex items-center justify-center p-2 text-center w-full"
																>
																	<span
																		class="relative z-10 break-keep text-sm font-extrabold leading-tight text-white drop-shadow-md"
																		>{itemName}</span
																	>
																	<i class="ri-user-fill absolute z-0 text-5xl text-white/10"></i>
																</div>
															{/if}
														</div>
														<div
															class="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent px-2 py-2"
															style={cardBgStyle}
														>
															{#if typeof item === 'object' && item.imageUrl}<span
																	class="mb-0.5 w-full truncate px-1 text-center text-[14px] font-bold text-white drop-shadow-md"
																	>{itemName}</span
																>{/if}
															<div class="flex justify-center gap-0.5">
																{#each { length: 6 } as _}<i
																		class="ri-star-fill text-[10px] text-yellow-300 drop-shadow-sm"
																	></i>{/each}
															</div>
														</div>
													</svelte:element>
												{/if}
											{/each}
										{/if}
									{:else}
										<!-- Standard Layout -->
										{#each getSortedRarityEntries(event.metadata.characters) as [rarityKey, items]}
											{@const r = parseInt(rarityKey.replace('rarity', '')) || 0}
											{#if Array.isArray(items)}
												{#each items as item}
													{@const name = typeof item === 'string' ? item : item.name}
													{@const id = typeof item === 'object' && item.id ? item.id : null}
													{@const rarity =
														typeof item === 'object' && item.rarity ? item.rarity : r}
													{@const cardStyle = getCardStyle(rarity)}
													{@const cardBgStyle = getCardBgStyle(rarity)}
													<svelte:element
														this={id ? 'a' : 'div'}
														href={id ? `/content/${data.params}/${id}` : undefined}
														class="relative block h-80 w-60 overflow-hidden rounded-lg bg-gray-600 shadow-lg border border-gray-100 dark:border-gray-600 transition-transform hover:scale-105"
														style={cardStyle || 'background-color: #555;'}
													>
														<div class="h-full flex flex-col items-center p-0">
															{#if typeof item === 'object' && item.imageUrl}
																<div class="w-full h-80 overflow-hidden bg-gray-800/20">
																	<img
																		src="{data.url}/{item.imageUrl}"
																		alt={name}
																		class="w-full h-full translate-y-2 scale-110 transform object-cover"
																	/>
																</div>
															{:else}
																<div
																	class="h-28 flex items-center justify-center p-2 text-center w-full"
																>
																	<span
																		class="relative z-10 break-keep text-sm font-extrabold leading-tight text-white drop-shadow-md"
																		>{name}</span
																	>
																	<i class="ri-user-fill absolute z-0 text-5xl text-white/10"></i>
																</div>
															{/if}
														</div>
														<div
															class="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent px-2 py-2"
															style={cardBgStyle}
														>
															{#if typeof item === 'object' && item.imageUrl}<span
																	class="mb-0.5 w-full truncate px-1 text-center text-[14px] font-bold text-white drop-shadow-md"
																	>{name}</span
																>{/if}
															<div class="flex justify-center gap-0.5">
																{#each { length: rarity } as _}<i
																		class="ri-star-fill text-[10px] text-yellow-300 drop-shadow-sm"
																	></i>{/each}
															</div>
														</div>
													</svelte:element>
												{/each}
											{/if}
										{/each}
									{/if}
								</div>
							</div>
						{/if}

						<!-- Items List -->
						{#if event.metadata?.items}
							<div class="mb-6">
								<h3
									class="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1 text-xl"
								>
									<i class="ri-gift-line"></i> 아이템
								</h3>
								<div class="flex flex-wrap gap-3">
									{#each getSortedRarityEntries(event.metadata.items) as [rarityKey, items]}
										{@const fallbackRarity = parseInt(rarityKey.replace('rarity', '')) || 3}
										{#if items && Array.isArray(items)}
											{#each items as item}
												{@const name = typeof item === 'string' ? item : item.name}
												{@const rarity =
													typeof item === 'object' && item.rarity ? item.rarity : fallbackRarity}
												{@const imageUrl =
													typeof item === 'object' && item.imageUrl ? item.imageUrl : null}

												{@const cardStyle = getCardStyle(rarity)}
												{@const cardBgStyle = getCardBgStyle(rarity)}

												<div
													class="relative w-40 h-60 rounded-lg overflow-hidden shadow-md border border-gray-100 dark:border-gray-600 transition-transform hover:scale-105 bg-gray-600"
													style={cardStyle || 'background-color: #555;'}
												>
													<div class="h-full flex flex-col items-center p-0">
														{#if imageUrl}
															<div class="w-full h-60 overflow-hidden bg-gray-800/20 p-1">
																<img
																	src="{data.url}/{imageUrl}"
																	alt={name}
																	class="w-full h-full object-contain"
																/>
															</div>
														{:else}
															<div
																class="h-20 flex items-center justify-center p-1 text-center w-full"
															>
																<span
																	class="text-lg font-bold text-white text-center break-keep leading-tight drop-shadow-md relative z-10"
																	>{name}</span
																>
															</div>
														{/if}
													</div>

													<div
														class="absolute inset-x-0 bottom-0 px-2 py-1 flex flex-col items-center justify-center"
														style={cardBgStyle}
													>
														{#if imageUrl}
															<span
																class="text-[9px] font-bold text-white text-center truncate w-full px-1 drop-shadow-sm"
																>{name}</span
															>
														{/if}
													</div>
												</div>
											{/each}
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>

					{#if event.type === 'EVENT'}
						<!-- Description Card -->
						<div
							class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
						>
							<h2 class="text-lg font-bold mb-4 flex items-center gap-2">
								<i class="ri-file-text-line text-indigo-500"></i> 상세 정보
							</h2>

							{#if contentText}
								<div class="prose dark:prose-invert max-w-none text-sm mb-6">
									{@html sanitizeHtml(formatContent(contentText))}
								</div>
							{:else if event.characterName}
								<p class="text-gray-600 dark:text-gray-300 mb-6">{event.characterName}</p>
							{:else}
								<p class="italic text-gray-400 mb-6">상세 설명이 없습니다.</p>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Right Column: Actions & Resources -->
				<div class="space-y-6">
					<!-- Actions -->
					<div
						class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 sticky top-6"
					>
						<a
							href="/calendar/{data.params}"
							class="w-full mb-3 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
						>
							<i class="ri-arrow-left-line"></i> 캘린더로 복귀
						</a>

						{#if event.officialLink}
							<a
								href={event.officialLink}
								target="_blank"
								rel="noreferrer"
								class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg font-bold flex items-center justify-center gap-2 transform active:scale-95 text-center"
							>
								<i class="ri-external-link-line"></i> 공식 공지 확인
							</a>
						{:else}
							<button
								class="w-full py-3 px-4 rounded-xl bg-gray-400 cursor-not-allowed text-white transition-all shadow-none font-bold flex items-center justify-center gap-2 opacity-70"
								disabled
							>
								<i class="ri-file-warning-line"></i> 공지 미등록
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</article>
</div>

<style lang="scss">
	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.border-Rating-5 {
		border-color: #fcba49;
		background-color: #fcba49;
	}
	.border-Rating-4 {
		border-color: #9f66c8;
		background-color: #9f66c8;
	}
	.border-Rating-3 {
		border-color: #4175bb;
		background-color: #4175bb;
	}
	.card-Rating-5 {
		background: #c9a36a;
		background: linear-gradient(180deg, #885550, #c9a36a 53%);
		border-bottom-color: #c9a36a;
	}
	.card-Rating-5-bg {
		background: rgb(201, 163, 106);
		background: linear-gradient(0deg, rgba(201, 163, 106, 1) 0%, rgba(201, 163, 106, 0) 100%);
	}
	.card-Rating-4 {
		background: #8a5fcc;
		background: linear-gradient(180deg, #343659, #8a5fcc 53%);
		border-bottom-color: #8a5fcc;
	}
	.card-Rating-4-bg {
		background: rgb(138, 95, 204);
		background: linear-gradient(0deg, rgba(138, 95, 204, 1) 0%, rgba(138, 95, 204, 0) 100%);
	}
	.card-Rating-3 {
		background: #4175bb;
		background: linear-gradient(180deg, #303051, #4175bb 53%);
		border-bottom-color: #4175bb;
	}
	.card-Rating-3-bg {
		background: rgb(65, 117, 187);
		background: linear-gradient(0deg, rgba(65, 117, 187, 1) 0%, rgba(65, 117, 187, 0) 100%);
	}

	/* 호요버스 - 원신, 스타레일 색상 처리*/
	.text-Rating-5 {
		color: #fcba49;
	}
	.text-Rating-4 {
		color: #9f66c8;
	}
	.text-Rating-3 {
		color: #4175bb;
	}
</style>
