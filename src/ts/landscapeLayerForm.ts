'use strict';
import Vector from './vector';
import { Modal } from './modal';
import RGBColor from './rgbcolor';
import { ILandscapeLayerOptions,  } from './landscapeLayer';


export class LayerForm {
	private $element: HTMLDivElement

	private $roughness: HTMLInputElement;
	private $gap: HTMLInputElement;
	private $color: HTMLInputElement;
	private $hoverColor: HTMLInputElement;
	private $strokeColor: HTMLInputElement;
	private $strokeWidth: HTMLInputElement;
	private $pointRadius: HTMLInputElement;
	private $pointColor: HTMLInputElement;
	private $activePointColor: HTMLInputElement;
	private $hoveredPointColor: HTMLInputElement;

	private $ok: HTMLButtonElement;
	private $delete: HTMLButtonElement;

	private _points: Vector[];
	private _gap: number;

	constructor(options: ILandscapeLayerOptions, private _mode: string) {
		const positiveNumberCorrector = (value: string): string => {
			if (isNaN(+value)) {
				return '0';
			}
			if (+value < 0) {
				return '0';
			}
			return value;
		}
		this.$roughness   = this.createNumberInput('roughness', options.roughness.toString(), positiveNumberCorrector);
		this.$gap         = this.createNumberInput('gap', options.gap.toString(), positiveNumberCorrector);
		this.$strokeWidth = this.createNumberInput('strokeWidth', options.strokeWidth.toString(), positiveNumberCorrector);
		this.$pointRadius = this.createNumberInput('pointRadius', options.pointRadius.toString(), positiveNumberCorrector);
		this.$color             = this.createColorInput('color', options.color.hexString());
		this.$hoverColor        = this.createColorInput('hoverColor', options.hoverColor.hexString());
		this.$strokeColor       = this.createColorInput('strokeColor', options.strokeColor.hexString());
		this.$pointColor        = this.createColorInput('pointColor', options.pointColor.hexString());
		this.$activePointColor  = this.createColorInput('activePointColor', options.activePointColor.hexString());
		this.$hoveredPointColor = this.createColorInput('hoveredPointColor', options.hoveredPointColor.hexString());
		this._points = options.points;
		this._gap = options.gap;
	}

	public openModal() {
		this.$element = document.createElement('div');
		this.$element.classList.add('layer-form');
		this.$element.appendChild(this.createInputWrapper(this.$roughness, 'Roughness'));
		this.$element.appendChild(this.createInputWrapper(this.$gap, 'Points period gap'));
		this.$element.appendChild(this.createInputWrapper(this.$strokeWidth, 'Stroke width'));
		this.$element.appendChild(this.createInputWrapper(this.$pointRadius, 'Point radius'));
		this.$element.appendChild(this.createInputWrapper(this.$color, 'Main color'));
		this.$element.appendChild(this.createInputWrapper(this.$hoverColor, 'Hover color'));
		this.$element.appendChild(this.createInputWrapper(this.$strokeColor, 'Line color'));
		this.$element.appendChild(this.createInputWrapper(this.$pointColor, 'Point color'));
		this.$element.appendChild(this.createInputWrapper(this.$activePointColor, 'Active point color'));
		this.$element.appendChild(this.createInputWrapper(this.$hoveredPointColor, 'Hovered point color'));
		this.$element.appendChild(this.createButtons());
		const modal = new Modal();
		modal.open();
		modal.setContent(this.$element);
		return new Promise<ILandscapeLayerOptions>((resolve, reject) => {
			modal.onClose = () => reject();
			this.$ok.addEventListener('click', e => {
				resolve(this.getOptions());
				modal.close();
			});
			this.$delete.addEventListener('click', e => modal.close());
		});
	}

	private createButtons() {
		const buttonsWrapper = document.createElement('div');
		buttonsWrapper.classList.add('layer-buttons-wrapper');

		this.$ok = document.createElement('button');
		this.$ok.classList.value = 'bttn-material-flat bttn-lg bttn-success';
		this.$ok.textContent = 'Save';
		buttonsWrapper.appendChild(this.$ok);

		this.$delete = document.createElement('button');
		this.$delete.classList.value = 'bttn-material-flat bttn-lg bttn-danger';
		this.$delete.textContent = 'Cancel';
		buttonsWrapper.appendChild(this.$delete);

		return buttonsWrapper;
	}

	private createNumberInput(name: string, value: string, inputCorrector: (value: string) => string = null): HTMLInputElement {
		const input = document.createElement('input');
		input.setAttribute('name', name);
		input.setAttribute('type', 'number');
		input.setAttribute('value', value);
		input.addEventListener('input', function(e) {
			this.value = inputCorrector(this.value);
		});
		return input;
	}

	private createColorInput(name: string, value: string): HTMLInputElement {
		const input = document.createElement('input');
		input.setAttribute('type', 'color');
		input.setAttribute('name', name);
		input.setAttribute('value', value);
		return input;
	}

	private createInputWrapper(input: HTMLInputElement, labelText: string) {
		const label = document.createElement('label');
		label.textContent = labelText;
		label.classList.add('input-label');
		const wrapper = document.createElement('div');
		wrapper.classList.add('input-wrapper');
		wrapper.appendChild(label);
		wrapper.appendChild(input);
		return wrapper;
	}

	get element(): HTMLDivElement {
		return this.$element;
	}

	public getOptions(): ILandscapeLayerOptions {
		if (this._mode == 'create') {
			const _end = this._points[this._points.length - 1];
			const _start = this._points[0];
			const y =  (_start.y + _end.y) / 2;
			this._points = [ ];
			for (let x = _start.x; x <= _end.x; x += this._gap) {
				this._points.push(new Vector(x, y));
			}
		}
		return {
			roughness: +this.$roughness.value,
			gap: +this.$gap.value,
			strokeWidth: +this.$strokeWidth.value,
			pointRadius: +this.$pointRadius.value,
			points: this._points.slice(),
			color: RGBColor.parseString(this.$color.value),
			hoverColor: RGBColor.parseString(this.$hoverColor.value),
			strokeColor: RGBColor.parseString(this.$strokeColor.value),
			pointColor: RGBColor.parseString(this.$pointColor.value),
			activePointColor: RGBColor.parseString(this.$activePointColor.value),
			hoveredPointColor: RGBColor.parseString(this.$hoveredPointColor.value),
		}
	}

	public html() {
		return this.$element.outerHTML;
	}
}