'use strict';

export class Modal {
	private $element: HTMLElement;
	private $container: HTMLElement;

	private closeCallback: () => void;

	constructor() {
		this.$element = document.createElement('div');
		this.$element.classList.add('overlay');
		this.$container = document.createElement('div');
		this.$container.classList.add('modal-container');
		this.$element.appendChild(this.$container);

		this.$element.addEventListener('click', (e: MouseEvent) => {
			this.close();
		});
		this.$container.addEventListener('click', (e: MouseEvent) => {
			e.stopImmediatePropagation();
		});
	}

	public open(): void {
		document.body.appendChild(this.$element);
	}

	public close(): void {
		this.$element.remove();
		if (this.closeCallback) {
			this.closeCallback();
		}
	}
	public setContent(content: HTMLElement | string): void {
		if (typeof content === 'string') {
			this.$container.innerHTML = content;
		} else {
			this.$container.innerHTML = '';
			this.$container.appendChild(content);
		}
	}

	set onClose(callback: () => void) {
		this.closeCallback = callback;
	}
}