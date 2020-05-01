'use strict';

export default class Vector {
	private _x: number;
	private _y: number;
	private _angle: number;
	private _length: number;

	constructor(x: number = 0, y: number = 0) {
		this._x = x;
		this._y = y;
	}

	get length(): number {
		return this._length;
	}
	set length(value) {
		this._length = value;
		this.updateDecarts();
	}
	get angle(): number {
		return this._angle;
	}
	set angle(value) {
		this._angle = value;
		this.updateDecarts();
	}

	get x() {
		return this._x;
	}
	set x(value: number) {
		this._x = value;
		this.updatePolars();
	}
	public addX(value: number): Vector {
		this._x += value;
		return this;
	}
	get y() {
		return this._y;
	}
	set y(value: number) {
		this._y = value;
		this.updatePolars();
	}
	public addY(value: number): Vector {
		this._y += value;
		return this;
	}

	get length2(): number {
		return this._x * this._x + this._y * this._y;
	}

	public increase(multiplier: number): Vector {
		this._x *= multiplier;
		this._y *= multiplier;
		return this;
	}

	public add(other: Vector): Vector {
		return new Vector(this._x + other.x, this._y + other.y);
	}

	public subtract(other: Vector): Vector {
		return new Vector(this._x - other.x, this._y - other.y);
	}

	public multiply(other: Vector): number {
		return this._x * other.x + this._y * other.y;
	}

	public copy(): Vector {
		return new Vector(this._x, this._y);
	}

	private updateDecarts() {
		this._x = Math.cos(this._angle) * this._length;
		this._y = Math.sin(this._angle) * this._length;
	}

	private updatePolars() {
		this._angle = Math.atan2(this._y, this._x);
		this._length = Math.sqrt(this.length2);
	}

	public static getMidPoint(v1: Vector, v2: Vector): Vector {
		return new Vector((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
	}
}