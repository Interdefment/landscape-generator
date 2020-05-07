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


export function binary_search<T>(data: T[], comparator: (val: T) => boolean): number {
	let l = 0;
	let r = data.length;
	while (l < r) {
		const mid = Math.floor(l + (r - l) / 2);
		if (comparator(data[mid])) {
			r = mid;
		} else {
			l = mid + 1;
		}
	}
	return l;
}