'use strict';
import "./index.html";
import './assets/styles/style.scss';

import Vector from './ts/vector';
import { Canvas, ICanvasOptions } from './ts/canvas';


const a = new Vector(20, 20);
const b = new Vector(200, 20);
const c = new Vector(120, 150);

function draw(canvas: Canvas) {
	canvas.clear();
	canvas.beginPath();
	canvas.line(a, b);
	canvas.lineTo(c);
	canvas.lineTo(a);
	canvas.fill();
}

function main() {
	const options: ICanvasOptions = {
		rootSelector: '#root',
		id: 'canvas',
		height: 600,
		width: 1200,
	};
	const canvas = new Canvas(options);
	canvas.scale = 2;
	draw(canvas);
}


main();