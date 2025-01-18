<script lang="ts">
	import '../app.css';
	import MainMenu from '../app/view/menu/MainMenu.svelte';
	let { children } = $props();
</script>

<MainMenu />

{@render children()}
