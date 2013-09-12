var editor;
var resizing = false;
var settings = {};
var hide_menu_timeout = [];

window.onbeforeunload = null;

$(function() {

	if (localStorage.settings) settings = JSON.parse(localStorage.settings);
	
	//Default Settings
	if (settings.run_external === undefined) settings.run_external = false;
	if (settings.divide_x === undefined || settings.divide_x > $(window).width() - 10) settings.divide_x = $(window).width() / 2;
	if (settings.colorize === undefined) settings.colorize = true;
	if (settings.theme === undefined) settings.theme = "twilight";
	if (settings.pre_wrap === undefined) settings.pre_wrap = false;
	if (settings.error_reporting === undefined) settings.error_reporting = 'fatal';
	
	if (settings.run_external === true) $('#mnu_external_window').prop('checked', true);
	if (settings.colorize === true) $('#mnu_colorize').prop('checked', true);
	$('input[name="theme"][value="' + settings.theme + '"]').prop('checked', true);
	if (settings.pre_wrap === true) $('#mnu_pre_wrap').prop('checked', true);
	$('input[name="error_reporting"][value="' + settings.error_reporting + '"]').prop('checked', true);
	
	editor = ace.edit("code_div");
    editor.setTheme("ace/theme/" + settings.theme);
    editor.getSession().setMode("ace/mode/php");
	editor.setShowPrintMargin(false);
	editor.commands.addCommand({
		name: 'runCode',
		bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
		exec: function(editor) {
			run_code();
		}
	});
	
	editor.on('change', function() {
		if (window.onbeforeunload == null) {
			window.onbeforeunload = function() {
				return "You have made changes in your editor.";
			}
		}
	});
	
	function run_code() {
		$('input[name="phprun_action"]').val('run');
		$('#run_php_form').submit();
	}
		
	function reset() {
		editor.setValue("<?php\n\n");
		editor.gotoLine(3);
		editor.focus();
		window.onbeforeunload = null;
	}
	
	function save_settings() {
		localStorage.settings = JSON.stringify(settings);
	}
	
	$('#btn_reset').click(function() {
		var answer = confirm("Are you sure you want to clear the editor?");
		if (answer) { reset(); run_code(); }
	});
	
	$('#btn_run').click(run_code);
	
	$('#mnu_external_window').change(function() {
		if (this.checked) {
			settings.run_external = true;
			$('#result_div').hide();
			$('#resize_bar').hide();
			$('#run_php_form').prop('target', 'result_external');
		} 
		else {
			settings.run_external = false;
			$('#result_div').show();
			$('#resize_bar').show();
			$('#run_php_form').prop('target', 'result_frame');
		}
		$(window).resize();
		save_settings();
	}).change();
	
	$('#mnu_colorize').change(function() {
		if (this.checked) settings.colorize = true;
		else settings.colorize = false;
		save_settings();
	});
	
	$('input[name="theme"]').change(function() {
		settings.theme = $(this).val();
		editor.setTheme("ace/theme/" + settings.theme);
		save_settings();
	});

	editor.renderer.on('themeLoaded', function() {
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
		if (settings.colorize) {
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
		if (settings.colorize) {
			var bgcolor = $('.ace_gutter').css('backgroundColor'); //base a lot of colors off this one
  	  var color = $('#code_div').css('color');

			$('#result_frame').contents().find('html')
				.css('backgroundColor', shadeColor(bgcolor,-2))
				.css('color', color);
		}
	});
	
	$('#mnu_pre_wrap').change(function() {
		if (this.checked) settings.pre_wrap = true;
		else settings.pre_wrap = false;
		save_settings();
	});
	
	$('input[name="error_reporting"]').change(function() {
		settings.error_reporting = $(this).val();
		save_settings();
	});
	
	$(window).resize(function() {
		var page_width = $(window).width();		
		if (settings.run_external) {
			$('#code_div').width(page_width);
		}
		else {
			$('#code_div').width(settings.divide_x - 2);
			$('#resize_bar').css('left', settings.divide_x - 2 + 'px');
			$('#result_div').width((page_width - settings.divide_x) - 2);
		}
		editor.resize();
	}).resize();
	
	$(document).mousemove(function(e) {
		if (resizing === true) {
			var x = e.pageX;
			if (x < 100) x = 100;
			settings.divide_x = x;
			$(window).resize();
		}
	});
	$('#resize_bar').mousedown(function(e) {
		if (settings.run_external === false) {
			resizing = true; 
			$('#result_frame').css('pointer-events', 'none');
			event.preventDefault();
		}
	}).mouseup(function(e) {
		if (resizing) {
			resizing = false;
			$('#result_frame').css('pointer-events', 'auto');
			save_settings();
		}
	});
		
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
	
	function set_editor_content(content) {
		editor.setValue(content);
		editor.gotoLine(1);
		editor.focus();
	}
	
	$('#btn_import').click(function() {
		var code_url = prompt('Always make sure imported code is safe before running!!!\n\nSupported services: gist.GitHub.com, PasteBin.com, Pastie.org\n\nEnter URL:');
		if (code_url === null || code_url === '') return;
		code_id = get_id_from_url(code_url);
		editor.setValue('Loading code...');
		
		if (code_url.toLowerCase().indexOf('github.com') !== -1) {
			$.get('proxy.php', {url: 'https://api.github.com/gists/' + code_id}, function(data) {
				if (data.charAt(0) === '{') {
					data = $.parseJSON(data);
					var content = '';
					for (var i in data.files) content += data.files[i].content + '\n';
					set_editor_content(content);
				}
				else {
					set_editor_content(data);
				}
			}, 'text');
		}
		else if (code_url.toLowerCase().indexOf('pastebin.com') !== -1) {
			$.get('proxy.php', {url: 'http://pastebin.com/raw.php?i=' + code_id}, function(data) {
				set_editor_content(data);
			}, 'text');
		}
		else if (code_url.toLowerCase().indexOf('pastie.org') !== -1) {
			$.get('proxy.php', {url: 'http://pastie.org/pastes/' + code_id + '/download'}, function(data) {
				set_editor_content(data);
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
	
	$('#title_bar').click(function() { editor.focus(); });
	
	reset();
	if (settings.run_external === false) run_code();
});

function run_php_form_submit() {
	$('#phprun_code').val(editor.getValue());
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
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}
