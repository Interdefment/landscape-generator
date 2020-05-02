'use strict';
import "./index.html";
import './assets/styles/style.scss';

import Vector from './ts/vector';
import { Canvas, ICanvasOptions } from './ts/canvas';
import * as LSG from './ts/landscapeGenerator';
import * as utils from './ts/utils';
import { layersOptions } from './ts/data';
import RGBColor from './ts/rgbcolor';


function render(canvas: Canvas, landscape: LSG.Landscape) {
	canvas.clear();
	canvas.fillCirlce(new Vector(50, 500), 30, 'rgb(255, 255, 255)')
	landscape.draw(canvas);
}

function main() {
	const canvasOptions: ICanvasOptions = {
		rootSelector: '#root',
		id: 'canvas',
		height: 600,
		width: 1200,
		backgroundColor: '#f0cba3'
	};

	const canvas = new Canvas(canvasOptions);
	const landscapeOptions: LSG.ILandscapeOptions = {
		layers: layersOptions,
		width: 1200,
		moveSpeed: 3,
	}
	const landscape = new LSG.Landscape(landscapeOptions);

	let moveScreen: NodeJS.Timeout = null;

	let cursorX: number = null;

	canvas.element.addEventListener('mousedown', function(e) {
		cursorX = e.clientX;
	});

	canvas.element.addEventListener('mouseup', function(e) {
		cursorX = null;
	});

	canvas.element.addEventListener('mouseleave', function(e) {
		cursorX = null;
		landscape.removeHover();
		render(canvas, landscape);
	});

	canvas.element.addEventListener('mousemove', function(e) {
		if (cursorX) {
			landscape.translate(cursorX - e.clientX);
			cursorX = e.clientX;
		}
		const cursor = landscape.getCursorPoint(e.clientX, e.clientY, canvas);
		landscape.hoverLayer(cursor);
		render(canvas, landscape);
	});

	document.addEventListener('keydown', function(e: KeyboardEvent) {
		if (moveScreen) {
			landscape.go(0);
			clearInterval(moveScreen);
			moveScreen = null;
			return;
		}
		if (e.keyCode == 39 && moveScreen === null) { // Right
			landscape.go(1);
			moveScreen = setInterval(function canvasTranslation() {
				landscape.update();
				render(canvas, landscape);
			}, 10);
		}
		if (e.keyCode == 37 && moveScreen === null) { // Left
			landscape.go(-1);
			moveScreen = setInterval(function canvasTranslation() {
				landscape.update();
				render(canvas, landscape);
			}, 1);
		}
	});

	document.addEventListener('keyup', function(e) {
		// if (moveScreen) {
		// 	landscape.go(0);
		// 	clearInterval(moveScreen);
		// 	moveScreen = null;
		// }
	});


	render(canvas, landscape);
}


main();