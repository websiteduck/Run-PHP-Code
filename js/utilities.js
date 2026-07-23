// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color
// https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
export function adjustColor(color, percent) {
	if (/^#[0-9A-F]{6}$/i.test(color) === false) {
		let match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/);
		
		if (!match) {
			return color;
		}

		color = `#${match.slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`
	}

	color = color.replace(/#/, '');
	let num = parseInt(color, 16);
	let amt = Math.round(2.55 * percent);
	let R = (num >> 16) + amt;
	let B = (num >> 8 & 0x00FF) + amt;
	let G = (num & 0x0000FF) + amt;

	return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

export function useLocalStorage(key, defaults) {
	let value = { ...defaults };

	try {
		let stored = localStorage.getItem(key);
		if (stored !== null) {
			let parsed = JSON.parse(stored);
			value = { ...defaults, ...parsed };

			if (parsed.outputMode == null && parsed.preWrap) {
				value.outputMode = 'console';
			}

			delete value.preWrap;
		}
	} catch (e) {
		//
	}

	let data = Vue.ref(value);

	Vue.watch(data, (current) => {
		let toStore = { ...current };
		delete toStore.preWrap;
		localStorage.setItem(key, JSON.stringify(toStore));
	}, { deep: true });

	return data;
}
