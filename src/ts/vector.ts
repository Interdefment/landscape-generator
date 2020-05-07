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
	/**
	 * Increases X value and returns same object
	 */
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
	/**
	 * Increases Y value and returns same object
	 */
	public addY(value: number): Vector {
		this._y += value;
		return this;
	}
	/**
	 * return squared length
	 */
	get length2(): number {
		return this._x * this._x + this._y * this._y;
	}

	/**
	 * Multiplies both coordinates by given value
	 */
	public increase(multiplier: number): Vector {
		this._x *= multiplier;
		this._y *= multiplier;
		return this;
	}

	/**
	 * Returns sum of two vectors as new object
	 */
	public add(other: Vector): Vector {
		return new Vector(this._x + other.x, this._y + other.y);
	}

	/**
	 * Returns difference of two vectors as new object
	 */
	public subtract(other: Vector): Vector {
		return new Vector(this._x - other.x, this._y - other.y);
	}

	/**
	 * Returns scalar product
	 */
	public multiply(other: Vector): number {
		return this._x * other.x + this._y * other.y;
	}

	/**
	 * Returns copy as new object
	 */
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

	public static distance(v1: Vector, v2: Vector) {
		return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
	}

	public static distance2(v1: Vector, v2: Vector) {
		return (v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y);
	}

	public static getMidPoint(v1: Vector, v2: Vector): Vector {
		return new Vector((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
	}

	public static swap(v1: Vector, v2: Vector) {
		[ v1._x, v2._x ] = [ v2._x, v1._x ];
		[ v1.y, v2.y ] = [ v2.y, v1.y ];
	}
}