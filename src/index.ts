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
	canvas.fillCirlce(new Vector(50, 500), 30, 'rgb(255, 255, 115)')
	landscape.draw(canvas);
}

function main() {
	const canvasOptions: ICanvasOptions = {
		rootSelector: '#root',
		id: 'canvas',
		height: 600,
		width: 1200,
		backgroundColor: 'rgb(135, 206, 250)'
	};

	const canvas = new Canvas(canvasOptions);
	const landscapeOptions: LSG.ILandscapeOptions = {
		layers: layersOptions,
		width: 1200,
	}
	const landscape = new LSG.Landscape(landscapeOptions);

	let moveScreen: NodeJS.Timeout = null;
	let offsetX: number = 0;


	const translateSpeed = 2;
	let cursorX: number = null;

	const translateScreen = (value: number) => {
		if (value < 0 && offsetX < -value) {
			value = offsetX;
		}
		if (value == 0) {
			return;
		}
		landscape.translate(value);
		offsetX += value;
	}

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
			translateScreen(cursorX - e.clientX);
			cursorX = e.clientX;
		}
		const cursor = canvas.getCursorVector(e.clientX, e.clientY, offsetX);
		landscape.hoverLayer(cursor);
		render(canvas, landscape);
	});

	document.addEventListener('keydown', function(e: KeyboardEvent) {
		if (e.keyCode == 39 && moveScreen === null) { // Right
			moveScreen = setInterval(function canvasTranslation() {
				translateScreen(translateSpeed);
				render(canvas, landscape);
			}, 10);
		}
		if (e.keyCode == 37 && moveScreen === null && offsetX > 0) { // Left
			moveScreen = setInterval(function canvasTranslation() {
				if (offsetX <= 0) {
					clearInterval(moveScreen);
				}
				translateScreen(-translateSpeed);
				render(canvas, landscape);
			}, 1);
		}
	});

	document.addEventListener('keyup', function(e) {
		if (moveScreen) {
			clearInterval(moveScreen);
			moveScreen = null;
		}
	});


	render(canvas, landscape);
}


main();