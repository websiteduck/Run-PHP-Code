var editor;
var resizing;
var divide_x;

$(function() {

	editor = CodeMirror.fromTextArea( document.getElementById("php"), {
		lineNumbers: true,
		matchBrackets: true,
		mode: "application/x-httpd-php-open",
		theme: "ambiance",
		indentUnit: 4,
		extraKeys: { 'Ctrl-Enter': function() { $('#run_php_form').submit(); } }
	});
	
	$('#reset').click(function() {
		var answer = confirm("Are you sure you want to clear the editor?");
		if (answer) { 
			editor.setValue('');
			$('#run_php_form').submit();
		}
	});
	
	$('#external_window').click(function() {
		if (this.checked) {
			$('#php_frame').hide();
			$('#resize_ball').hide();
			$('#run_php_form').prop('target', 'run_php_external');
			divide_x = $(window).width();
		} 
		else {
			$('#php_frame').show();
			$('#resize_ball').show();
			$('#run_php_form').prop('target', 'run_php_code');
			divide_x = $(window).width() / 2;
		}
		$(window).resize();
	});
	
	$('#php_frame').load(function() {
		bind_php_frame();
	}).load();
	
	divide_x = $(window).width() / 2;
	
	$(window).resize(function() {
		var window_height = $(window).height();
		var page_height = window_height - 40;
		var page_width = $(window).width();
		$('.CodeMirror').height(page_height);
		$('.CodeMirror-scroll').height(page_height); editor.refresh();
		if ($('#external_window').prop('checked')) $('.CodeMirror').width($(window).width());
		else $('.CodeMirror').width(divide_x);
		$('#php_frame').height(page_height);
		$('#php_frame').width(page_width - divide_x);
		$('#resize_ball').css('top', 40 + page_height/2 - 32);
		$('#resize_ball').css('left', divide_x - 32 );
	}).resize();
	
	$('#resize_ball').mousedown(function() { resizing = true; event.preventDefault(); }).mouseup(function(e) { resize_mouse_up(e.pageX) });
	$('#resize_ball').bind("dragstart", function() { return false; });
	
	$(document).mousemove(function(e) {
		if (resizing) {
			$('#resize_ball').css('left', e.pageX - 16);
		}
	}).mouseup(function(e) {
		resize_mouse_up(e.pageX); 
	});
	
	function bind_php_frame() {
		$('#php_frame').contents().find('html').mousemove(function(e) {
			if (resizing) {
				var php_frame_position = $('#php_frame').position();
				$('#resize_ball').css('left', e.pageX + php_frame_position.left - 32);
			}
		}).mouseup(function(e) {
			resize_mouse_up( e.pageX + $('#php_frame').position().left ); 
		});
	}
	
	function resize_mouse_up(x) {
		if (resizing) {
			var window_width = $(window).width();
			if (x < 100) x = 100;
			if (x > window_width - 100) x = window_width - 100;
			divide_x = x;
			$('.CodeMirror').width(divide_x); editor.refresh();
			$('#php_frame').width(window_width - divide_x);
			resizing = false;
			$(window).resize();
		}
	}
	
	$('#run_php_form').submit();

});

	
	

if (document.documentElement.attachEvent) {
	document.documentElement.attachEvent('onmousedown',function(){
		event.srcElement.hideFocus = true;
	});
}