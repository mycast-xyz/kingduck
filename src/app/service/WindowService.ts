import { writable, type Readable, type Writable } from 'svelte/store';
import type { ModalType } from '../model/window/ModalType';

class WindowServiceInit {
	#modal: Writable<ModalType | null> = writable(null);
	#modalData: Writable<any> = writable(null);

	get modal(): Readable<ModalType | null> {
		return this.#modal;
	}

	get modalData(): Readable<any> {
		return this.#modalData;
	}

	openModal(modal: ModalType, data?: any) {
		this.#modalData.set(data ?? null);
		this.#modal.set(modal);
		ModalView.set(true);
	}

	closeModal() {
		this.#modal.set(null);
		this.#modalData.set(null);
		ModalView.set(false);
	}
}

export const WindowService = new WindowServiceInit();
export const ModalView = writable(false);
