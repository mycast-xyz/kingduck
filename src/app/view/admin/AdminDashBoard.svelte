<script lang="ts">
	// 차트 데이터
	let salesData = {
		daily: [28450, 29800, 27900, 31200, 32800, 31900, 28450],
		labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
	};

	// 통계 데이터
	let stats = [
		{ label: 'Sessions', value: '28%', subValue: '3.1k Page Views' },
		{ label: 'Leads', value: '12%', subValue: 'Conversions' },
		{ label: 'Revenue', value: '$545.69', growth: '+12.5%' },
		{ label: 'Profit', value: '$256.34', growth: '+8.2%' }
	];

	// 프로젝트 목록
	let projects = [
		{
			name: 'Website SEO',
			leader: 'Eileen',
			team: ['user1.jpg', 'user2.jpg', 'user3.jpg'],
			progress: 38,
			dueDate: '15 May 2023'
		},
		{
			name: 'Social Banners',
			leader: 'Owen',
			team: ['user2.jpg', 'user4.jpg', 'user5.jpg'],
			progress: 45,
			dueDate: '20 Jan 2023'
		}
	];
</script>

<article>
	<!-- 상단 통계 카드 -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<div class="rounded-lg bg-white p-6 shadow-sm">
				<h3 class="text-sm font-medium text-gray-500">{stat.label}</h3>
				<div class="mt-2 flex items-baseline">
					<p class="text-2xl font-semibold text-gray-900">{stat.value}</p>
					{#if stat.growth}
						<span class="ml-2 text-sm text-green-600">{stat.growth}</span>
					{/if}
				</div>
				{#if stat.subValue}
					<p class="mt-1 text-sm text-gray-600">{stat.subValue}</p>
				{/if}
			</div>
		{/each}
	</div>

	<!-- 차트 섹션 -->
	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-medium">Daily Sales</h3>
			<div class="h-64">
				<!-- 차트 컴포넌트 추가 예정 -->
			</div>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-medium">Revenue Analytics</h3>
			<div class="h-64">
				<!-- 차트 컴포넌트 추가 예정 -->
			</div>
		</div>
	</div>

	<!-- 프로젝트 목록 -->
	<div class="rounded-lg bg-white p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-medium">Active Projects</h3>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b text-left">
						<th class="pb-3">Project</th>
						<th class="pb-3">Leader</th>
						<th class="pb-3">Team</th>
						<th class="pb-3">Progress</th>
						<th class="pb-3">Due Date</th>
					</tr>
				</thead>
				<tbody>
					{#each projects as project}
						<tr class="border-b">
							<td class="py-4">{project.name}</td>
							<td>{project.leader}</td>
							<td>
								<div class="flex -space-x-2">
									{#each project.team as member}
										<img
											src={member}
											alt="Team member"
											class="h-8 w-8 rounded-full border-2 border-white"
										/>
									{/each}
								</div>
							</td>
							<td>
								<div class="w-full rounded-full bg-gray-200">
									<div
										class="rounded-full bg-indigo-600 p-1"
										style="width: {project.progress}%"
									></div>
								</div>
							</td>
							<td>{project.dueDate}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</article>
