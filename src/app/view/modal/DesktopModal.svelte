<script lang="ts">
	import { WindowService, ModalView } from '../../service/WindowService';
	import DesktopModal from '../../view-framework/modal/DesktopModal.svelte';
	import AddKanban from './kanban/AddKanban.svelte';

	// props에서 데이터 가져오기
	//const { data } = $props<{ data: any }>();

	let ModalComponent = $state();
	let ModalTitle = $state('');
	let ModalSize = $state('');

	WindowService.modal.subscribe((m) => {
		switch (m) {
			case 'admin-add-kanban':
				ModalComponent = AddKanban;
				ModalTitle = '칸반보드 추가';
				ModalSize = 'large';
				break;
			default:
				ModalTitle = '';
				break;
		}
	});

	// svelte-ignore state_referenced_locally

	$effect(() => {});

	$effect(() => {
		if ($ModalView) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	});
</script>

{#if $ModalView}
	<DesktopModal title={ModalTitle} size={ModalSize} body={ModalComponent}></DesktopModal>
{/if}
