'use strict';
import Vector from './vector';
import { Canvas } from './canvas';
import { randomValue } from './utils';

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
	color: string;
	gap: number;
}

export class LandscapeLayer {
	private roughness: number;
	private heightMap: number[];
	private points: Vector[];

	private color: string;

	private shiftIndex: number = 0;
	private gap: number;
	private endPoint: Vector;

	get width(): number {
		return this.endPoint.x;
	}

	constructor(options: ILandscapeLayerOptions) {
		this.roughness = options.roughness;
		this.points = options.points;
		this.heightMap = [];
		this.heightMap[this.points[0].x] = this.points[0].y;
		this.color = options.color;
		for (let i = 1; i < options.points.length; ++i) {
			this.heightMap[this.points[i].x] = this.points[i].y;
			this.generate(this.points[i - 1].x, this.points[i].x)
		}
		this.endPoint = this.points[this.points.length - 1].copy();
		this.gap = options.gap;
	}

	public increase() {
		let nextPoint = this.points[this.shiftIndex];
		const dx = this.shiftIndex ?
			nextPoint.x - this.points[this.shiftIndex - 1].x :
			this.gap;
		this.shiftIndex = (this.shiftIndex + 1) % this.points.length;
		let endX = this.endPoint.x + dx;
		this.heightMap[endX] = nextPoint.y;
		this.generate(this.endPoint.x, endX);
		this.endPoint.x = endX;
		this.endPoint.y = nextPoint.y;
	}

	public generate(start: number, end: number) {
		if (start >= end - 1) {
			return;
		}
		const length = end - start;
		const mid = Math.floor((start + end + 1) / 2);
		const height = (this.heightMap[start] + this.heightMap[end]) / 2
			+ this.roughness * length * randomValue(-1, 1);
		this.heightMap[mid] = height;
		this.generate(start, mid);
		this.generate(mid, end);
	}

	public draw(start: number, end: number, canvas: Canvas) {
		canvas.beginPath();
		canvas.moveTo(0, 0);
		for (let i = start; i <= end; ++i) {
			canvas.lineTo(i - start, this.heightMap[i]);
			if (this.heightMap[i] === undefined) {
			}
		}
		canvas.lineTo(end - start, 0);
		canvas.lineTo(0, 0);
		canvas.fill(this.color);
	}
}
let co = 0;
export interface ILandscapeOptions {
	layers: ILandscapeLayerOptions[];
	width: number;
}

export class Landscape {
	private layers: LandscapeLayer[];
	private width: number;
	private screenSize: number;
	private offset: number = 0;

	constructor(options: ILandscapeOptions) {
		this.layers = [];
		this.width = options.width;
		this.screenSize = options.width;
		options.layers.forEach(layerOptions => {
			this.layers.push(new LandscapeLayer(layerOptions));
		});
	}
	public draw(canvas: Canvas) {
		for (const layer of this.layers) {
			layer.draw(this.offset, this.offset + this.screenSize, canvas);
		}
	}
	public translate(value: number) {
		if (this.offset > 0 || value > 0) {
			this.offset += value;
		}
		if (this.offset + this.screenSize > this.width) {
			this.width = this.offset + this.screenSize;
			for (const layer of this.layers) {
				while (this.width > layer.width) {
					layer.increase();
				}
			}
		}
	}
}