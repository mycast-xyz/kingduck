<script lang="ts">
	import { page } from '$app/stores';

	let gameId = $derived($page.params.gameId);

	// Mock data (shared concept, simplified for demo)
	const games: Record<string, string> = {
		'star-rail': 'Honkai: Star Rail',
		'wuthering-waves': 'Wuthering Waves',
		endfield: 'Arknights: Endfield',
		genshin: 'Genshin Impact'
	};

	let gameName = $derived(games[gameId] || gameId);
</script>

<div
	class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 font-sans"
>
	<div class="max-w-4xl mx-auto">
		<a
			href="/calendar"
			class="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 mb-6 transition-colors"
		>
			<i class="ri-arrow-left-line"></i> Back to Global Calendar
		</a>

		<header class="mb-8 border-b dark:border-gray-700 pb-6">
			<h1
				class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2"
			>
				{gameName}
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-400">Detailed schedule & resource planning</p>
		</header>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- Current Active Banners -->
			<section class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-green-500">
				<h2 class="text-xl font-bold mb-4 flex items-center gap-2">
					<i class="ri-fire-line text-orange-500"></i> Active Now
				</h2>
				<div class="space-y-4">
					<!-- Mock Item -->
					<div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex gap-4">
						<div class="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
						<div>
							<h3 class="font-bold text-lg">Character Name</h3>
							<p class="text-sm text-gray-500">
								Ends in <span class="text-red-500 font-bold">2 days</span>
							</p>
							<div class="w-full bg-gray-200 mt-2 h-1.5 rounded-full overflow-hidden">
								<div class="bg-green-500 h-full w-[80%]"></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Upcoming -->
			<section class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-l-4 border-blue-500">
				<h2 class="text-xl font-bold mb-4 flex items-center gap-2">
					<i class="ri-calendar-check-line text-blue-500"></i> Upcoming
				</h2>
				<div class="space-y-4">
					<div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex gap-4 opacity-70">
						<div class="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0"></div>
						<div>
							<h3 class="font-bold text-lg">Next Character</h3>
							<p class="text-sm text-gray-500">Starts in 5 days</p>
						</div>
					</div>
				</div>
			</section>
		</div>

		<!-- Resource Kick -->
		<section
			class="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
		>
			<h2 class="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-2">
				<i class="ri-money-dollar-circle-line"></i> Resource Outlook
			</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				Based on current daily income, you can save <strong>14,000 Jades</strong> before the next major
				patch.
			</p>
			<div class="flex gap-4">
				<input
					type="number"
					placeholder="Current Jades"
					class="px-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-600"
				/>
				<button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
					>Recalculate</button
				>
			</div>
		</section>
	</div>
</div>
