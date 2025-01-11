<script lang="ts">
	import MainMenu from '../app/view/menu/MainMenu.svelte';

	// 메뉴 버튼 클릭시 처리 하는 용도
	// 동적 적용이 안되서 아래와 같은 형태로 처리를 해줘야됨 ㅋㅋㅋ;;;
	let MainMenuActive: any = $state(80);
	const MainViewActive: any = {
		80: 'w-[calc(100%-80px)] ml-[80px]',
		240: 'w-[calc(100%-240px)] ml-[240px]'
	};
</script>

<div
	class="h-screen w-screen min-w-[1700px] overflow-hidden overflow-x-hidden bg-gray-100 dark:bg-gray-800"
>
	<!-- Left nav-->
	<MainMenu bind:MainMenuActive />
	<!-- Content -->
</div>
