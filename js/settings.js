var STORAGE_KEY = 'run-php-code'

export default {
	fetch: function () {
		let settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

		if (!settings.yeehaw) settings.yeehaw = '#ffff00';

		return settings;
	},
	save: function (settings) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}
}