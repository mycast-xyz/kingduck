<script lang="ts">
	import ListCardView from '../../list/ListCardView.svelte';
	import { characterList } from '../../../../app/service/character/CharacterListService';
	// 컴포넌트 가져오기
	import { WindowService } from '../../../service/WindowService';
	import MobileModal from '../../modal/MobileModal.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
</script>

<MobileModal {data} />
<div class=" mt-7 w-screen overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="search-bar"
		class="relative flex h-auto w-full items-center justify-between px-4 pt-12"
	>
		<div class="flex w-full items-center rounded-lg border border-gray-200 bg-white px-3 py-1">
			<button class="mr-2 flex h-9 items-center rounded-lg" aria-label="검색">
				<i class="ri-search-line text-xl text-gray-400"></i>
			</button>
			<input
				type="text"
				placeholder="캐릭터 검색"
				class="h-9 w-full border-none bg-transparent text-sm placeholder-gray-500 focus:outline-none"
			/>
		</div>
		<button
			aria-label="필터 모달 열기"
			class="ml-3 flex items-center rounded-lg border-2 border-gray-200 bg-white px-3"
			onclick={() => {
				WindowService.openModal('mobile-filter');
			}}
		>
			<i class="ri-filter-3-line py-2 text-xl text-gray-600"></i>
		</button>
	</article>

	<article id="list-componet" class=" my-0 mr-0 mt-2 flex h-full overflow-hidden">
		<div class="list h-full w-full overflow-y-auto px-2">
			<ListCardView {data} list={$characterList} />
		</div>
	</article>
</div>
