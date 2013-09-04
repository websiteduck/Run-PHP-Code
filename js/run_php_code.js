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
	if (settings.pre_wrap === undefined) settings.pre_wrap = false;
	if (settings.error_reporting === undefined) settings.error_reporting = 'fatal';
	
	if (settings.run_external === true) $('#mnu_external_window').prop('checked', true);
	if (settings.colorize === true) $('#mnu_colorize').prop('checked', true);
	if (settings.pre_wrap === true) $('#mnu_pre_wrap').prop('checked', true);
	$('input[name="error_reporting"][value="' + settings.error_reporting + '"]').prop('checked', true);
	
	editor = ace.edit("code_div");
    editor.setTheme("ace/theme/twilight");
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
		$('> div', this).stop().slideDown(100);
	}, function() {
		var self = this;
		hide_menu_timeout[$(this).uniqueId().attr('id')] = setTimeout(function() { $('> div', self).stop().slideUp(100); }, 500);
	});
	
	$('.subdrop').hover(function() {
		clearTimeout(hide_menu_timeout[$(this).uniqueId().attr('id')]);
		//Doing this instead of hide/show because of a bug in chrome that leaves part of the menu on the screen
		$('> div', this).css('left', '200px');
	}, function() {
		var self = this;
		hide_menu_timeout[$(this).uniqueId().attr('id')] = setTimeout(function() { $('> div', self).css('left', '-9999px'); }, 500);
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
	
	$('#btn_save').click(function() {
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