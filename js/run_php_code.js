/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2012, Website Duck LLC (http://www.websiteduck.com)
 * @link       http://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

var rpc = {

	loadSettings: function() {
		rpc.settings = {};
		if (localStorage.settings) rpc.settings = JSON.parse(localStorage.settings);
		
		//Default Settings
		if (rpc.settings.runExternal === undefined) rpc.settings.runExternal = false;
		if (rpc.settings.divideX === undefined || rpc.settings.divideX > $(window).width() - 10) rpc.settings.divideX = $(window).width() / 2;
		if (rpc.settings.colorize === undefined) rpc.settings.colorize = true;
		if (rpc.settings.theme === undefined) rpc.settings.theme = "twilight";
		if (rpc.settings.preWrap === undefined) rpc.settings.preWrap = false;
		if (rpc.settings.errorReporting === undefined) rpc.settings.errorReporting = 'fatal';			
	},

	saveSettings: function() {
		localStorage.settings = JSON.stringify(rpc.settings);
	},

	menu: {

		runExternal: function(runExternal, saveSettings) {
	    if (runExternal) {
				rpc.settings.runExternal = true;
				$('#result_div').hide();
				$('#resize_bar').hide();
				$('#run_php_form').prop('target', 'result_external');
			}
			else {
				rpc.settings.runExternal = false;
				$('#result_div').show();
				$('#resize_bar').show();
				$('#run_php_form').prop('target', 'result_frame');
			}
			$(window).resize();
			if (saveSettings) rpc.saveSettings();			
		},

		colorize: function(colorize, saveSettings) {
			rpc.settings.colorize = colorize;
			if (saveSettings) rpc.saveSettings();
		},

		theme: function(theme, saveSettings) {
			rpc.settings.theme = theme;
			rpc.editor.setTheme("ace/theme/" + rpc.settings.theme);
			if (saveSettings) rpc.saveSettings();			
		},

		preWrap: function(preWrap, saveSettings) {
			rpc.settings.preWrap = preWrap;
			if (saveSettings) rpc.saveSettings();
		},

		errorReporting: function(errorReporting, saveSettings) {
			rpc.settings.errorReporting = errorReporting;
			if (saveSettings) rpc.saveSettings();
		}

	},

	resizeWindow: function(width, height) {
		if (rpc.settings.runExternal) {
			$('#code_div').width(width);
		}
		else {
			$('#code_div').width(rpc.settings.divideX - 2);
			$('#resize_bar').css('left', rpc.settings.divideX - 2 + 'px');
			$('#result_div').width((width - rpc.settings.divideX) - 2);
		}
		rpc.editor.resize();
	},

	resetEditor: function() {
		rpc.editor.setValue("<?php\n\n");
		rpc.editor.gotoLine(3);
		rpc.editor.focus();
		window.onbeforeunload = null;
	},

	setEditorContent: function(content) {
		rpc.editor.setValue(content);
		rpc.editor.gotoLine(1);
		rpc.editor.focus();
	},

	runCode: function() {
		$('input[name="phprun_action"]').val('run');
		$('#run_php_form').submit();
	}

};

window.onbeforeunload = null;

$(function() {

	rpc.loadSettings();

	//Create ACE Editor
	rpc.editor = ace.edit("code_div");
	rpc.editor.getSession().setMode("ace/mode/php");
	rpc.editor.setShowPrintMargin(false);
	rpc.editor.commands.addCommand({
		name: 'runCode',
		bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
		exec: function(editor) {
			rpc.runCode();
		}
	});

	//Set up menu elements
	var $mnuExternalWindow = $('#mnu_external_window');
	var $mnuColorize = $('#mnu_colorize');
	var $mnuPreWrap = $('#mnu_pre_wrap');

	if (rpc.settings.runExternal === true) $mnuExternalWindow.prop('checked', true);
	if (rpc.settings.colorize === true) $mnuColorize.prop('checked', true);
	if (rpc.settings.preWrap === true) $mnuPreWrap.prop('checked', true);
	$('input[name="theme"][value="' + rpc.settings.theme + '"]').prop('checked', true);
	$('input[name="error_reporting"][value="' + rpc.settings.errorReporting + '"]').prop('checked', true);

	var $mnuTheme = $('input[name="theme"]'); 
	var $mnuThemeSelected = $mnuTheme.filter(':checked');
	var $mnuErrorReporting = $('input[name="error_reporting"]'); 
	var $mnuErrorReportingSelected = $mnuErrorReporting.filter(':checked');

	$mnuExternalWindow.change(function() { rpc.menu.runExternal(this.checked, true); });
	rpc.menu.runExternal($mnuExternalWindow.get(0).checked, false);

	$mnuColorize.change(function() { rpc.menu.colorize(this.checked, true); });
	rpc.menu.colorize($mnuColorize.get(0).checked, false);

	$mnuTheme.change(function() { rpc.menu.theme(this.value, true); });
	rpc.menu.theme($mnuThemeSelected.get(0).value, false);

	$mnuPreWrap.change(function() { rpc.menu.preWrap(this.checked, true); });
	rpc.menu.preWrap($mnuPreWrap.get(0).checked, false);

	$mnuErrorReporting.change(function() { rpc.menu.errorReporting(this.value, true); });
	rpc.menu.errorReporting($mnuErrorReportingSelected.get(0).value, false);

	rpc.editor.on('change', function() {
		if (window.onbeforeunload == null) {
			window.onbeforeunload = function() {
				return "You have made changes in your editor.";
			}
		}
	});
		
	$('#btn_reset').click(function() {
		var answer = confirm("Are you sure you want to clear the editor?");
		if (answer) { rpc.resetEditor(); rpc.runCode(); }
	});
	
	$('#btn_run').click(function() { rpc.runCode(); });

	rpc.editor.renderer.on('themeLoaded', function() {
		var bgcolor = $('.ace_gutter').css('backgroundColor'); //base a lot of colors off this one
		var color = $('#code_div').css('color');
		$('#title_bar')
			.css('background-color', bgcolor)
			.css('color', color)
			.css('box-shadow', '0 0 10px ' + shadeColor(bgcolor,-40) + ' inset');
		$('.drop > div, .subdrop > div').css('box-shadow', '5px 5px 10px ' + shadeColor(bgcolor, -40));
		$('.drop div, .subdrop, .drop label').css('backgroundColor', bgcolor);
		$('.subdrop > div').css('border-top', '1px solid ' + shadeColor(bgcolor, -20));
		$('.drop')
			.css('backgroundColor', bgcolor)
			.css('box-shadow', '0 10px 10px -10px ' + shadeColor(bgcolor, -40) + ' inset, 0px -10px 10px -10px ' + shadeColor(bgcolor, -40) + ' inset');
		$('.button')
			.css('backgroundColor', bgcolor)
			.css('border-color', shadeColor(bgcolor,-20))
			.css('box-shadow', '0px 1px 0px 0px ' + shadeColor(bgcolor,20) + ' inset')
			.css('color', color);
		$('#resize_bar').css('backgroundColor', shadeColor(bgcolor,-20));
		if (rpc.settings.colorize) {
			$('#result_frame').css('backgroundColor', shadeColor(bgcolor,-2));
			$('#result_frame').contents().find('html')
				.css('backgroundColor', shadeColor(bgcolor,-2))
				.css('color', color);
		}
		$('.hovered').each(function() {
			$(this).css('backgroundColor', shadeColor($(this).css('backgroundColor'),5));
		});
	});
	$('#result_frame').load(function() { 
		if (rpc.settings.colorize) {
			var bgcolor = $('.ace_gutter').css('backgroundColor'); //base a lot of colors off this one
			var color = $('#code_div').css('color');

			$('#result_frame').contents().find('html')
				.css('backgroundColor', shadeColor(bgcolor,-2))
				.css('color', color);
			}
	});
	
	$(window).resize(function() { rpc.resizeWindow($(this).width(), $(this).height()); }).resize();
	
	var resizing = false;
	$(document).mousemove(function(e) {
		if (resizing === true) {
			var x = e.pageX;
			if (x < 100) x = 100;
			rpc.settings.divideX = x;
			$(window).resize();
		}
	});
	$('#resize_bar').mousedown(function(e) {
		if (rpc.settings.runExternal === false) {
			resizing = true; 
			$('#result_frame').css('pointer-events', 'none');
			e.preventDefault();
		}
	}).mouseup(function(e) {
		if (resizing) {
			resizing = false;
			$('#result_frame').css('pointer-events', 'auto');
			rpc.saveSettings();
		}
	});
		
	var hide_menu_timeout = [];
	$('.drop').hover(function() {
		clearTimeout(hide_menu_timeout[$(this).uniqueId().attr('id')]);
		$('.drop div').css('z-index', '9997');
		$('> div', this).css('z-index', '9998').stop(true,true,true).slideDown(100);
	}, function() {
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

	$('.drop, .subdrop, .drop label, .button').hover(function() {
		$(this).addClass('hovered');
		$(this).css('backgroundColor', shadeColor($(this).css('backgroundColor'), 5));
	}, function() {
		$(this).removeClass('hovered');
		$(this).css('backgroundColor', shadeColor($(this).css('backgroundColor'), -5));
	});

	function get_id_from_url(url) {
		var url_array = url.split('/');
		return url_array[url_array.length-1];
	}
	
	$('#btn_import').click(function() {
		var code_url = prompt('Always make sure imported code is safe before running!!!\n\nSupported services: gist.GitHub.com, PasteBin.com, Pastie.org\n\nEnter URL:');
		if (code_url === null || code_url === '') return;
		code_id = get_id_from_url(code_url);
		rpc.editor.setValue('Loading code...');
		
		if (code_url.toLowerCase().indexOf('github.com') !== -1) {
			$.get('proxy.php', {url: 'https://api.github.com/gists/' + code_id}, function(data) {
				if (data.charAt(0) === '{') {
					data = $.parseJSON(data);
					var content = '';
					for (var i in data.files) content += data.files[i].content + '\n';
					rpc.setEditorContent(content);
				}
				else {
					rpc.setEditorContent(data);
				}
			}, 'text');
		}
		else if (code_url.toLowerCase().indexOf('pastebin.com') !== -1) {
			$.get('proxy.php', {url: 'http://pastebin.com/raw.php?i=' + code_id}, function(data) {
				rpc.setEditorContent(data);
			}, 'text');
		}
		else if (code_url.toLowerCase().indexOf('pastie.org') !== -1) {
			$.get('proxy.php', {url: 'http://pastie.org/pastes/' + code_id + '/download'}, function(data) {
				rpc.setEditorContent(data);
			}, 'text');
		}
	});
	
	$('#btn_download').click(function() {
		var filename = prompt('Filename:');
		if (filename === null || filename === '') return;
		$('input[name="phprun_action"]').val('download');
		$('input[name="phprun_filename"]').val(filename);
		$('#run_php_form').submit();
	});
	
	$('#title_bar').click(function() { rpc.editor.focus(); });
	
	rpc.resetEditor();
	if (rpc.settings.runExternal === false) rpc.runCode(); //If running externally we don't want a new tab to open right away

	$('.drop_help_window').hover(function() {
		if ($('#contributors').html() == '') {
			$.get('https://api.github.com/repos/websiteduck/Run-PHP-Code/contributors', function(data) {
				for (var i = 0; i < data.length; i++) {
					$('#contributors').append(
						'<li>' + 
							'<label><a href="' + data[i].html_url + '">' +
								'<img src="' + data[i].avatar_url + '&s=24" /> ' + data[i].login + 
							'</a></label>' + 
						'</li>'
					);
				}
			}, 'json');
		}
	});
	
});

function run_php_form_submit() {
	$('#phprun_code').val(rpc.editor.getValue());
}	

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
