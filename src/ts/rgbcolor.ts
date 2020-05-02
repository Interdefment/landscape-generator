'use strict';

export default class RGBColor {
	private r: number;
	private g: number;
	private b: number;
	private alpha: number;
	constructor(
		r: number,
		g: number,
		b: number,
		alpha: number = 1
	) {
		this.R = r;
		this.G = g;
		this.B = b;
		this.A = alpha;
	}
	public hexString(): string {
		return '#' + this.r.toString(16).padStart(2, '0') +
			this.g.toString(16).padStart(2, '0') +
			this.b.toString(16).padStart(2, '0');
	}
	public rgbString(): string {
		return `rgb(${this.r}, ${this.g}, ${this.b},)`;
	}
	public rgbaString(): string {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
	}

	get R(): number {
		return this.r;
	}
	set R(value: number) {
		this.r = this.correctValue(value);
	}
	get G(): number {
		return this.g;
	}
	set G(value: number) {
		this.g = this.correctValue(value);
	}
	get B(): number {
		return this.b;
	}
	set B(value: number) {
		this.b = this.correctValue(value);
	}
	get A(): number {
		return this.alpha;
	}
	set A(value: number) {
		if (value < 0) {
			this.alpha = 0
		} else if (value > 1) {
			this.alpha = 1;
		} else {
			this.alpha = value;
		}
	}

	private correctValue(value: number): number {
		if (value < 0) {
			value = 0;
		}
		if (value > 255) {
			value = 255;
		}
		return Math.floor(value);
	}

	public multiply(value: number): RGBColor {
		return new RGBColor(this.r * value, this.g * value, this.b * value, this.alpha);
	}

	public add(value: number): RGBColor {
		return new RGBColor(this.r + value, this.g + value, this.b + value, this.alpha);
	}

	public static parseString(str: string): RGBColor {
		str = str.trim();
		if (str.indexOf('#') === 0) {
			let hexMatch = str.match(/^#([0-9a-f]{3})$/i);
			if (hexMatch) {
				return new RGBColor(
					parseInt(hexMatch[1].charAt(0), 16),
					parseInt(hexMatch[1].charAt(1), 16),
					parseInt(hexMatch[1].charAt(2), 16)
				);
			}
			hexMatch = str.match(/^#([0-9a-f]{6})$/i);
			if (hexMatch) {
				return new RGBColor(
					parseInt(hexMatch[1].substr(0, 2), 16),
					parseInt(hexMatch[1].substr(2, 2), 16),
					parseInt(hexMatch[1].substr(4, 2), 16),
				);
			}
		}
		let rgbMatches = str.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
		if (rgbMatches) {
			return new RGBColor(+rgbMatches[1], +rgbMatches[2], +rgbMatches[3]);
		}
		throw new Error('Invalid color string format');
	}
}