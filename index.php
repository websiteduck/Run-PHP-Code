<?php
/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2014, Website Duck LLC (http://www.websiteduck.com)
 * @link       http://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
 
//This application is meant to be run locally and should not be made publicly accessible.
if (!in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1'))) die();

define('NL', PHP_EOL);
function u(&$v, $default = null) { return isset($v) ? $v : $default; }
function ua($array, $key, $default = null) { return isset($array[$key]) ? $array[$key] : $default; }

if (isset($_POST['runphp_data'])) {
	$runphp = json_decode($_POST['runphp_data']);

	if ($runphp->action === 'download') {
		if (substr($runphp->filename, -4) !== '.php') $runphp->filename .= '.php';
		header('Content-Type: text/plain');
		header('Content-Disposition: attachment; filename=' . $runphp->filename);
		echo $runphp->code;
		die();
	}

	if ($runphp->action == 'run') {
		header('Expires: Mon, 16 Apr 2012 05:00:00 GMT');
		header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); 
		header('Cache-Control: no-store, no-cache, must-revalidate'); 
		header('Cache-Control: post-check=0, pre-check=0', false);
		header('Content-Type: text/html; charset=utf-8');
		header('Pragma: no-cache');
		header('X-XSS-Protection: 0');
		ini_set('display_errors', 1);
		switch ($runphp->settings->error_reporting)
		{
			case 'fatal': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR); break;
			case 'warning': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING); break;
			case 'deprecated': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED); break;
			case 'notice': error_reporting(E_ERROR | E_PARSE | E_COMPILE_ERROR | E_WARNING | E_DEPRECATED | E_USER_DEPRECATED | E_NOTICE); break;
			case 'all': error_reporting(-1); break;
			case 'none': default: error_reporting(0); break;
		}
		$runphp->code = '?>' . ltrim($runphp->code);
		ob_start();
		eval($runphp->code);
		$runphp->html = ob_get_clean();
		if (u($runphp->settings->pre_wrap) === true) $runphp->html = '<pre>' . $runphp->html . '</pre>';
		if (u($runphp->settings->colorize) === true) $runphp->html = '
			<style>
			html {	width: 100%; background-color: ' . $runphp->bgcolor . ';	color: ' . $runphp->color . '; }
			.xdebug-error th { background-color: #' . $runphp->bgcolor . '; font-weight: normal; font-family: sans-serif; }
			.xdebug-error td { color: ' . $runphp->color . '; }
			.xdebug-error th span { background-color: ' . $runphp->bgcolor . ' !important; }
			</style>' . $runphp->html;
		echo $runphp->html;
		die();
	}
}
else {
	header('Content-Type: text/html; charset=utf-8');
}
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Run PHP Code</title>
		<script type="text/javascript" src="js/jquery-3.1.1.min.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.3.custom.min.js"></script>
		<script type="text/javascript" src="js/ace/ace.js" charset="utf-8"></script>
		<script type="text/javascript" src="js/knockout-3.4.1.js"></script>
		<script type="text/javascript" src="js/php_search.js"></script>
		<script type="text/javascript" src="js/run_php_code.js"></script>

		<link rel="shortcut icon" href="favicon.ico" >
		<link rel="stylesheet" href="css/font-awesome.min.css">
		<link rel="stylesheet" href="css/run_php_code.css">
	</head>
	<body>		
		
		<form id="runphp_form" method="POST" action="" target="result_frame" data-bind="attr: { target: settings.run_external() ? 'result_external' : 'result_frame' }">
			<input type="hidden" name="runphp_data" value="" />
		</form>

		<div id="title_bar">
			<div id="title">Run PHP Code</div>
				
			<div class="drop"><span>File</span>
				<div>
					<div class="clickable"><a data-bind="click: php_info">phpinfo()</a></div>
					<div class="clickable"><a data-bind="click: remote_import">Remote Import...</a></div>
					<div class="clickable"><a data-bind="click: download_file">Download...</a></div>
				</div>
			</div
			><div class="drop"><span>Options</span>
				<div>
					<div class="checkbox" data-bind="my_checkbox: settings.colorize, click: change_setting" data-label="Colorize"></div>
					<div class="checkbox" data-bind="my_checkbox: settings.run_external, click: change_setting" data-label="External Window"></div>
					<div class="checkbox" data-bind="my_checkbox: settings.pre_wrap, click: change_setting" data-label="&lt;pre&gt; Wrap"></div>
					<div class="subdrop">
						Error Reporting
						<div>
							<div class="radio" data-bind="my_radio: settings.error_reporting" data-value="none" data-label="None"></div>
							<div class="radio" data-bind="my_radio: settings.error_reporting" data-value="fatal" data-label="Fatal"></div>
							<div class="radio" data-bind="my_radio: settings.error_reporting" data-value="warning" data-label="Warning"></div>
							<div class="radio" data-bind="my_radio: settings.error_reporting" data-value="deprecated" data-label="Deprecated"></div>
							<div class="radio" data-bind="my_radio: settings.error_reporting" data-value="notice" data-label="Notice"></div>
							<div class="radio" data-bind="my_radio: settings.error_reporting" data-value="all" data-label="All"></div>
						</div>
					</div>
				</div>
			</div
			><div class="drop"><span>Themes</span>
				<div>
					<div class="subdrop">
						Light
						<div>
							<!-- ko foreach: themes.light -->
								<div class="checkbox" data-bind="attr: { 'data-value': theme, 'data-label': title }, my_radio: $parent.settings.theme, click: $parent.change_setting"></div>	
							<!-- /ko -->
						</div>
					</div>
					<div class="subdrop">
						Dark
						<div>
							<!-- ko foreach: themes.dark -->
								<div class="checkbox" data-bind="attr: { 'data-value': theme, 'data-label': title }, my_radio: $parent.settings.theme, click: $parent.change_setting"></div>	
							<!-- /ko -->
						</div>
					</div>
				</div>
			</div
			><div class="drop drop_help_window" data-bind="event: { mouseover: load_contributors }">
				<span><i class="fa fa-question"></i></span>
				<div id="help_window">
					<div style="padding: 10px;">
						<h2>Run PHP Code</h2>

						<p>
							<img src="img/website_duck.png" alt="" style="width: 40px; height: 40px;"><br>
							&copy; Website Duck LLC<br />
						</p>

						<a class="button" href="https://github.com/websiteduck/Run-PHP-Code"><i class="fa fa-github"></i> GitHub Repo</a><br>
					</div>

					<div class="subdrop with_icon" style="text-align: left;">
						<i class="fa fa-users"></i> Contributors
						<div>
							<ul data-bind="foreach: contributors" id="contributors">
								<li>
									<label><a data-bind="attr: { href: url }"><img data-bind="attr: { src: avatar_url + '&s=24' }" /> <span data-bind="text: login"></span></a></label>
								</li>
							</ul>
						</div>
					</div>
					<div class="subdrop with_icon" style="text-align: left;">
						<i class="fa fa-heart"></i> Attributions
						<div>
							<ul>
								<li><label><a href="http://ace.ajax.org"> Ace</a></label></li>
								<li><label><a href="http://fortawesome.github.io/Font-Awesome"> Font Awesome</a></label></li>
								<li><label><a href="http://jquery.com"> jQuery</a></label></li>
								<li><label><a href="http://knockoutjs.com"> Knockout</a></label></li>
							</ul>
						</div>
					</div>
					
				</div>
			</div>
					
			<div id="button_container">
				<button class="button" type="button" data-bind="click: clear"><i class="fa fa-eraser"></i> &nbsp; Clear</button>
				<button class="button" type="button" title="Run (Ctrl+Enter)" data-bind="click: run">Run &nbsp; <i class="fa fa-play"></i></button>
			</div>

			<div style="position: relative; display: inline-block; margin-left: 10px;">
				<span class="php_logo">php</span><input type="text" id="php_search">
				<div id="php_search_drop"></div>
			</div>
		</div>
		
		<div id="code_div" data-bind="style: { width: code_width() + 'px' }"></div>
		<div id="result_div" data-bind="visible: !settings.run_external(), style: { width: result_width() + 'px' }"><iframe id="result_frame" name="result_frame" data-bind="event: { load: result_loaded }"></iframe></div>		
		<div id="resize_bar" data-bind="visible: !settings.run_external(), style: { left: settings.divide_x() + 'px' }"></div>
		
	</body>
</html>