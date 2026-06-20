<script lang="ts">
	import { onDestroy } from 'svelte';
	import { WindowService, ModalView } from '../../service/WindowService';
	import DesktopModal from '../../view-framework/modal/DesktopModal.svelte';
	import AddKanban from './kanban/AddKanban.svelte';
	import AdminGameModal from '../admin/game/AdminGameModal.svelte';
	import AdminCharacterModal from '../admin/character/AdminCharacterModal.svelte';
	import AdminEventModal from '../admin/event/AdminEventModal.svelte';
	import AdminItemModal from '../admin/item/AdminItemModal.svelte';
	import AdminRedeemGroupModal from '../admin/redeem/AdminRedeemGroupModal.svelte';
	import AdminNoticeModal from '../admin/notice/AdminNoticeModal.svelte';
	import AdminFaqModal from '../admin/faq/AdminFaqModal.svelte';

	// props에서 데이터 가져오기
	//const { data } = $props<{ data: any }>();

	let ModalComponent = $state();
	let ModalTitle = $state('');
	let ModalSize = $state('');

	const _unsubModal = WindowService.modal.subscribe((m) => {
		switch (m) {
			case 'admin-add-kanban':
				ModalComponent = AddKanban;
				ModalTitle = '칸반보드 추가';
				ModalSize = 'large';
				break;
			case 'admin-add-game':
				ModalComponent = AdminGameModal;
				ModalTitle = '게임 추가/수정';
				ModalSize = 'large';
				break;
			case 'admin-add-character':
				ModalComponent = AdminCharacterModal;
				ModalTitle = '캐릭터 추가/수정';
				ModalSize = 'large';
				break;
			case 'admin-add-event':
				ModalComponent = AdminEventModal;
				ModalTitle = '이벤트 추가/수정';
				ModalSize = 'large';
				break;
			case 'admin-add-item':
				ModalComponent = AdminItemModal;
				ModalTitle = '아이템 추가/수정';
				ModalSize = 'large';
				break;
			case 'admin-add-redeem':
				ModalComponent = AdminRedeemGroupModal;
				ModalTitle = '쿠폰 그룹 추가/수정';
				ModalSize = 'large';
				break;
			case 'admin-add-notice':
				ModalComponent = AdminNoticeModal;
				ModalTitle = '공지사항 추가/수정';
				ModalSize = 'large';
				break;
			case 'admin-add-faq':
				ModalComponent = AdminFaqModal;
				ModalTitle = 'FAQ 추가/수정';
				ModalSize = 'large';
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
	<DesktopModal title={ModalTitle} size={ModalSize} body={ModalComponent}></DesktopModal>
{/if}
