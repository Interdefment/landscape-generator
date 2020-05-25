'use strict';
import Vector from './vector';
import { Canvas, ICanvasOptions } from './canvas';
import * as utils from './utils';
import { Modal } from './modal';
import RGBColor from './rgbcolor';
import { ILandscapeLayerOptions, LandscapeLayer, DeafultLayerOptions } from './landscapeLayer';
import { LayerForm } from './landscapeLayerForm';


export interface ILandscapeOptions {
	layers: ILandscapeLayerOptions[];
	width: number;
	moveSpeed: number;
	height: number;
	translateBuffer: number;
	root: string | HTMLDivElement;
	backgroundColor: RGBColor;
	id: string;
}

export class Landscape {
	private layers: LandscapeLayer[];
	private width: number;
	private screenSize: number;
	private offset: number = 0;
	private hoveredLayer: LandscapeLayer;
	private moveSpeed: number;
	private dragMode: string;

	private moving: number = 0;

	private start: number;
	private end: number;
	private height: number;

	private activeLayer: LandscapeLayer;
	private activeLayerIndex: number;
	private canvas: Canvas;

	private $root: HTMLDivElement;

	constructor(private options: ILandscapeOptions) {
		this.layers = [];
		this.width = options.width;
		this.screenSize = options.width;
		this.moveSpeed = options.moveSpeed;
		this.height = options.height;
		this.activeLayer = null;
		options.layers.forEach(layerOptions => {
			const layer = new LandscapeLayer(layerOptions);
			layer.increase(1);
			layer.increase(-1);
			this.layers.push(layer);
		});
		this.updateBoundaries();
	}

	/**
	 * Sets nearest to zero point layer start and end values
	 */
	private updateBoundaries(): void {
		this.start = -Infinity;
		this.end = Infinity;
		for (const layer of this.layers) {
			this.start = Math.max(this.start, layer.start);
			this.end = Math.min(this.end, layer.end);
		}
	}

	public draw(canvas: Canvas): void {
		this.layers.forEach((layer, index) => {
			layer.draw(this.offset, this.offset + this.screenSize, canvas);
		});
		if (this.activeLayer) {
			this.activeLayer.stroke(this.offset, this.offset + this.screenSize, canvas);
			this.activeLayer.drawPoints(this.offset, this.offset + this.screenSize, canvas);
		}
	}

	public deleteActiveLayer(): void {
		if (this.activeLayer) {
			this.layers.splice(this.activeLayerIndex, 1);
			this.activeLayer = null;
		}
	}

	public editActiveLayer(): void {
		if (this.activeLayer) {
			this.activeLayer.edit();
		}
	}

	public update(): void {
		if (this.moving) {
			this.translate(this.moving);
		}
	}

	/**
	 * Adds given value multiplied by base landscape speed to current moving speed.
	 * If given value and current speed have different signs, resets moving to speed to zero.
	 */
	public increaseSpeed(speedFactor: number): void {
		if (this.moving * speedFactor < 0) {
			this.moving = 0;
		} else {
			this.moving += speedFactor * this.moveSpeed;
		}
	}

	public getCursorPointFromEvent(event: MouseEvent, canvas: Canvas): Vector {
		let cursor = canvas.getCursorVector(event.clientX, event.clientY);
		cursor.x += this.offset;
		return cursor;
	}

	public translate(value: number): void {
		this.offset += value;
		if (this.offset < this.start) {
			for (const layer of this.layers) {
				while (this.offset - this.options.translateBuffer < layer.start) {
					layer.increase(-1);
				}
			}
		}
		if (this.offset + this.screenSize > this.end) {
			for (const layer of this.layers) {
				while (this.offset + this.screenSize + this.options.translateBuffer > layer.end) {
					layer.increase(1);
				}
			}
		}
		this.updateBoundaries();
	}

	private getLayerIndexByPoint(point: Vector): number | null {
		for (let i = this.layers.length - 1; i >= 0; --i) {
			if (this.layers[i].isBelongs(point)) {
				return i
			}
		}
		return null;
	}

	private resetHover(): void {
		if (this.hoveredLayer) {
			this.hoveredLayer.hover = false;
		}
	}

	public hasActiveLayer(): boolean {
		return !!this.activeLayer;
	}

	public deleteBasePoint(point: Vector): boolean {
		if (!this.activeLayer) {
			return false;
		}
		return this.activeLayer.deleteBasePoint(point);
	}

	public addBasePoint(point: Vector): boolean {
		if (!this.activeLayer) {
			return false;
		}
		return this.activeLayer.addBasePoint(point);
	}

	public setDragMode(point: Vector): void {
		if (this.dragMode == 'point') {
			return;
		}
		if (this.activeLayer && this.activeLayer.activatePoint(point)) {
			this.dragMode = 'point';
		} else {
			this.dragMode = 'canvas'
		}
	}

	public unsetDragMode(): void {
		if (this.dragMode == 'point' && this.activeLayer) {
			this.activeLayer.deactivatePoint();
		}
		this.dragMode = '';
	}

	public drag(point: Vector, dx: number, dy: number): void {
		if (this.dragMode == 'canvas') {
			this.translate(-dx);
		}
		if (this.dragMode == 'point') {
			this.activeLayer.setActivePointPosition(point);
		}
	}

	public hover(point: Vector): string {
		if (this.dragMode == 'point') {
			return 'point';
		}
		this.resetHover();
		if (this.activeLayer && this.activeLayer.hoverBasePoint(point)) {
			this.activeLayer.hover = true;
			this.hoveredLayer = this.activeLayer;
			return 'point';
		}
		const idx = this.getLayerIndexByPoint(point);
		if (idx === null) {
			this.hoveredLayer = null;
			return 'none';
		}
		this.hoveredLayer = this.layers[idx];
		this.hoveredLayer.hover = true;
		return 'layer';
	}

	public setActiveLayer(point: Vector): void {
		this.activeLayerIndex = this.getLayerIndexByPoint(point);
		if (this.activeLayerIndex !== null) {
			this.activeLayer = this.layers[this.activeLayerIndex];
		} else {
			this.activeLayer = null;
		}
	}

	public removeHover(): void {
		if (this.hoveredLayer) {
			this.hoveredLayer.hover = false;
			this.hoveredLayer = null;
		}
	}

	public createNewLayer(): void {
		const options: ILandscapeLayerOptions = { ...DeafultLayerOptions };
		options.points = [
			new Vector(this.start, this.height / 2),
			new Vector(this.end, this.height / 2),
		];
		const layerForm = new LayerForm(options, 'create');
		layerForm.openModal()
			.then(layerOptions => {
				const layer = new LandscapeLayer(layerOptions);
				this.layers.push(layer);
			})
			.catch(() => {});
	}
}

