'use strict';
import "./index.html";
import './assets/styles/style.scss';

import Vector from './ts/vector';
import { Canvas, ICanvasOptions } from './ts/canvas';
import * as LSG from './ts/landscapeGenerator';
import * as utils from './ts/utils';
import { layersOptions } from './ts/data';
import RGBColor from './ts/rgbcolor';
import { Modal } from './ts/modal';


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
	width: canvasOptions.width,
	moveSpeed: 3,
	height: canvasOptions.height,
}
const landscape = new LSG.Landscape(landscapeOptions);

function render() {
	canvas.clear();
	canvas.fillCirlce(new Vector(50, 500), 30, 'rgb(255, 255, 255)');
	landscape.update();
	landscape.draw(canvas);
	requestAnimationFrame(render);
}

function main() {

	let cursor: Vector = new Vector();

	canvas.element.addEventListener('mousedown', function(e) {
		cursor.x = e.clientX;
		cursor.y = e.clientY;
		landscape.setDragMode(canvas, cursor);
	});

	canvas.element.addEventListener('click', function(e) {
		const cursor = landscape.getCursorPoint(e.clientX, e.clientY, canvas);
		if (e.ctrlKey) {
			landscape.setActiveLayer(cursor);
		}
		landscape.unsetDragMode();
	});

	canvas.element.addEventListener('mouseup', function(e) {
		landscape.unsetDragMode();
	});

	canvas.element.addEventListener('mouseleave', function(e) {
		landscape.removeHover();
		landscape.unsetDragMode();
	});

	canvas.element.addEventListener('dblclick', function(e) {
		if (e.ctrlKey) {
			return;
		}
		cursor.x = e.clientX;
		cursor.y = e.clientY;
		const result = landscape.doubleClick(cursor, canvas);
		if (result == 'delete') {
			canvas.setCursor('default');
		} else {
			canvas.setCursor('pointer');
			const landscapeCursor = landscape.getCursorPoint(e.clientX, e.clientY, canvas);
			const cursorPosition = landscape.mouseMove(landscapeCursor);
		}
	});
	canvas.element.addEventListener('mousemove', function(e) {
		const dx = cursor ? e.clientX - cursor.x : 0;
		const dy = cursor ? cursor.y - e.clientY : 0;
		const landscapeCursor = landscape.getCursorPoint(e.clientX, e.clientY, canvas);
		const cursorPosition = landscape.mouseMove(landscapeCursor);
		landscape.drag(landscapeCursor, dx, dy);

		cursor.x = e.clientX;
		cursor.y = e.clientY;
		if (cursorPosition == 'point') {
			canvas.setCursor('pointer');
		} else {
			canvas.setCursor('default');
		}
	});

	document.addEventListener('keydown', function(e: KeyboardEvent) {
		if (e.keyCode == 39) { // Right
			landscape.go(1);
		}
		if (e.keyCode == 37) { // Left
			landscape.go(-1);
		}
	});

	document.addEventListener('keyup', function(e) {
		
	});


	document.querySelector('.btn-new-layer').addEventListener('click', function(e) {
		landscape.createNewLayer();
	});

	document.querySelector('.btn-edit-layer').addEventListener('click', function(e) {
		landscape.editLayer();
	});

	document.querySelector('.btn-delete-layer').addEventListener('click', function(e) {
		landscape.deleteActiveLayer();
	});

	render();
}


main();