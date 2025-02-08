<script lang="ts">
	// 필요한 모듈 및 서비스 가져오기
	import { derived, writable } from 'svelte/store';
	import { characterList } from '../../../../app/service/character/CharacterListService';

	// 컴포넌트 가져오기
	import FooterView from '../../footer/FooterView.svelte';
	import ListCardView from '../../list/ListCardView.svelte';
	import DesktopListMenu from '../../menu/DesktopListMenu.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();
</script>

<div class="h-screen w-screen min-w-[1700px] overflow-hidden bg-gray-100 dark:bg-gray-800">
	<article
		id="list-componet"
		class="my-0 ml-[80px] mr-0 flex h-full w-[calc(100%-80px)] overflow-hidden"
	>
		<DesktopListMenu {data} />
		<div class="list h-auto w-[calc(100%-320px)] w-[inherit] overflow-y-auto pr-2 pt-16">
			<ListCardView {data} list={$characterList} />

			<FooterView />
		</div>
	</article>
</div>

<style lang="scss">
	#list-menu-content {
		-ms-overflow-style: none; /* for Internet Explorer, Edge */
		scrollbar-width: none; /* for Firefox */
		overflow-y: scroll;
	}
	#list-menu-content::-webkit-scrollbar {
		display: none; /* for Chrome, Safari, and Opera */
	}
</style>
