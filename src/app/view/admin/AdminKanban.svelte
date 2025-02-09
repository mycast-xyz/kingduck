<script lang="ts">
	import { onMount } from 'svelte';
	import Sortable from 'sortablejs';

	// 칸반 보드 상태 관리
	let kanbanColumns = $state([
		{
			id: 'plan',
			title: '계획수립',
			color: 'border-blue-400 hover:bg-blue-100',
			tasks: [
				{
					id: 1,
					title: 'Research FAQ page UX',
					description: 'FAQ 페이지 UX 연구 및 분석',
					dueDate: '2024-02-20',
					priority: 'high',
					assignees: [
						{ id: 'user1', avatar: '/assets/logo/profile.png', name: '김철수' },
						{ id: 'user2', avatar: '/assets/logo/profile.png', name: '이영희' }
					],
					labels: ['연구', 'UX'],
					comments: 4,
					attachments: 12
				},
				{
					id: 2,
					title: 'Review Javascript code',
					description: '자바스크립트 코드 리뷰',
					dueDate: '2024-02-22',
					priority: 'medium',
					assignees: [
						{ id: 'user2', avatar: '/assets/logo/profile.png', name: '이영희' },
						{ id: 'user3', avatar: '/assets/logo/profile.png', name: '박지성' }
					],
					labels: ['개발', '코드리뷰'],
					comments: 2,
					attachments: 5
				}
			]
		},
		{
			id: 'development',
			title: '개발중',
			color: 'border-yellow-400 hover:bg-yellow-100',
			tasks: [
				{
					id: 3,
					title: 'Review completed Apps',
					description: '완성된 앱 디자인 검토',
					dueDate: '2024-02-25',
					priority: 'low',
					assignees: [{ id: 'user4', avatar: '/assets/logo/profile.png', name: '최민수' }],
					labels: ['디자인', '검토'],
					comments: 8,
					attachments: 17
				}
			]
		},
		{
			id: 'testing',
			title: '테스트',
			color: 'border-orange-400 hover:bg-orange-100',
			tasks: []
		},
		{
			id: 'completed',
			title: '완료',
			color: 'border-green-400 hover:bg-green-100',
			tasks: []
		}
	]);

	// 태스크 추가 모달 상태
	let showAddTaskModal = $state(false);
	let selectedColumn = $state('');
	let newTask = $state({
		title: '',
		description: '',
		dueDate: '',
		priority: 'medium',
		assignees: [],
		labels: [],
		comments: 0,
		attachments: 0
	});

	// kanbanColumns 상태 변경 감시
	$effect(() => {
		console.log('칸반 컬럼 상태:', kanbanColumns);
	});

	// 태스크 상세 모달 상태
	let showTaskDetailModal = $state(false);
	let selectedTask = $state(null);
	onMount(() => {
		// 컬럼 간 드래그 앤 드롭
		const containers = document.querySelectorAll<HTMLElement>('.kanban-column');
		containers.forEach((container) => {
			new Sortable(container, {
				group: 'kanban',
				animation: 150,
				onEnd: (evt) => {
					const { from, to } = evt;
					const fromColumnId = from.getAttribute('data-column-id');
					const toColumnId = to.getAttribute('data-column-id');

					// 드래그 앤 드롭 후 상태 업데이트 로직
					if (fromColumnId !== toColumnId) {
						const fromColumn = kanbanColumns.find((col) => col.id === fromColumnId);
						const toColumn = kanbanColumns.find((col) => col.id === toColumnId);

						if (
							fromColumn &&
							toColumn &&
							typeof evt.oldIndex === 'number' &&
							typeof evt.newIndex === 'number'
						) {
							const task = fromColumn.tasks[evt.oldIndex];
							fromColumn.tasks.splice(evt.oldIndex, 1);
							toColumn.tasks.splice(evt.newIndex, 0, task);
							kanbanColumns = [...kanbanColumns];
						}
					}
				}
			});
		});
	});

	// 새 태스크 추가
	function addNewTask(columnId: string) {
		selectedColumn = columnId;
		showAddTaskModal = true;
	}

	// 태스크 상세 보기

	function openTaskDetail(task: any) {
		selectedTask = task;
		showTaskDetailModal = true;
	}

	// 태스크 저장
	function saveTask() {
		if (newTask.title) {
			const column = kanbanColumns.find((col) => col.id === selectedColumn);
			if (column) {
				column.tasks.push({
					id: Date.now(),
					...newTask
				});
			}
			kanbanColumns = [...kanbanColumns];
			showAddTaskModal = false;
			newTask = {
				title: '',
				description: '',
				dueDate: '',
				priority: 'medium',
				assignees: [],
				labels: [],
				comments: 0,
				attachments: 0
			};
		}
	}
</script>

<div class="flex h-full flex-row flex-wrap overflow-x-auto px-2">
	{#each kanbanColumns as column}
		<div class="mr-8 w-80 flex-shrink-0">
			<div
				class="mb-4 flex items-center justify-between rounded-lg border-b-4 {column.color} bg-white px-3 py-2"
			>
				<h3 class="text-lg font-semibold">{column.title}</h3>

				<button class="rounded-full p-2 hover:bg-white/20" onclick={() => addNewTask(column.id)}>
					<i class="ri-add-line"></i>
				</button>
			</div>

			<div class="kanban-column space-y-3" data-column-id={column.id}>
				{#each column.tasks as task}
					<button
						class="w-full cursor-pointer rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
						onclick={() => openTaskDetail(task)}
					>
						<div class="mb-2 flex items-center justify-between">
							<span
								class="rounded-full px-2 py-1 text-xs
								{task.priority === 'high'
									? 'bg-red-100 text-red-700'
									: task.priority === 'medium'
										? 'bg-yellow-100 text-yellow-700'
										: 'bg-green-100 text-green-700'}"
							>
								{task.priority}
							</span>
							<span class="text-sm text-gray-500">{task.dueDate}</span>
						</div>
						<h4 class="mb-3 font-medium">{task.title}</h4>
						<div class="mb-3 flex flex-wrap gap-1">
							{#each task.labels as label}
								<span class="rounded-full bg-gray-100 px-2 py-1 text-xs">{label}</span>
							{/each}
						</div>
						<div class="flex items-center justify-between">
							<div class="flex -space-x-2">
								{#each task.assignees as assignee}
									<img
										src={assignee.avatar}
										alt={assignee.name}
										class="h-8 w-8 rounded-full ring-2 ring-white"
									/>
								{/each}
							</div>
							<div class="flex items-center space-x-3 text-gray-500">
								<div class="flex items-center">
									<i class="ri-message-2-line mr-1"></i>
									<span class="text-sm">{task.comments}</span>
								</div>
								<div class="flex items-center">
									<i class="ri-attachment-2 mr-1"></i>
									<span class="text-sm">{task.attachments}</span>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>

<!-- 태스크 추가 모달 -->
{#if showAddTaskModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h2 class="mb-4 text-xl font-bold">새 태스크 추가</h2>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700" for="title">제목</label>
					<input type="text" bind:value={newTask.title} class="mt-1 w-full rounded-md border p-2" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700" for="description">설명</label>
					<textarea bind:value={newTask.description} class="mt-1 w-full rounded-md border p-2"
					></textarea>
				</div>
				<div class="flex gap-4">
					<div class="flex-1">
						<label class="block text-sm font-medium text-gray-700" for="dueDate">마감일</label>
						<input
							type="date"
							bind:value={newTask.dueDate}
							class="mt-1 w-full rounded-md border p-2"
						/>
					</div>
					<div class="flex-1">
						<label class="block text-sm font-medium text-gray-700" for="priority">우선순위</label>
						<select bind:value={newTask.priority} class="mt-1 w-full rounded-md border p-2">
							<option value="high">높음</option>
							<option value="medium">중간</option>
							<option value="low">낮음</option>
						</select>
					</div>
				</div>
				<div class="flex justify-end gap-2">
					<button
						class="rounded-md bg-gray-200 px-4 py-2"
						onclick={() => (showAddTaskModal = false)}
					>
						취소
					</button>
					<button class="rounded-md bg-blue-500 px-4 py-2 text-white" onclick={saveTask}>
						저장
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- 태스크 상세 모달 -->
{#if showTaskDetailModal && selectedTask}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-2xl rounded-lg bg-white p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold">{selectedTask.title}</h2>
				<button
					class="rounded-full p-2 hover:bg-gray-100"
					onclick={() => (showTaskDetailModal = false)}
					aria-label="닫기"
				>
					<i class="ri-close-line"></i>
				</button>
			</div>
			<div class="space-y-4">
				<p class="text-gray-600">{selectedTask.description}</p>
				<div class="flex flex-wrap gap-2">
					{#each selectedTask.labels as label}
						<span class="rounded-full bg-gray-100 px-3 py-1">{label}</span>
					{/each}
				</div>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<i class="ri-calendar-line"></i>
						<span>{selectedTask.dueDate}</span>
					</div>
					<div class="flex items-center gap-2">
						<i class="ri-flag-line"></i>
						<span>{selectedTask.priority}</span>
					</div>
				</div>
				<div>
					<h3 class="mb-2 font-medium">담당자</h3>
					<div class="flex gap-2">
						{#each selectedTask.assignees as assignee}
							<div class="flex items-center gap-2">
								<img src={assignee.avatar} alt={assignee.name} class="h-8 w-8 rounded-full" />
								<span>{assignee.name}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	:global(.kanban-column) {
		min-height: 200px;
	}
</style>
