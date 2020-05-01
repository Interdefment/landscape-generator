'use strict';
import "./index.html";
import './assets/styles/style.scss';

import Vector from './ts/vector';
import { Canvas, ICanvasOptions } from './ts/canvas';
import * as LSG from './ts/landscapeGenerator';
import * as utils from './ts/utils';




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
	const layersOptions: LSG.ILandscapeLayerOptions[] = [
		{
			roughness: 1,
			points: [
				new Vector(0, utils.randomValue(100, 600)),
				new Vector(1200, utils.randomValue(100, 500)),
			],
			color: '#466e9c',
			gap: 300,
		},
		{
			roughness: 0.7,
			points: [
				new Vector(0, 200),
				new Vector(300, utils.randomValue(500, 600)),
				new Vector(450, utils.randomValue(150, 250)),
				new Vector(600, utils.randomValue(50, 150)),
				new Vector(900, utils.randomValue(500, 600)),
				new Vector(1200, utils.randomValue(100, 500)),
			],
			color: '#321414',
			gap: 300,
		},
		{
			roughness: 0.5,
			points: [
				new Vector(0, 200),
				new Vector(300, utils.randomValue(100, 300)),
				new Vector(550, utils.randomValue(150, 240)),
				new Vector(600, utils.randomValue(80, 120)),
				new Vector(900, utils.randomValue(200, 300)),
				new Vector(1200, utils.randomValue(100, 300)),
			],
			color: '#594630',
			gap: 300,
		},
		{
			roughness: 0.04,
			points: [ new Vector(0, 100), new Vector(600, 50), new Vector(1200, 100),  ],
			color: '#00693e',
			gap: 300,
		},
	]
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
		render(canvas, landscape);
	}

	canvas.element.addEventListener('mousedown', function(e) {
		cursorX = e.clientX;
	});

	canvas.element.addEventListener('mouseup', function(e) {
		cursorX = null;
	});

	canvas.element.addEventListener('mouseleave', function(e) {
		cursorX = null;
	});

	canvas.element.addEventListener('mousemove', function(e) {
		if (cursorX) {
			translateScreen(cursorX - e.clientX);
			cursorX = e.clientX;
		}
	});

	document.addEventListener('keydown', function(e: KeyboardEvent) {
		if (e.keyCode == 39 && moveScreen === null) { // Right
			moveScreen = setInterval(function canvasTranslation() {
				translateScreen(translateSpeed);
			}, 10);
		}
		if (e.keyCode == 37 && moveScreen === null && offsetX > 0) { // Left
			moveScreen = setInterval(function canvasTranslation() {
				if (offsetX <= 0) {
					clearInterval(moveScreen);
				}
				translateScreen(-translateSpeed);
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