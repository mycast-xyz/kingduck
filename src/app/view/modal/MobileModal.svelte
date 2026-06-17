<script lang="ts">
	import type { Component } from 'svelte';
	import { onDestroy } from 'svelte';
	import { WindowService, ModalView } from '../../service/WindowService';
	import MobileLayer from '../../view-framework/modal/MobileModal.svelte';
	import MobileFilter from './filter/MobileFilter.svelte';

	// props에서 데이터 가져오기
	const { data } = $props<{ data: any }>();

	let ModalComponent = $state<Component<any> | null>(null);
	let ModalTitle = $state('');

	const _unsubModal = WindowService.modal.subscribe((m) => {
		switch (m) {
			case 'mobile-filter':
				ModalComponent = MobileFilter;
				ModalTitle = '필터';
				break;
			default:
				ModalTitle = '';
				break;
		}
	});
	onDestroy(_unsubModal);

	$effect(() => {
		if ($ModalView) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	});
</script>

{#if $ModalView}
	<MobileLayer title={ModalTitle} onresetclick={() => {}}>
		<div slot="body">
			<ModalComponent {data} />
		</div>
	</MobileLayer>
{/if}
