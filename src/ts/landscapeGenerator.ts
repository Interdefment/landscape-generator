'use strict';
import Vector from './vector';
import { Canvas } from './canvas';
import { randomValue } from './utils';
import RGBColor from './rgbcolor';

export function midpointDisplacement(heightMap: number[], start: number, end: number, roughness: number) {
	if (start >= end - 1) {
		return;
	}
	const length = end - start;
	const mid = Math.floor((start + end + 1) / 2);
	const height = (heightMap[start] + heightMap[end]) / 2
		+ roughness * length * randomValue(-1, 1);
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
}

export class LandscapeLayer {
	private roughness: number;
	private heightMap: Map<number, number>;
	private points: Vector[];

	private color: string;
	private hoverColor: string;

	private prevPointIndex: number;
	private nextPointIndex: number;


	private gap: number;
	private endPoint: Vector;
	private startPoint: Vector;
	private _hover: boolean = false;

	set hover(value: boolean) {
		this._hover = value;
	}

	get end(): number {
		return this.endPoint.x;
	}
	get start(): number {
		return this.startPoint.x
	}

	constructor(options: ILandscapeLayerOptions) {
		this.roughness = options.roughness;
		this.points = options.points;
		this.heightMap = new Map();
		this.heightMap.set(this.points[0].x, this.points[0].y);
		this.color = options.color.hexString();
		this.hoverColor = options.hoverColor.hexString();
	
		for (let i = 1; i < options.points.length; ++i) {
			this.heightMap.set(this.points[i].x, this.points[i].y);
			this.generate(this.points[i - 1].x, this.points[i].x)
		}
		this.startPoint = this.points[0].copy();
		this.endPoint = this.points[this.points.length - 1].copy();
		this.gap = options.gap;

		this.prevPointIndex = this.points.length - 1;
		this.nextPointIndex = 0;
	}



	public increase(direction: number): void {
		if (direction > 0) {
			let nextPoint = this.points[this.nextPointIndex];
			const dx = this.nextPointIndex ?
				nextPoint.x - this.points[this.nextPointIndex - 1].x :
				this.gap;
			this.nextPointIndex = (this.nextPointIndex + 1) % this.points.length;
			let endX = this.endPoint.x + dx;
			this.heightMap.set(endX, nextPoint.y);
			this.generate(this.endPoint.x, endX);
			this.endPoint.x = endX;
			this.endPoint.y = nextPoint.y;
		} else if (direction < 0) {
			let prevPoint = this.points[this.prevPointIndex];
			const dx = this.prevPointIndex != this.points.length - 1 ?
				this.points[this.prevPointIndex + 1].x - prevPoint.x :
				this.gap;
			this.prevPointIndex = (this.points.length + this.prevPointIndex - 1) % this.points.length;
			let startX = this.startPoint.x - dx;
			this.heightMap.set(startX, prevPoint.y);
			this.generate(startX, this.startPoint.x);
			this.startPoint.x = startX;
			this.startPoint.y = prevPoint.y;
		}
	}

	public generate(start: number, end: number): void {
		if (start >= end - 1) {
			return;
		}
		const length = end - start;
		const mid = Math.floor((start + end + 1) / 2);
		const height = (this.heightMap.get(start) + this.heightMap.get(end)) / 2
			+ this.roughness * length * randomValue(-1, 1);
		this.heightMap.set(mid, height);
		this.generate(start, mid);
		this.generate(mid, end);
	}

	public draw(start: number, end: number, canvas: Canvas): void {
		canvas.beginPath();
		canvas.moveTo(0, 0);
		for (let i = start; i <= end; ++i) {
			const height = this.heightMap.get(i);
			canvas.lineTo(i - start, height);
			if (height === undefined) {
			}
		}
		canvas.lineTo(end - start, 0);
		canvas.lineTo(0, 0);
		canvas.fill(this._hover ? this.hoverColor : this.color);
	}

	public checkPoint(point: Vector): boolean {
		return point.x >= this.start &&
			point.x <= this.end &&
			point.y <= this.heightMap.get(point.x);
	}

}

let co = 0;

export interface ILandscapeOptions {
	layers: ILandscapeLayerOptions[];
	width: number;
	moveSpeed: number;
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

	constructor(options: ILandscapeOptions) {
		this.layers = [];
		this.width = options.width;
		this.screenSize = options.width;
		this.moveSpeed = options.moveSpeed;
		this.start = 0;
		this.end = 0;
		options.layers.forEach(layerOptions => {
			const layer = new LandscapeLayer(layerOptions);
			layer.increase(1);
			layer.increase(-1);
			this.layers.push(layer);
			this.end = Math.max(layer.end, this.end);
		});
	}
	public draw(canvas: Canvas): void {
		for (const layer of this.layers) {
			layer.draw(this.offset, this.offset + this.screenSize, canvas);
		}
	}

	public update() {
		if (this.moving) {
			this.translate(this.moving);
		}
	}

	public go(direction: number) {
		this.moving = Math.sign(direction) * this.moveSpeed;
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
	private getPointLayer(point: Vector): LandscapeLayer {
		for (let i = this.layers.length - 1; i >= 0; --i) {
			if (this.layers[i].checkPoint(point)) {
				return this.layers[i];
			}
		}
		return null;
	}
	public hoverLayer(point: Vector) {
		const layer = this.getPointLayer(point);
		if (this.hoveredLayer === layer) {
			return;
		}
		if (this.hoveredLayer) {
			this.hoveredLayer.hover = false;
		}
		if (layer) {
			layer.hover = true;
		}
		this.hoveredLayer = layer;
	}
	public removeHover() {
		if (this.hoveredLayer) {
			this.hoveredLayer.hover = false;
			this.hoveredLayer = null;
		}
	}
}