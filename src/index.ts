'use strict';
import "./index.html";
import './assets/styles/style.scss';

import Vector from './ts/vector';
import { Canvas, ICanvasOptions } from './ts/canvas';
import * as landscape from './ts/landscapeGenerator';
import * as utils from './ts/utils';


const a = new Vector(20, 20);
const b = new Vector(200, 20);
const c = new Vector(120, 150);
let heights: number[] = [];


function main() {
	const canvasOptions: ICanvasOptions = {
		rootSelector: '#root',
		id: 'canvas',
		height: 600,
		width: 1200,
		backgroundColor: 'rgb(135, 206, 250)'
	};
	const layers: landscape.ILandscapeLayerOptions[] = [
		{
			roughness: 0.5,
			points: [ new Vector(0, 200),
				new Vector(300, utils.randomValue(500, 600)),
				new Vector(450, utils.randomValue(150, 250)),
				new Vector(600, utils.randomValue(50, 150)),
				new Vector(900, utils.randomValue(500, 600)),
				new Vector(1200, utils.randomValue(100, 500)),
			],
			color: '#466e9c',
		},
		{
			roughness: 0.04,
			points: [ new Vector(0, 100), new Vector(600, 50), new Vector(1200, 200),  ],
			color: '#00693e',
		},
	]
	const canvas = new Canvas(canvasOptions);
	const layer1 = new landscape.LandscapeLayer(layers[0]);
	const layer2 = new landscape.LandscapeLayer(layers[1]);
	layer1.draw(0, 1200, canvas);
	layer2.draw(0, 1200, canvas);
	canvas.fillCirlce(new Vector(50, 500), 30, 'rgb(255, 255, 115)')
}

document.addEventListener('keydown', function(e) {
	//right 39
	//left 37
	//up 38
	//down 40
})


main();