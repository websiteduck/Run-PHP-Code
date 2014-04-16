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
 
//This application is meant to be run locally and should not be made publicly accessible.
if (!in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1'))) die();

define('NL', PHP_EOL);

if (isset($_POST['phprun_action']) && $_POST['phprun_action'] == 'download') {
	if (substr($_POST['phprun_filename'], -4) !== '.php') $_POST['phprun_filename'] .= '.php';
	header('Content-Type: text/plain');
	header('Content-Disposition: attachment; filename=' . $_POST['phprun_filename']);
	echo $_POST['phprun_code'];
	die();
}

if (isset($_POST['phprun_action']) && $_POST['phprun_action'] == 'run') {
	header('Expires: Mon, 16 Apr 2012 05:00:00 GMT');
	header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); 
	header('Cache-Control: no-store, no-cache, must-revalidate'); 
	header('Cache-Control: post-check=0, pre-check=0', false);
	header('Pragma: no-cache');
	header('X-XSS-Protection: 0');
	ini_set('display_errors', 1);
	switch ($_POST['error_reporting'])
	{
		case 'fatal': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR); break;
		case 'warning': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING); break;
		case 'deprecated': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED); break;
		case 'notice': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED | E_NOTICE); break;
		case 'all': error_reporting(-1); break;
		case 'none': default: error_reporting(0); break;
	}
	$phprun_code = '?>' . ltrim($_POST['phprun_code']);
	ob_start();
	eval($phprun_code);
	$phprun_html = ob_get_clean();
	if (isset($_POST['pre_wrap'])) $phprun_html = '<pre>' . $phprun_html . '</pre>';
	if (isset($_POST['colorize'])) $phprun_html = '<link rel="stylesheet" href="css/colorize.css">' . $phprun_html;
	echo $phprun_html;
	die();
}

?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Run PHP Code</title>
		<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.3.custom.min.js"></script>
		<script type="text/javascript" src="js/ace/ace.js" charset="utf-8"></script>
		<script type="text/javascript" src="js/run_php_code.js"></script>

		<link rel="shortcut icon" href="favicon.ico" >
		<link rel="stylesheet" href="css/font-awesome.min.css">
		<link rel="stylesheet" href="css/run_php_code.css">
	</head>
	<body>		
		<form id="run_php_form" method="POST" action="" target="result_frame" onsubmit="run_php_form_submit()">
			<input type="hidden" name="phprun_action" value="run" />
			<input type="hidden" name="phprun_filename" value="" />
			<div id="title_bar">
				<div id="title">Run PHP Code</div>
				
				<div class="drop"><span>File</span>
					<div>
						<button class="button" id="btn_import" type="button">Remote Import...</button>
						<button class="button" id="btn_download" type="button">Download...</button>
					</div>
				</div
				><div class="drop"><span>Options</span>
					<div>
						<input type="checkbox" id="mnu_colorize" name="colorize" /><label for="mnu_colorize"><span></span> Colorize</label>
						<input type="checkbox" id="mnu_external_window" /><label for="mnu_external_window"><span></span> External Window</label>
						<input type="checkbox" id="mnu_pre_wrap" name="pre_wrap" /><label for="mnu_pre_wrap"><span></span> &lt;pre&gt; Wrap</label>
						<div class="subdrop">
							Error Reporting
							<div>
								<input type="radio" id="mnu_er_none" name="error_reporting" value="none" /><label for="mnu_er_none"><span></span> None</label>
								<input type="radio" id="mnu_er_fatal" name="error_reporting" value="fatal" /><label for="mnu_er_fatal"><span></span> Fatal</label>
								<input type="radio" id="mnu_er_warning" name="error_reporting" value="warning" /><label for="mnu_er_warning"><span></span> Warning</label>
								<input type="radio" id="mnu_er_deprecated" name="error_reporting" value="deprecated" /><label for="mnu_er_deprecated"><span></span> Deprecated</label>
								<input type="radio" id="mnu_er_notice" name="error_reporting" value="notice" /><label for="mnu_er_notice"><span></span> Notice</label>
								<input type="radio" id="mnu_er_all" name="error_reporting" value="all" /><label for="mnu_er_all"><span></span> All</label>
							</div>
						</div>
					</div>
				</div
				><div class="drop"><span>Themes</span>
					<div>
						<div class="subdrop">
							Light
							<div>
								<input type="radio" id="mnu_theme_chrome" name="theme" value="chrome" /><label for="mnu_theme_chrome"><span></span> Chrome</label>
								<input type="radio" id="mnu_theme_clouds" name="theme" value="clouds" /><label for="mnu_theme_clouds"><span></span> Clouds</label>
								<input type="radio" id="mnu_theme_crimson_editor" name="theme" value="crimson_editor" /><label for="mnu_theme_crimson_editor"><span></span> Crimson Editor</label>
								<input type="radio" id="mnu_theme_dawn" name="theme" value="dawn" /><label for="mnu_theme_dawn"><span></span> Dawn</label>
								<input type="radio" id="mnu_theme_dreamweaver" name="theme" value="dreamweaver" /><label for="mnu_theme_dreamweaver"><span></span> Dreamweaver</label>
								<input type="radio" id="mnu_theme_eclipse" name="theme" value="eclipse" /><label for="mnu_theme_eclipse"><span></span> Eclipse</label>
								<input type="radio" id="mnu_theme_github" name="theme" value="github" /><label for="mnu_theme_github"><span></span> GitHub</label>
								<input type="radio" id="mnu_theme_katzenmilch" name="theme" value="katzenmilch" /><label for="mnu_theme_katzenmilch"><span></span> Katzenmilch</label>
								<input type="radio" id="mnu_theme_kuroir" name="theme" value="kuroir" /><label for="mnu_theme_kuroir"><span></span> Kuroir</label>
								<input type="radio" id="mnu_theme_solarized_light" name="theme" value="solarized_light" /><label for="mnu_theme_solarized_light"><span></span> Solarized Light</label>
								<input type="radio" id="mnu_theme_textmate" name="theme" value="textmate" /><label for="mnu_theme_textmate"><span></span> TextMate</label>
								<input type="radio" id="mnu_theme_tomorrow" name="theme" value="tomorrow" /><label for="mnu_theme_tomorrow"><span></span> Tomorrow</label>
								<input type="radio" id="mnu_theme_xcode" name="theme" value="xcode" /><label for="mnu_theme_xcode"><span></span> XCode</label>
							</div>
						</div>
						<div class="subdrop">
							Dark
							<div>
								<input type="radio" id="mnu_theme_ambiance" name="theme" value="ambiance" /><label for="mnu_theme_ambiance"><span></span> Ambiance</label>
								<input type="radio" id="mnu_theme_chaos" name="theme" value="chaos" /><label for="mnu_theme_chaos"><span></span> Chaos</label>
								<input type="radio" id="mnu_theme_clouds_midnight" name="theme" value="clouds_midnight" /><label for="mnu_theme_clouds_midnight"><span></span> Clouds Midnight</label>
								<input type="radio" id="mnu_theme_cobalt" name="theme" value="cobalt" /><label for="mnu_theme_cobalt"><span></span> Cobalt</label>
								<input type="radio" id="mnu_theme_idle_fingers" name="theme" value="idle_fingers" /><label for="mnu_theme_idle_fingers"><span></span> Idle Fingers</label>
								<!-- <input type="radio" id="mnu_theme_kr" name="theme" value="kr" /><label for="mnu_theme_kr"><span></span> krTheme</label> -->
								<input type="radio" id="mnu_theme_merbivore" name="theme" value="merbivore" /><label for="mnu_theme_merbivore"><span></span> Merbivore</label>
								<input type="radio" id="mnu_theme_merbivore_soft" name="theme" value="merbivore_soft" /><label for="mnu_theme_merbivore_soft"><span></span> Merbivore Soft</label>
								<input type="radio" id="mnu_theme_monokai" name="theme" value="monokai" /><label for="mnu_theme_monokai"><span></span> Monokai</label>
								<input type="radio" id="mnu_theme_mono_industrial" name="theme" value="mono_industrial" /><label for="mnu_theme_mono_industrial"><span></span> Mono Industrial</label>
								<input type="radio" id="mnu_theme_pastel_on_dark" name="theme" value="pastel_on_dark" /><label for="mnu_theme_pastel_on_dark"><span></span> Pastel on dark</label>
								<input type="radio" id="mnu_theme_solarized_dark" name="theme" value="solarized_dark" /><label for="mnu_theme_solarized_dark"><span></span> Solarized Dark</label>
								<input type="radio" id="mnu_theme_terminal" name="theme" value="terminal" /><label for="mnu_theme_terminal"><span></span> Terminal</label>
								<input type="radio" id="mnu_theme_tomorrow_night" name="theme" value="tomorrow_night" /><label for="mnu_theme_tomorrow_night"><span></span> Tomorrow Night</label>
								<input type="radio" id="mnu_theme_tomorrow_night_blue" name="theme" value="tomorrow_night_blue" /><label for="mnu_theme_tomorrow_night_blue"><span></span> Tomorrow Night Blue</label>
								<input type="radio" id="mnu_theme_tomorrow_night_bright" name="theme" value="tomorrow_night_bright" /><label for="mnu_theme_tomorrow_night_bright"><span></span> Tomorrow Night Bright</label>
								<input type="radio" id="mnu_theme_tomorrow_night_eighties" name="theme" value="tomorrow_night_eighties" /><label for="mnu_theme_tomorrow_night_eighties"><span></span> Tomorrow Night 80s</label>
								<input type="radio" id="mnu_theme_twilight" name="theme" value="twilight" /><label for="mnu_theme_twilight"><span></span> Twilight</label>
								<input type="radio" id="mnu_theme_vibrant_ink" name="theme" value="vibrant_ink" /><label for="mnu_theme_vibrant_ink"><span></span> Vibrant Ink</label>
							</div>
						</div>
					</div>
				</div
				><div class="drop drop_help_window">
					<span><i class="icon-question"></i></span>
					<div id="help_window">
						<h2>Run PHP Code</h2>

						<p>
							<img src="img/website_duck.png" alt="" style="width: 40px; height: 40px;" /><br />
							&copy; Website Duck LLC<br />
						</p>

						<a class="button" href="https://github.com/websiteduck/Run-PHP-Code">GitHub Repo</a><br />

						<div style="margin-top: 10px;">
							<b>Contributors</b>
							<ul id="contributors"></ul>
						</div>
						
					</div>
				</div>
					
				<div id="button_container">
					<button class="button" type="button" id="btn_reset"><i class="fa fa-eraser"></i> &nbsp; Clear</button>
					<button class="button" type="button" id="btn_run" title="Run (Ctrl+Enter)">Run &nbsp; <i class="fa fa-play"></i></button>
				</div>
			</div>
			
			<div id="code_div"></div>
			<input type="hidden" id="phprun_code" name="phprun_code" />
		</form>
		
		<div id="result_div"><iframe id="result_frame" name="result_frame"></iframe></div>		
		<div id="resize_bar"></div>
		
	</body>
</html>
