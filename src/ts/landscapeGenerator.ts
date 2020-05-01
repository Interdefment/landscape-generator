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
}

export interface ILandscapeOptions {
	layers: number;
}

export class LandscapeLayer {
	private roughness: number;
	private heightMap: number[];
	private points: Vector[];

	private color: string;

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
			canvas.lineTo(i, this.heightMap[i]);
			if (this.heightMap[i] === undefined) {
			}
		}
		canvas.lineTo(end, 0);
		canvas.lineTo(0, 0);
		canvas.fill(this.color);
	}
}
