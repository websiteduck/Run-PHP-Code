/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2014, Website Duck LLC (http://www.websiteduck.com)
 * @link       http://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
var themes = {
	light: [
		{title: 'Chrome',                theme: 'chrome'},
		{title: 'Clouds',                theme: 'clouds'},
		{title: 'Crimson Editor',        theme: 'crimson_editor'},
		{title: 'Dawn',                  theme: 'dawn'},
		{title: 'Dreamweaver',           theme: 'dreamweaver'},
		{title: 'Eclipse',               theme: 'eclipse'},
		{title: 'GitHub',                theme: 'github'},
		{title: 'IPlastic',              theme: 'iplastic'},
		{title: 'Katzenmilch',           theme: 'katzenmilch'},
		{title: 'Kuroir',                theme: 'kuroir'},
		{title: 'Solarized Light',       theme: 'solarized_light'},
		{title: 'SQL Server',            theme: 'sqlserver'},
		{title: 'TextMate',              theme: 'textmate'},
		{title: 'Tomorrow',              theme: 'tomorrow'},
		{title: 'XCode',                 theme: 'xcode'}
	],
	dark: [
		{title: 'Ambiance',              theme: 'ambiance'},
		{title: 'Chaos',                 theme: 'chaos'},
		{title: 'Clouds Midnight',       theme: 'clouds_midnight'},
		{title: 'Cobalt',                theme: 'cobalt'},
		{title: 'Idle Fingers',          theme: 'idle_fingers'},
		{title: 'krTheme',               theme: 'kr_theme'},
		{title: 'Merbivore',             theme: 'merbivore'},
		{title: 'Merbivore Soft',        theme: 'merbivore_soft'},
		{title: 'Monokai',               theme: 'monokai'},
		{title: 'Mono Industrial',       theme: 'mono_industrial'},
		{title: 'Pastel on dark',        theme: 'pastel_on_dark'},
		{title: 'Solarized Dark',        theme: 'solarized_dark'},
		{title: 'Terminal',              theme: 'terminal'},
		{title: 'Tomorrow Night',        theme: 'tomorrow_night'},
		{title: 'Tomorrow Night Blue',   theme: 'tomorrow_night_blue'},
		{title: 'Tomorrow Night Bright', theme: 'tomorrow_night_bright'},
		{title: 'Tomorrow Night 80s',    theme: 'tomorrow_night_eighties'},
		{title: 'Twilight',              theme: 'twilight'},
		{title: 'Vibrant Ink',           theme: 'vibrant_ink'}
	]
};

ko.bindingHandlers.my_checkbox = {
	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var observable = valueAccessor();
		$(element).click(function() {
			observable(!observable());
		});
	},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var observable = valueAccessor();
		var value = ko.unwrap(observable);
		var icon = 'fa-square-o';
		if (value) icon = 'fa-check-square-o';
		$(element).html('<i class="fa ' + icon + '"></i> ' + $('<div/>').text($(element).data('label')).html());
	}
};

ko.bindingHandlers.my_radio = {
	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var observable = valueAccessor();
		$(element).click(function() {
			observable($(element).data('value'));
		});
	},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var observable = valueAccessor();
		var value = ko.unwrap(observable);
		var icon = 'fa-circle-o';
		if (value === $(element).data('value')) icon = 'fa-circle';
		$(element).html('<i class="fa ' + icon + '"></i> ' + $('<div/>').text($(element).data('label')).html());
	}
};

//http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color
function shadeColor(color, percent) {   
	color = color.replace(/#/,'');
	var num = parseInt(color,16),
	amt = Math.round(2.55 * percent),
	R = (num >> 16) + amt,
	B = (num >> 8 & 0x00FF) + amt,
	G = (num & 0x0000FF) + amt;
	return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

$.cssHooks.backgroundColor = {
	get: function(elem) {
		if (elem.currentStyle)
			var bg = elem.currentStyle["backgroundColor"];
		else if (window.getComputedStyle)
				var bg = document.defaultView.getComputedStyle(elem, null).getPropertyValue("background-color");

		if (bg.search("rgb") == -1)
			return bg;
		else {
			bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
			return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
		}
	}
}

var View_Model = function() {
	var self = this;

	self.settings = {};
	self.settings.run_external    = ko.observable(false);
	self.settings.divide_x        = ko.observable($(window).width()/2);
	self.settings.colorize        = ko.observable(true);
	self.settings.theme           = ko.observable('twilight');
	self.settings.pre_wrap        = ko.observable(false);
	self.settings.error_reporting = ko.observable('fatal');

	self.themes = themes;
	self.light_theme         = ko.observable(true);
	self.resizing            = ko.observable(false);
	self.window_width        = ko.observable(0);
	self.result_width        = ko.observable(0);
	self.contributors_loaded = false;
	self.contributors        = ko.observableArray([]);

	self.code_width = ko.computed(function() {
		if (self.settings.run_external()) return self.window_width();
		else return self.settings.divide_x();
	});

	self.run = function() {
		$('input[name="runphp_data"]').val(
			JSON.stringify({
				'code':     self.editor.getValue(),
				'action':   'run',
				'settings': ko.toJS(self.settings),
				'bgcolor':  $('.ace_gutter').css('backgroundColor'),
				'color':    $('#code_div').css('color')
			})
		);
		$('#runphp_form').submit();
	};

	self.result_loaded = function() {
		if (self.settings.colorize()) {
			var bgcolor = $('.ace_gutter').css('backgroundColor'); //base a lot of colors off this one
			var color = $('#code_div').css('color');

			$('#result_frame').contents().find('html')
				.css('backgroundColor', shadeColor(bgcolor,-2))
				.css('color', color);
		}
		else {
			$('#result_frame').css('backgroundColor', '#fff');
		}
	};

	self.clear = function() {
		var answer = confirm("Are you sure you want to clear the editor?");
		if (answer) { self.reset_editor(); self.run(); }
	};

	self.php_info = function() {
		$('input[name="runphp_data"]').val(
			JSON.stringify({
				'code': '<' + '?php phpinfo();',
				'action': 'run',
				'settings': ko.toJS(self.settings),
				'bgcolor': $('.ace_gutter').css('backgroundColor'),
				'color': $('#code_div').css('color')
			})
		);
		$('#runphp_form').submit();
	};

	self.download_file = function() {
		var filename = prompt('Filename:');
		if (filename === null || filename === '') return;
		$('input[name="runphp_data"]').val(
			JSON.stringify({
				'code': self.editor.getValue(),
				'action': 'download',
				'filename': filename
			})
		);
		$('#runphp_form').submit();
	};

	self.remote_import = function() {
		function get_id_from_url(url) {
			var url_array = url.split('/');
			return url_array[url_array.length-1];
		}
	
		var code_url = prompt('Always make sure imported code is safe before running!!!\n\nSupported services: gist.GitHub.com, PasteBin.com, Pastie.org\n\nEnter URL:');
		if (code_url === null || code_url === '') return;
		code_id = get_id_from_url(code_url);
		self.editor.setValue('Loading code...');
		
		if (code_url.toLowerCase().indexOf('github.com') !== -1) {
			$.get('proxy.php', {url: 'https://api.github.com/gists/' + code_id}, function(data) {
				if (data.charAt(0) === '{') {
					data = $.parseJSON(data);
					var content = '';
					for (var i in data.files) content += data.files[i].content + '\n';
					self.set_editor_content(content);
				}
				else {
					self.set_editor_content(data);
				}
			}, 'text');
		}
		else if (code_url.toLowerCase().indexOf('pastebin.com') !== -1) {
			$.get('proxy.php', {url: 'http://pastebin.com/raw/' + code_id}, function(data) {
				self.set_editor_content(data);
			}, 'text');
		}
		else if (code_url.toLowerCase().indexOf('pastie.org') !== -1) {
			$.get('proxy.php', {url: 'http://pastie.org/pastes/' + code_id + '/download'}, function(data) {
				self.set_editor_content(data);
			}, 'text');
		}

	};

	self.load_settings = function() {
		var settings = {};
		if (localStorage.settings) settings = JSON.parse(localStorage.settings);
		for (key in settings) if (self.settings[key] !== undefined) self.settings[key](settings[key]);
		if (settings.divideX > $(window).width() - 10) self.settings.divideX($(window).width() / 2);
	};

	self.save_settings = function() {
		localStorage.settings = ko.toJSON(self.settings);
	};

	self.change_setting = function() {
		self.save_settings();
	}

	self.resize_window = function(width, height) {
		self.window_width(width);
		self.result_width((width - self.settings.divide_x()) - 4);
		self.editor.resize();
	};

	self.reset_editor = function() {
		self.editor.setValue("<?php\n\n");
		self.editor.gotoLine(3);
		self.editor.focus();
		window.onbeforeunload = null;
	};

	self.load_contributors = function() {
		if (self.contributors_loaded === false) {
			self.contributors_loaded = true;
			$.get('https://api.github.com/repos/websiteduck/Run-PHP-Code/contributors', function(data) {
				for (var i = 0; i < data.length; i++) {
					self.contributors.push({ url: data[i].html_url, avatar_url: data[i].avatar_url, login: data[i].login });
				}
			}, 'json');
		}
	};

	self.generate_theme_colors = function() {
		var bgcolor = $('.ace_gutter').css('backgroundColor'); //base a lot of colors off this one
		var color = $('#code_div').css('color');
		$('#title_bar')
			.css('background-color', bgcolor)
			.css('color', color);
			//.css('box-shadow', '0 0 10px ' + shadeColor(bgcolor,-40) + ' inset');
		$('.drop > div, .subdrop > div, #php_search_drop').css('box-shadow', '5px 5px 10px ' + shadeColor(bgcolor, -40));
		$('.drop div, .subdrop, .drop label').css('backgroundColor', bgcolor);
		$('.subdrop > div').css('border-top', '1px solid ' + shadeColor(bgcolor, -20));
		/*$('.drop').css('backgroundColor', bgcolor);*/
		$('.button')
			.css('backgroundColor', bgcolor)
			.css('border-color', shadeColor(bgcolor,-20))
			.css('box-shadow', '0px 1px 0px 0px ' + shadeColor(bgcolor,20) + ' inset')
			.css('color', color);
		$('#php_search').css('color', color);
		if (self.light_theme())	{
			$('#resize_bar').css('backgroundColor', shadeColor(bgcolor,-20));
			$('#php_search').css('border-color', shadeColor(bgcolor,-20)).css('backgroundColor', shadeColor(bgcolor,20));
		}
		else {
			$('#resize_bar').css('backgroundColor', shadeColor(bgcolor,20));
			$('#php_search').css('border-color', shadeColor(bgcolor,20)).css('backgroundColor', shadeColor(bgcolor,-20));
		}
		if (self.settings.colorize()) {
			$('#result_frame').css('backgroundColor', shadeColor(bgcolor,-2));
			$('#result_frame').contents().find('html')
				.css('backgroundColor', shadeColor(bgcolor,-2))
				.css('color', color);
		}
		else {
			$('#result_frame').css('backgroundColor', '#fff');
		}
		$('.hovered').each(function() {
			$(this).css('backgroundColor', shadeColor($(this).css('backgroundColor'),5));
		});
	}

	self.set_editor_content = function(content) {
		self.editor.setValue(content);
		self.editor.gotoLine(1);
		self.editor.focus();
	};

	self.load_settings();

	self.editor = ace.edit("code_div");
	self.editor.getSession().setMode("ace/mode/php");
	self.editor.setShowPrintMargin(false);
	self.editor.commands.addCommand({
		name: 'runCode',
		bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
		exec: function(editor) {
			self.run();
		}
	});
	self.editor.renderer.on('themeLoaded', function() {
		$(window).resize();
		$.each(self.themes.light, function(i, theme) {
			if (theme.theme === self.settings.theme()) self.light_theme(true);
		});
		$.each(self.themes.dark, function(i, theme) {
			if (theme.theme === self.settings.theme()) self.light_theme(false);
		});
		self.generate_theme_colors();
	});

	self.settings.theme.subscribe(function(theme) {
		self.editor.setTheme("ace/theme/" + theme);
	});
	self.editor.setTheme("ace/theme/" + self.settings.theme());

	self.reset_editor();

	window.onbeforeunload = null;
	self.editor.on('change', function() {
		if (window.onbeforeunload == null) {
			window.onbeforeunload = function() { return "You have made changes in your editor."; };
		}
	});

	$(window).resize(function() { self.resize_window($(this).width(), $(this).height()); }).resize();
	$('#php_search').search({language: 'en', limit: 30});
};

var vm;

$(function() {
	vm = new View_Model();
	ko.applyBindings(vm);

	var hide_menu_timeout = [];
	$('.drop').hover(function() {
		if (vm.light_theme()) $(this).css('backgroundColor', 'rgba(0,0,0,0.1)');
		else $(this).css('backgroundColor', 'rgba(255,255,255,0.1)');
		clearTimeout(hide_menu_timeout[$(this).uniqueId().attr('id')]);
		$('.drop div').css('z-index', '9997');
		$('> div', this).css('z-index', '9998').stop(true,true,true).slideDown(100);
	}, function() {
		$(this).css('backgroundColor', 'transparent');
		var self = this;
		hide_menu_timeout[$(this).uniqueId().attr('id')] = setTimeout(function() { $('> div', self).stop(true,true,true).slideUp(100); }, 300);
	});
	
	$('.subdrop').hover(function() {
		clearTimeout(hide_menu_timeout[$(this).uniqueId().attr('id')]);
		$('.subdrop').css('z-index', '9990');
		$(this).css('z-index', '9991');
		//Doing this instead of hide/show because of a bug in chrome that leaves part of the menu on the screen
		$('> div', this).css('left', '200px');
	}, function() {
		var self = this;
		hide_menu_timeout[$(this).uniqueId().attr('id')] = setTimeout(function() { $('> div', self).css('left', '-9999px'); }, 300);
	});

	$('#title_bar').on('mouseenter', '.drop > div > div, .subdrop > div > div, .drop label, .button', function() {
		$(this).addClass('hovered');
		if (vm.light_theme()) $(this).css('backgroundColor', 'rgba(0,0,0,0.1)');
		else $(this).css('backgroundColor', 'rgba(255,255,255,0.1)');
	});
	$('#title_bar').on('mouseleave', '.drop > div > div, .subdrop > div > div, .drop label, .button', function() {
		$(this).removeClass('hovered');
		$(this).css('backgroundColor', 'transparent');
	});

	var resizing = false;
	$(document).mousemove(function(e) {
		if (resizing === true) {
			var x = e.pageX;
			if (x < 100) x = 100;
			vm.settings.divide_x(x);
			$(window).resize();
		}
	});
	$('#resize_bar').mousedown(function(e) {
		if (vm.settings.run_external() === false) {
			resizing = true; 
			$('#result_frame').css('pointer-events', 'none');
			e.preventDefault();
		}
	});
	$('#resize_bar, body').mouseup(function(e) {
		if (resizing) {
			resizing = false;
			$('#result_frame').css('pointer-events', 'auto');
			vm.save_settings();
		}
	});

	$('#title_bar .drop, #title_bar button').click(function() { setTimeout(function() {vm.editor.focus();}, 50); });
});