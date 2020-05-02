'use strict';
import * as utils from './utils';
import Vector from './vector';
import { ILandscapeLayerOptions } from './landscapeGenerator';
import RGBColor from './rgbcolor';

export const layersOptions: ILandscapeLayerOptions[] = [
	{
		roughness: 1,
		points: [
			new Vector(0, utils.randomValue(100, 600)),
			new Vector(1200, utils.randomValue(100, 500)),
		],
		// color: '#466e9c',
		color: RGBColor.parseString('#466e9c'),
		hoverColor: RGBColor.parseString('#466e9c').add(30),
		gap: 300,
	},
	{
		roughness: 0.7,
		points: [
			new Vector(0, 200),
			new Vector(300, utils.randomValue(300, 500)),
			new Vector(450, utils.randomValue(150, 250)),
			new Vector(600, utils.randomValue(50, 150)),
			new Vector(900, utils.randomValue(500, 600)),
			new Vector(1200, utils.randomValue(100, 500)),
		],
		// color: '#321414',
		color: RGBColor.parseString('#321414'),
		hoverColor: RGBColor.parseString('#321414').add(30),
		gap: 300,
	},
	{
		roughness: 0.26,
		points: [
			new Vector(0, 200),
			new Vector(300, utils.randomValue(100, 200)),
			new Vector(550, utils.randomValue(120, 200)),
			new Vector(600, utils.randomValue(80, 160)),
			new Vector(900, utils.randomValue(200, 300)),
			new Vector(1200, utils.randomValue(100, 300)),
		],
		// color: '#594630',
		color: RGBColor.parseString('#594630'),
		hoverColor: RGBColor.parseString('#594630').add(30),
		gap: 300,
	},
	{
		roughness: 0.04,
		points: [ new Vector(0, 100), new Vector(600, 50), new Vector(1200, 100),  ],
		// color: '#00693e',
		color: RGBColor.parseString('#00693e'),
		hoverColor: RGBColor.parseString('#00693e').add(30),
		gap: 300,
	},
]