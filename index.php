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
	header('X-XSS-Protection: 0');
	ini_set('display_errors', 1);
	switch ($_POST['error_reporting'])
	{
		case 'fatal': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR); break;
		case 'warning': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING); break;
		case 'deprecated': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED); break;
		case 'notice': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED | E_NOTICE); break;
		case 'all': error_reporting(-1); break;
		case 'none': default: error_reporting(0);	break;
	}
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
		<script type="text/javascript" src="run_php_code.js"></script>

		<link rel="stylesheet" href="codemirror2/lib/codemirror.css">
		<link rel="stylesheet" href="codemirror2/theme/ambiance.css">
		<link rel="stylesheet" href="run_php_code.css">
	</head>
	<body>
		<img id="resize_ball" src="resize_ball.png" />
		
		<form method="POST" action="" target="run_php_code">
			<input type="hidden" name="phprun_action" value="run" />
			
			<div id="title_bar">
				<span id="title">Run PHP Code</span>
				<div id="button_container">
					<button class="btn" type="button" id="reset">Reset</button>
					<button class="btn" type="submit" id="run" title="Run (Ctrl+Enter)">Run</button>
					<label><input type="checkbox" id="apply_css" checked="checked" /> Colorize</label>
					<label>
						Error Reporting
						<select name="error_reporting">
							<option value="none">None</option>
							<option value="fatal" selected="selected">Fatal</option>
							<option value="warning">Warning</option>
							<option value="deprecated">Deprecated</option>
							<option value="notice">Notice</option>
							<option value="all">All</option>
						</select>
					</label>
				</div>
			</div>
			
			<textarea name="phprun_code" id="php"></textarea>
		</form>
		
		<iframe id="php_frame" name="run_php_code">
		</iframe>
		
	</body>
</html>
<?php endif; ?>