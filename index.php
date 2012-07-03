<?php
/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2012, Website Duck LLC (http://www.websiteduck.com)
 * @link       http://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
if (!in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1'))) die('dead');

if (isset($_POST['phprun_action']) && $_POST['phprun_action'] == 'run') 
{
	$phprun_code = ltrim($_POST['phprun_code']);
	if (substr($phprun_code,0,5) == '<?php') $phprun_code = substr($phprun_code, 5);
	ob_start();
	eval($phprun_code);
	$phprun_html = ob_get_clean();
	echo $phprun_html;
	die();
} 
?>
<?php if (!isset($_POST['action']) || $_POST['action'] != 'run'): ?>
<!DOCTYPE html>
<html>
	<head>
		<title>Run PHP Code</title>
		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
		<script type="text/javascript" src="codemirror2/lib/codemirror.js"></script>
		<script type="text/javascript" src="codemirror2/mode/xml/xml.js"></script>
		<script type="text/javascript" src="codemirror2/mode/javascript/javascript.js"></script>
		<script type="text/javascript" src="codemirror2/mode/css/css.js"></script>
		<script type="text/javascript" src="codemirror2/mode/clike/clike.js"></script>
		<script type="text/javascript" src="codemirror2/mode/php/php.js"></script>

		<link rel="stylesheet" href="codemirror2/lib/codemirror.css">
		<link rel="stylesheet" href="codemirror2/theme/ambiance.css">

		<script type="text/javascript">
			var editor;
			$(function() {
				editor = CodeMirror.fromTextArea( document.getElementById("php"), {
					height: "dynamic",
					lineNumbers: true,
					matchBrackets: true,
					mode: "application/x-httpd-php-open",
					theme: "ambiance",
					indentUnit: 4
				});
				$('#reset').click(function() {
					var answer = confirm("Are you sure you want to clear the editor?");
					if (answer) editor.setValue('');
				});
			});
			if (document.documentElement.attachEvent) {
				document.documentElement.attachEvent('onmousedown',function(){
					event.srcElement.hideFocus = true;
				});
			}
		</script>

		<style type="text/css">
			html, body { padding: 0; margin: 0; }
			body { background-color: #222; color: #555; font-family: arial; }
			#title_bar { 
				font-size: 20px; font-weight: bold;
				color: #FFF; text-shadow: 0 0 10px #00aaff; padding: 15px; 
			}
			.CodeMirror {border: 1px solid black; font-size:13px}
			.CodeMirror-scroll { height: auto; overflow-y: hidden; overflow-x: auto; min-height: 400px; }
			.btn {
				color: #FFF;
				background-color: #222;
				font-size: 25px;
				font-weight: bold;
				/* display: block; */
				padding: 4px;
				-webkit-border-radius: 8px;
				-moz-border-radius: 8px;
				border-radius: 8px;
				-webkit-box-shadow: 0px 9px 0px #111, 0px 9px 25px rgba(0,0,0,.7);
				-moz-box-shadow: 0px 9px 0px #111, 0px 9px 25px rgba(0,0,0,.7);
				box-shadow: 0px 9px 0px #111, 0px 9px 25px rgba(0,0,0,.7);
				text-align: center;

				-webkit-transition: all .1s ease;
				-moz-transition: all .1s ease;
				-ms-transition: all .1s ease;
				-o-transition: all .1s ease;
				transition: all .1s ease;
				cursor: pointer;
				border: 1px solid black;
			}

			.btn:hover { background-color: #252525;	}

			.btn:active {
					-webkit-box-shadow: 0px 3px 0px #111, 0px 3px 6px rgba(0,0,0,.9);
					-moz-box-shadow: 0px 3px 0px #111, 0px 3px 6px rgba(0,0,0,.9);
					box-shadow: 0px 3px 0px #111, 0px 3px 6px rgba(0,0,0,.9);
					position: relative;
					top: 6px;
			}
			
			.btn:active, #run:selected, #run:visited { outline: none;	}
			
			#button_container { text-align: center; }
			#run { width: 500px; text-shadow: 0 0 10px #aaffaa; }
			#reset { width: 150px; text-shadow: 0 0 10px #d92915; }
			
		</style>
	</head>
	<body>
		<div id="title_bar">Run PHP Code</div>
    
		<form method="POST" action="" target="_blank">
			<input type="hidden" name="phprun_action" value="run" />
			<textarea name="phprun_code" id="php" rows="15"></textarea><br />
			<div id="button_container">
				<button class="btn" type="button" id="reset">Reset</button>
				<button class="btn" type="submit" id="run">Run</button>
			</div>
		</form>
			
	</body>
</html>
<? endif; ?>