'use strict';
import Vector from './vector';
import { Canvas } from './canvas';
import * as utils from './utils';
import RGBColor from './rgbcolor';
import { LayerForm } from './landscapeLayerForm';

export interface ILandscapeLayerOptions {
	roughness: number;
	points: Vector[];
	gap: number;
	color: RGBColor;
	hoverColor: RGBColor;
	strokeColor: RGBColor;
	strokeWidth: number;
	pointRadius: number;
	pointColor: RGBColor;
	activePointColor: RGBColor;
	hoveredPointColor: RGBColor;
}

export const DeafultLayerOptions: ILandscapeLayerOptions = {
	roughness: 0.25,
	points: [],
	gap: 300,
	color: new RGBColor(103, 76, 71),
	hoverColor: new RGBColor(133, 98, 91),
	strokeColor: new RGBColor(255, 255, 255),
	strokeWidth: 2,
	pointRadius: 8,
	pointColor: new RGBColor(123, 104, 238),
	activePointColor: new RGBColor(97, 97, 255),
	hoveredPointColor: new RGBColor(153, 50, 204),
}

export class LandscapeLayer {
	private _heightMap: Map<number, number>;
	private _points: Vector[];

		// Indexes for periodical point generation
	private _prevPointIndex: number;
	private _nextPointIndex: number;

	private _endPoint: Vector;
	private _startPoint: Vector;

	private _activePointIndex: number;
	private _hoveredPointIndex: number;
	private _hover: boolean = false;

	constructor(private _options: ILandscapeLayerOptions) {
		this._points = _options.points;
		this._heightMap = new Map();
		this._heightMap.set(this._points[0].x, this._points[0].y);

		this.generateFullWidth();
		this._startPoint = this._points[0].copy();
		this._endPoint = this._points[this._points.length - 1].copy();

		this._prevPointIndex = this._points.length - 1;
		this._nextPointIndex = 0;
	}

	set hover(value: boolean) {
		this._hover = value;
	}

	get end(): number {
		return this._endPoint.x;
	}
	get start(): number {
		return this._startPoint.x
	}

	public generate(start: number, end: number): void {
		if (start >= end - 1) {
			return;
		}
		const length = end - start;
		const mid = Math.floor((start + end + 1) / 2);
		const height = (this._heightMap.get(start) + this._heightMap.get(end)) / 2
			+ this._options.roughness * length * utils.randomValue(-1, 1);
		this._heightMap.set(mid, height);
		this.generate(start, mid);
		this.generate(mid, end);
	}

	private generateFullWidth(): void{
		for (let i = 1; i < this._points.length; ++i) {
			this._heightMap.set(this._points[i].x, this._points[i].y);
			this.generate(this._points[i - 1].x, this._points[i].x)
		}
	}

	/** Adds one point in according direction (positive or negative) */
	public increase(direction: number): void {
		if (direction > 0) {
			let nextPoint = this._points[this._nextPointIndex];
			const dx = this._nextPointIndex ?
				nextPoint.x - this._points[this._nextPointIndex - 1].x :
				this._options.gap;
			this._nextPointIndex = (this._nextPointIndex + 1) % this._points.length;
			let endX = this._endPoint.x + dx;
			this._heightMap.set(endX, nextPoint.y);
			this.generate(this._endPoint.x, endX);
			this._endPoint.x = endX;
			this._endPoint.y = nextPoint.y;
			this._points.push(this._endPoint.copy());
		} else if (direction < 0) {
			let prevPoint = this._points[this._prevPointIndex];
			const dx = this._prevPointIndex != this._points.length - 1 ?
				this._points[this._prevPointIndex + 1].x - prevPoint.x :
				this._options.gap;
			this._prevPointIndex = (this._points.length + this._prevPointIndex - 1) % this._points.length;
			let startX = this._startPoint.x - dx;
			this._heightMap.set(startX, prevPoint.y);
			this.generate(startX, this._startPoint.x);
			this._startPoint.x = startX;
			this._startPoint.y = prevPoint.y;
			this._points.unshift(this._startPoint.copy());
		}
	}

	public drawPoints(start: number, end: number, canvas: Canvas, color: string = 'crimson'): void {
		const startIndex = utils.binary_search(this._points, (p: Vector) => p.x > start);
		for (let i = startIndex; this._points[i].x < end; ++i) {
			const point = this._points[i].add(new Vector(-start, 0));
			switch(i) {
				case this._activePointIndex:
					canvas.fillCirlce(point, this._options.pointRadius, this._options.activePointColor.rgbaString());
					break;
				case this._hoveredPointIndex:
					canvas.fillCirlce(point, this._options.pointRadius, this._options.hoveredPointColor.rgbaString());
					break;
				default:
					canvas.fillCirlce(point, this._options.pointRadius, this._options.pointColor.rgbaString());
					break;
			}
		}
	}

	public stroke(start: number, end: number, canvas: Canvas): void {
		canvas.beginPath();
		for (let i = start + 1; i <= end; ++i) {
			const height = this._heightMap.get(i);
			canvas.lineTo(i - start, height);
		}
		canvas.stroke(this._options.strokeColor.rgbaString(), this._options.strokeWidth);
	}

	public draw(start: number, end: number, canvas: Canvas): void {
		canvas.beginPath();
		canvas.moveTo(0, this._heightMap.get(0));
		for (let i = start + 1; i <= end; ++i) {
			const height = this._heightMap.get(i);
			canvas.lineTo(i - start, height);
		}
		canvas.lineTo(end - start, 0);
		canvas.lineTo(0, 0);
		canvas.fill(this._hover ? this._options.hoverColor.hexString() : this._options.color.hexString());
	}

	// TODO: use bin search
	private getBasePointIndex(point: Vector): number | null {
		const squaredRadius = this._options.pointRadius * this._options.pointRadius;
		for (let i = 0; i < this._points.length; ++i) {
			if (Vector.distance2(point, this._points[i]) <= squaredRadius) {
				return i
			}
		}
		return null;
	}

	// Base point behavior

	public addBasePoint(point: Vector): boolean {
		const idx = utils.binary_search(this._points, (p: Vector) => p.x > point.x);
		// Prevent adding new point over the existing one
		if (this._points[idx].x == point.x) {
			return false;
		}
		this._points.splice(idx, 0, point.copy());
		this._heightMap.set(this._points[idx].x, this._points[idx].y);
		this.generate(this._points[idx - 1].x, this._points[idx].x);
		this.generate(this._points[idx].x, this._points[idx + 1].x);
		return true;
	}

	public deleteBasePoint(point: Vector): boolean {
		const index = this.getBasePointIndex(point);
		// Protect first and last points
		if (index === null || index === 0 || index === this._points.length - 1) {
			return false;
		}
		this.generate(this._points[index - 1].x, this._points[index + 1].x);
		this._points.splice(index, 1);
		return true;
	}

	public hoverBasePoint(point: Vector): boolean {
		this._hoveredPointIndex = this.getBasePointIndex(point);
		return this._hoveredPointIndex !== null;
	}

	public deactivatePoint(): void {
		this._activePointIndex = null;
	}

	public activatePoint(point: Vector): boolean {
		this._activePointIndex = this.getBasePointIndex(point);
		return this._activePointIndex !== null;
	}

	public setActivePointPosition(position: Vector): void {
		const activePoint = this._points[this._activePointIndex];
		if (this._activePointIndex !== null) {
			activePoint.y = position.y;
			if (position.x >= this._points[this._activePointIndex + 1].x) {
				activePoint.x = this._points[this._activePointIndex + 1].x - 1;
			} else if (position.x <= this._points[this._activePointIndex - 1].x) {
				activePoint.x = this._points[this._activePointIndex - 1].x + 1;
			} else {
				activePoint.x = position.x;
			}
			this._heightMap.set(activePoint.x, activePoint.y);
			this.generate(this._points[this._activePointIndex - 1].x, activePoint.x);
			this.generate(activePoint.x, this._points[this._activePointIndex + 1].x);
		}
	}


	public isBelongs(point: Vector): boolean {
		return point.x >= this.start &&
			point.x <= this.end &&
			point.y <= this._heightMap.get(point.x);
	}

	public edit(): void {
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
