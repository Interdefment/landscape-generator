'use strict';
import Vector from './vector';
import { Canvas } from './canvas';
import * as utils from './utils';
import { Modal } from './modal';
import RGBColor from './rgbcolor';

export function midpointDisplacement(heightMap: number[], start: number, end: number, roughness: number) {
	if (start >= end - 1) {
		return;
	}
	const length = end - start;
	const mid = Math.floor((start + end + 1) / 2);
	const height = (heightMap[start] + heightMap[end]) / 2
		+ roughness * length * utils.randomValue(-1, 1);
	heightMap[mid] = height;
	midpointDisplacement(heightMap, start, mid, roughness);
	midpointDisplacement(heightMap, mid, end, roughness);
}

export interface ILandscapeLayerOptions {
	roughness: number;
	points: Vector[];
	color: RGBColor;
	hoverColor: RGBColor;
	gap: number;
	pointRadius: number;
}

export class LandscapeLayer {
	private heightMap: Map<number, number>;
	private points: Vector[];

	private prevPointIndex: number;
	private nextPointIndex: number;

	private endPoint: Vector;
	private startPoint: Vector;
	private _hover: boolean = false;
	private _active: boolean = false;

	private _activePointIndex: number;

	set hover(value: boolean) {
		this._hover = value;
	}
	set active(value: boolean) {
		this._hover = value;
	}
	get active(): boolean {
		return this._active;
	}

	get end(): number {
		return this.endPoint.x;
	}
	get start(): number {
		return this.startPoint.x
	}

	constructor(private _options: ILandscapeLayerOptions) {
		this.points = _options.points;
		this.heightMap = new Map();
		this.heightMap.set(this.points[0].x, this.points[0].y);

		this.generateFullWidth();
		this.startPoint = this.points[0].copy();
		this.endPoint = this.points[this.points.length - 1].copy();

		this.prevPointIndex = this.points.length - 1;
		this.nextPointIndex = 0;
	}

	private generateFullWidth() {
		for (let i = 1; i < this.points.length; ++i) {
			this.heightMap.set(this.points[i].x, this.points[i].y);
			this.generate(this.points[i - 1].x, this.points[i].x)
		}
	}

	public increase(direction: number): void {
		if (direction > 0) {
			let nextPoint = this.points[this.nextPointIndex];
			const dx = this.nextPointIndex ?
				nextPoint.x - this.points[this.nextPointIndex - 1].x :
				this._options.gap;
			this.nextPointIndex = (this.nextPointIndex + 1) % this.points.length;
			let endX = this.endPoint.x + dx;
			this.heightMap.set(endX, nextPoint.y);
			this.generate(this.endPoint.x, endX);
			this.endPoint.x = endX;
			this.endPoint.y = nextPoint.y;
			this.points.push(this.endPoint.copy());
		} else if (direction < 0) {
			let prevPoint = this.points[this.prevPointIndex];
			const dx = this.prevPointIndex != this.points.length - 1 ?
				this.points[this.prevPointIndex + 1].x - prevPoint.x :
				this._options.gap;
			this.prevPointIndex = (this.points.length + this.prevPointIndex - 1) % this.points.length;
			let startX = this.startPoint.x - dx;
			this.heightMap.set(startX, prevPoint.y);
			this.generate(startX, this.startPoint.x);
			this.startPoint.x = startX;
			this.startPoint.y = prevPoint.y;
			this.points.unshift(this.startPoint.copy());
		}
	}

	public deleteBasePoint(idx: number): void {
		if (idx <= 0 || idx >= this.points.length - 1) {
			return;
		}
		this.generate(this.points[idx - 1].x, this.points[idx + 1].x);
		this.points.splice(idx, 1);
	}

	public generate(start: number, end: number): void {
		if (start >= end - 1) {
			return;
		}
		const length = end - start;
		const mid = Math.floor((start + end + 1) / 2);
		const height = (this.heightMap.get(start) + this.heightMap.get(end)) / 2
			+ this._options.roughness * length * utils.randomValue(-1, 1);
		this.heightMap.set(mid, height);
		this.generate(start, mid);
		this.generate(mid, end);
	}

	public drawPoints(start: number, end: number, canvas: Canvas, color: string = 'crimson'): void {
		for (const point of this.points) {
			if (point.x > start && point.x < end) {
				if (point == this.activePoint) {
					canvas.fillCirlce(point.add(new Vector(-start, 0)), this._options.pointRadius, 'magenta');
				} else {
					canvas.fillCirlce(point.add(new Vector(-start, 0)), this._options.pointRadius, color);
				}
			}
		}
	}

	public stroke(
		start: number,
		end: number,
		canvas: Canvas,
		strokeColor: string = '#000000',
		strokeWidth: number = 1
	): void {
		canvas.beginPath();
		for (let i = start + 1; i <= end; ++i) {
			const height = this.heightMap.get(i);
			canvas.lineTo(i - start, height);
		}
		canvas.stroke(strokeColor, strokeWidth);
	}

	public draw(
		start: number,
		end: number,
		canvas: Canvas,
	): void {
		canvas.beginPath();
		canvas.moveTo(0, this.heightMap.get(0));
		for (let i = start + 1; i <= end; ++i) {
			const height = this.heightMap.get(i);
			canvas.lineTo(i - start, height);
		}

		canvas.lineTo(end - start, 0);
		canvas.lineTo(0, 0);
		canvas.lineTo(0, this.heightMap.get(0));
		canvas.fill(this._hover ? this._options.hoverColor.hexString() : this._options.color.hexString());
	}

	private activePoint: Vector;

	public unsetActivePoint() {
		this._activePointIndex = null;
		this.activePoint = null;
	}

	public setActivePoint(index: number) {
		this._activePointIndex = index;
		this.activePoint = this.points[index];
	}

	public setActivePointPosition(cursor: Vector) {
		if (this.activePoint) {
			this.activePoint.y = cursor.y;
			if (cursor.x >= this.points[this._activePointIndex + 1].x) {
				this.activePoint.x = this.points[this._activePointIndex + 1].x - 1;
			} else if (cursor.x <= this.points[this._activePointIndex - 1].x) {
				this.activePoint.x = this.points[this._activePointIndex - 1].x + 1;
			} else {
				this.activePoint.x = cursor.x;
			}
			this.heightMap.set(this.activePoint.x, this.activePoint.y);
			this.generate(this.points[this._activePointIndex - 1].x, this.activePoint.x);
			this.generate(this.activePoint.x, this.points[this._activePointIndex + 1].x);
		}
	}

	public getBasePoint(point: Vector) {
		for (let i = 0; i < this.points.length; ++i) {
			if (Vector.distance2(point, this.points[i]) <= this._options.pointRadius * this._options.pointRadius) {
				return {
					point: this.points[i],
					index: i,
				};
			}
		}
		return false;
	}

	public addNewPoint(point: Vector) {
		const idx = utils.binary_search(this.points, (p: Vector) => p.x > point.x);
		this.points.splice(idx, 0, point.copy());
		this.heightMap.set(this.points[idx].x, this.points[idx].y);
		this.generate(this.points[idx - 1].x, this.points[idx].x);
		this.generate(this.points[idx].x, this.points[idx + 1].x);
	}

	public isBelongs(point: Vector): boolean {
		return point.x >= this.start &&
			point.x <= this.end &&
			point.y <= this.heightMap.get(point.x);
	}

	public getOptions(): ILandscapeLayerOptions {
		return this._options;
	}

	public edit() {
		const layerForm = new LayerForm(this._options, 'edit');
		layerForm.openModal()
			.then(layerOptions => {
				const oldRoughness = this._options.roughness;
				this._options = layerOptions;
				if (oldRoughness != this._options.roughness) {
					this.generateFullWidth();
				}
			})
			.catch(() => {});
	}
}

let co = 0;

export interface ILandscapeOptions {
	layers: ILandscapeLayerOptions[];
	width: number;
	moveSpeed: number;
	height: number;
}

export class Landscape {
	private layers: LandscapeLayer[];
	private width: number;
	private screenSize: number;
	private offset: number = 0;
	private hoveredLayer: LandscapeLayer;
	private moveSpeed: number;

	private moving: number;

	private start: number;
	private end: number;
	private height: number;

	private activeLayer: LandscapeLayer;
	private activeLayerIndex: number;

	constructor(options: ILandscapeOptions) {
		this.layers = [];
		this.width = options.width;
		this.screenSize = options.width;
		this.moveSpeed = options.moveSpeed;
		this.height = options.height;
		this.start = 0;
		this.end = 0;
		this.activeLayer = null;
		options.layers.forEach(layerOptions => {
			const layer = new LandscapeLayer(layerOptions);
			layer.increase(1);
			layer.increase(-1);
			this.layers.push(layer);
			this.end = Math.max(layer.end, this.end);
		});
	}
	public draw(canvas: Canvas): void {
		this.layers.forEach((layer, index) => {
			layer.draw(this.offset, this.offset + this.screenSize, canvas);
		});
		if (this.activeLayer !== null) {
			this.activeLayer.stroke(this.offset, this.offset + this.screenSize, canvas, '#ffffff', 2);
			this.activeLayer.drawPoints(this.offset, this.offset + this.screenSize, canvas);
		}
	}

	public deleteActiveLayer(): void {
		if (this.activeLayer) {
			this.layers.splice(this.activeLayerIndex, 1);
			this.activeLayer = null;
		}
	}

	public editLayer(): void {
		if (this.activeLayer) {
			this.activeLayer.edit();
		}
	}

	public update() {
		if (this.moving) {
			this.translate(this.moving);
		}
	}

	public go(direction: number) {
		if (this.moving * direction < 0) {
			this.moving = 0;
		} else if (!this.moving) {
			this.moving = Math.sign(direction) * this.moveSpeed;
		}
	}

	public getCursorPoint(x: number, y: number, canvas: Canvas) {
		let cursor = canvas.getCursorVector(x, y);
		cursor.x += this.offset;
		return cursor;
	}

	public translate(value: number): void {
		this.offset += value;
		if (this.offset < this.start) {
			this.start = this.offset - 1000;
			for (const layer of this.layers) {
				while (this.start < layer.start) {
					layer.increase(-1);
				}
			}
		}
		if (this.offset + this.screenSize > this.width) {
			this.end = this.offset + this.screenSize + 1000;
			for (const layer of this.layers) {
				while (this.end > layer.end) {
					layer.increase(1);
				}
			}
		}
	}

	private getPointLayer(point: Vector): { layer: LandscapeLayer, index: number } {
		for (let i = this.layers.length - 1; i >= 0; --i) {
			if (this.layers[i].isBelongs(point)) {
				return {
					layer: this.layers[i],
					index: i,
				}
			}
		}
		return {
			layer: null,
			index: null,
		};
	}

	private resetHover(): void {
		if (this.hoveredLayer) {
			this.hoveredLayer.hover = false;
		}
	}

	private getBasePoint(point: Vector) {
		if (!this.activeLayer) {
			return null;
		}
		const basePoint = this.activeLayer.getBasePoint(point);
		if (basePoint) {
			return {
				point: basePoint.point,
				pointIndex: basePoint.index,
			}
		}
		return null;
	}

	private dragMode: string;

	public doubleClick(cursor: Vector, canvas: Canvas): string {
		if (!this.activeLayer) {
			return;
		}
		const point = this.getCursorPoint(cursor.x, cursor.y, canvas);
		const basePoint = this.getBasePoint(point);
		if (basePoint) {
			this.activeLayer.deleteBasePoint(basePoint.pointIndex);
			return 'delete';
		} else {
			this.addBasePoint(point);
			return 'add';
		}
	}

	private addBasePoint(point: Vector): void {
		if (!this.activeLayer) {
			return;
		}
		this.activeLayer.addNewPoint(point);
	}

	public setDragMode(canvas: Canvas, cursor: Vector) {
		if (this.dragMode == 'point') {
			return;
		}
		const point = this.getCursorPoint(cursor.x, cursor.y, canvas);
		const basePoint = this.getBasePoint(point);
		if (basePoint) {
			this.dragMode = 'point';
			this.activeLayer.setActivePoint(basePoint.pointIndex);
		} else {
			this.dragMode = 'canvas'
		}
	}
	public unsetDragMode() {
		if (this.dragMode == 'point') {
			this.activeLayer.unsetActivePoint();
		}
		this.dragMode = '';
	}

	public drag(cursor: Vector, dx: number, dy: number): void {
		if (this.dragMode == 'canvas') {
			this.translate(-dx);
		}
		if (this.dragMode == 'point') {
			this.activeLayer.setActivePointPosition(cursor);
		}
	}

	public mouseUp(point: Vector) {
		this.unsetDragMode();
	}

	public mouseMove(point: Vector): string {
		if (this.dragMode == 'point') {
			return 'point';
		}
		const basePoint = this.getBasePoint(point);
		this.resetHover();
		if (basePoint) {
			this.activeLayer.hover = true;
			this.hoveredLayer = this.activeLayer;
			return 'point';
		}
		const { layer } = this.getPointLayer(point);
		this.hoveredLayer = layer;
		if (layer) {
			layer.hover = true;
			return 'layer';
		}
		return 'none';
	}

	public setActiveLayer(point: Vector): void {
		const active = this.getPointLayer(point);
		if (this.activeLayer !== null && this.activeLayer !== active.layer) {
			this.activeLayer.active = false;
		} else if (active.index !== null) {
			active.layer.active = true;
		}
		this.activeLayer = active.layer;
		this.activeLayerIndex = active.index;
	}
	public removeHover(): void {
		if (this.hoveredLayer) {
			this.hoveredLayer.hover = false;
			this.hoveredLayer = null;
		}
	}

	public createNewLayer(): void {
		const options: ILandscapeLayerOptions = {
			points: [
				new Vector(this.start, this.height / 2),
				new Vector(this.end, this.height / 2),
			],
			color: new RGBColor(120, 120, 120),
			hoverColor: new RGBColor(160, 160, 160),
			gap: 300,
			roughness: 0.5,
			pointRadius: 8,
		};
		const layerForm = new LayerForm(options, 'create');
		layerForm.openModal()
			.then(layerOptions => {
				const layer = new LandscapeLayer(layerOptions);
				layer.increase(-1);
				layer.increase(1);
				this.layers.push(layer);
			})
			.catch(() => {});
	}
}


export class LayerForm {
	private $element: HTMLDivElement

	private $roughness: HTMLInputElement;
	private $color: HTMLInputElement;
	private $hoverColor: HTMLInputElement;

	private $ok: HTMLButtonElement;
	private $delete: HTMLButtonElement;
	private _points: Vector[];

	constructor(private options: ILandscapeLayerOptions, mode: string) {
		this.$roughness = this.createInput('number', 'roughness', options.roughness.toFixed(2));
		this.$color = this.createInput('color', 'color', options.color.hexString());
		this.$hoverColor = this.createInput('color', 'hoverColor', options.hoverColor.hexString());

		if (mode == 'create') {
			this._points = [ ];
			const _end = options.points[options.points.length - 1];
			const _start = options.points[0];
			const dx = _end.x - _start.x;
			const dy = _end.y - _start.y;
			const pointsCount = Math.floor(dx / 300);
			for (let x = _start.x, y = _start.y; x <= _end.x; x += dx / pointsCount, y += dy / pointsCount) {
				this._points.push(new Vector(x, y));
			}
		} else {
			this._points = options.points;
		}
	}

	public openModal() {
		this.$element = document.createElement('div');
		this.$element.classList.add('layer-form');
		this.$element.appendChild(this.createInputWrapper(this.$roughness, 'Roughness: '));
		this.$element.appendChild(this.createInputWrapper(this.$color, 'Color: '));
		this.$element.appendChild(this.createInputWrapper(this.$hoverColor, 'Hover color: '));
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

	private createInput(type: string, name: string, value: string): HTMLInputElement {
		const input = document.createElement('input');
		input.name = name;
		input.type = type;
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

	get roughness(): number {
		return +this.$roughness.value;
	}
	set roughness(value: number) {
		this.$roughness.value = value.toFixed(2);
	}

	get color(): string {
		return this.$color.value;
	}
	set color(value: string) {
		this.$color.value = value;
	}

	get hoverColor(): string {
		return this.$hoverColor.value;
	}
	set hoverColor(value: string) {
		this.$hoverColor.value = value;
	}

	get element(): HTMLDivElement {
		return this.$element;
	}

	public getOptions(): ILandscapeLayerOptions {
		return {
			color: RGBColor.parseString(this.color),
			hoverColor: RGBColor.parseString(this.hoverColor),
			roughness: this.roughness,
			gap: 300,
			points: this._points.slice(),
			pointRadius: this.options.pointRadius,
		}
	}

	public html() {
		return this.$element.outerHTML;
	}
}