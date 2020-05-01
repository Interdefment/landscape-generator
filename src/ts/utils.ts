'use strict';

export function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj
}

export function getValue<T>(object: any, propertyName: string, defaultValue?: T): T {
	if (!object || !hasKey(object, propertyName)) {
			return defaultValue;
	}

	let propertyValue = <T>object[propertyName];
	if (propertyValue === undefined) {
			return defaultValue;
	}

	return propertyValue;
}

export function randomValue(min: number, max: number) {
	return min + Math.random() * (max - min);
}