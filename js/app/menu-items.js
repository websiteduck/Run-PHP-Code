export default [
	{
		title: 'File', key: 'file',	submenu: [
			{ title: 'phpinfo()',        key: 'phpinfo' },
			{ title: 'Remote Import...', key: 'remote_import' },
			{ title: 'Download...',      key: 'download' }
		]
	},
	{
		title: 'Options', key: 'options', submenu: [
			{ title: 'Colorize',        key: 'colorize' },
			{ title: 'External Window', key: 'external_window' },
			{ title: '<pre> Wrap',      key: 'pre_wrap' },
		]
	},
	{
		title: 'Themes', key: 'themes',	submenu: [
			{ title: 'Light', key: 'light', submenu: [
				{title: 'Chrome',                key: 'chrome',          theme: 'chrome'},
				{title: 'Clouds',                key: 'clouds',          theme: 'clouds'},
				{title: 'Crimson Editor',        key: 'crimson_editor',  theme: 'crimson_editor'},
				{title: 'Dawn',                  key: 'dawn',            theme: 'dawn'},
				{title: 'Dreamweaver',           key: 'dreamweaver',     theme: 'dreamweaver'},
				{title: 'Eclipse',               key: 'eclipse',         theme: 'eclipse'},
				{title: 'GitHub',                key: 'github',          theme: 'github'},
				{title: 'IPlastic',              key: 'iplastic',        theme: 'iplastic'},
				{title: 'Katzenmilch',           key: 'katzenmilch',     theme: 'katzenmilch'},
				{title: 'Kuroir',                key: 'kuroir',          theme: 'kuroir'},
				{title: 'Solarized Light',       key: 'solarized_light', theme: 'solarized_light'},
				{title: 'SQL Server',            key: 'sqlserver',       theme: 'sqlserver'},
				{title: 'TextMate',              key: 'textmate',        theme: 'textmate'},
				{title: 'Tomorrow',              key: 'tomorrow',        theme: 'tomorrow'},
				{title: 'XCode',                 key: 'xcode',           theme: 'xcode'}
			]},
			{ title: 'Dark', key: 'dark', submenu: [
				{title: 'Ambiance',              key: 'ambiance',                theme: 'ambiance'},
				{title: 'Chaos',                 key: 'chaos',                   theme: 'chaos'},
				{title: 'Clouds Midnight',       key: 'clouds_midnight',         theme: 'clouds_midnight'},
				{title: 'Cobalt',                key: 'cobalt',                  theme: 'cobalt'},
				{title: 'Idle Fingers',          key: 'idle_fingers',            theme: 'idle_fingers'},
				{title: 'krTheme',               key: 'kr_theme',                theme: 'kr_theme'},
				{title: 'Merbivore',             key: 'merbivore',               theme: 'merbivore'},
				{title: 'Merbivore Soft',        key: 'merbivore_soft',          theme: 'merbivore_soft'},
				{title: 'Monokai',               key: 'monokai',                 theme: 'monokai'},
				{title: 'Mono Industrial',       key: 'mono_industrial',         theme: 'mono_industrial'},
				{title: 'Pastel on dark',        key: 'pastel_on_dark',          theme: 'pastel_on_dark'},
				{title: 'Solarized Dark',        key: 'solarized_dark',          theme: 'solarized_dark'},
				{title: 'Terminal',              key: 'terminal',                theme: 'terminal'},
				{title: 'Tomorrow Night',        key: 'tomorrow_night',          theme: 'tomorrow_night'},
				{title: 'Tomorrow Night Blue',   key: 'tomorrow_night_blue',     theme: 'tomorrow_night_blue'},
				{title: 'Tomorrow Night Bright', key: 'tomorrow_night_bright',   theme: 'tomorrow_night_bright'},
				{title: 'Tomorrow Night 80s',    key: 'tomorrow_night_eighties', theme: 'tomorrow_night_eighties'},
				{title: 'Twilight',              key: 'twilight',                theme: 'twilight'},
				{title: 'Vibrant Ink',           key: 'vibrant_ink',             theme: 'vibrant_ink'}
			]}
		]
	}
];