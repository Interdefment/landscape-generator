'use strict';
import Vector from './vector';
import * as utils from './utils';

export interface ICanvasOptions {
	rootSelector: string;
	id?: string;
	width?: number;
	height?: number;
	scale?: number;
	offset?: Vector;
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
}

const DeafultWidth = 800;
const DeafultHeight = 400;
const DeafultId = '';
const DeafultScale = 1;
const DefaultOffset = new Vector();
const DefaultBackgroundColor = 'rgb(255, 255, 255)';
const DefaultBorderColor = 'rgb(0, 0, 0)';
const DefaultBorderWidth = 2;

export class Canvas {
	private $rootElement: HTMLElement;
	private $element: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private _scale: number;
	private _offset: Vector;

	private width: number;
	private height: number;

	private _backgroundColor: string;
	private _borderColor: string;
	private _borderWidth: number;


	constructor(options: ICanvasOptions) {
		this.$rootElement = document.querySelector(options.rootSelector);

		this.width = utils.getValue<number>(options, 'width', DeafultWidth);
		this.height = utils.getValue<number>(options, 'height', DeafultHeight);
		this._scale = utils.getValue<number>(options, 'scale', DeafultScale);
		this._offset = utils.getValue<Vector>(options, 'scale', DefaultOffset);
		this._backgroundColor = utils.getValue<string>(options, 'backgroundColor', DefaultBackgroundColor);
		this._borderColor = utils.getValue<string>(options, 'borderColor', DefaultBorderColor);
		this._borderWidth = utils.getValue<number>(options, 'borderWidth', DefaultBorderWidth);

		this.createElement(options);
		this.ctx = this.$element.getContext('2d');
	}

	private createElement(options: ICanvasOptions) {
		this.$element = document.createElement('canvas');
		this.$element.width = this.width;
		this.$element.height = this.height;
		this.$element.id = utils.getValue<string>(options, 'id', DeafultId);
		this.$rootElement.appendChild(this.$element);
	}

	public scaleValue(value: number): number {
		return value * this._scale;
	}

	public scaleVector(v: Vector): Vector {
		return new Vector(v.x * this._scale, v.y * this._scale);
	}

	public clear(): void {
		this.ctx.fillStyle = this._backgroundColor;
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.ctx.strokeStyle = this._borderColor;
		this.ctx.lineWidth = this._borderWidth;
		this.ctx.strokeRect(0, 0, this.width, this.height);
	}

	private getX(point: Vector): number {
		return this._offset.x + this._scale * point.x;
	}
	private getY(point: Vector): number {
		return this._offset.y + this._scale * point.y;
	}

	public line(p1: Vector, p2: Vector): void {
		if (!this.checkPoint(p1) && this.checkPoint(p2)) {
			return;
		}
		this.ctx.moveTo(this.getX(p1), this.getY(p1));
		this.ctx.lineTo(this.getX(p2), this.getY(p2));
	}
	public moveTo(point: Vector): void {
		this.ctx.moveTo(this.getX(point), this.getY(point));
	}
	public lineTo(point: Vector): void {
		this.ctx.lineTo(this.getX(point), this.getY(point));
	}
	public beginPath(): void {
		this.ctx.beginPath();
	}
	public fill(color: string = DefaultBorderColor): void {
		this.ctx.fillStyle = color;
		this.ctx.fill();
	}
	public stroke(color: string = DefaultBorderColor): void {
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
	}
	public checkPoint(point: Vector): boolean {
		return point.x >= 0 && point.x <= this.width
			&& point.y >= 0 && point.y <= this.height;
	}
	set scale(value: number) {
		this._scale = value;
	}
	get scale() {
		return this._scale;
	}
}