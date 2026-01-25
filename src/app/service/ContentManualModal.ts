import { onMount } from 'svelte';

export class ContentManualModal {
	showModal = $state(false);

	/** 페이지 로드시 쿠키 확인 및 모달 표시 여부 설정 */
	checkModalCookie() {
		const hideModal = document.cookie
			.split('; ')
			.find((row) => row.startsWith('hideContentViewModal='));

		this.showModal = !hideModal;
	}

	/**
	 * 다시 보지 않기 체크박스 이벤트 핸들러
	 * 체크시 30일간 유효한 쿠키 설정
	 */
	handleDontShowAgain(e: Event) {
		const checkbox = e.target as HTMLInputElement;
		if (checkbox.checked) {
			const expiryDate = new Date();
			expiryDate.setDate(expiryDate.getDate() + 30);
			document.cookie = `hideContentViewModal=true; expires=${expiryDate.toUTCString()}; path=/`;
		}
	}

	/** 모달 닫기 핸들러 */
	closeModal() {
		this.showModal = false;
	}
}
