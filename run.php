<?php
/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2022, Website Duck LLC (https://www.websiteduck.com)
 * @link       https://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (https://www.opensource.org/licenses/mit-license.php)
 */

// This application is meant to be run locally and should not be made publicly accessible.
if (!in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1', '::ffff:127.0.0.1'))) die();

$originUrl = parse_url($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '') ?: [];
$originHost = strtolower($originUrl['host'] ?? '');
if (!empty($originUrl['port'])) $originHost .= ':' . $originUrl['port'];
if ($originHost === '' || $originHost !== strtolower($_SERVER['HTTP_HOST'] ?? '')) die();

define('NL', PHP_EOL);

if (!isset($_POST['runphp_data'])) {
  die();
}

$runPhp = json_decode($_POST['runphp_data']);

if (!is_object($runPhp) || !isset($runPhp->action)) {
  die();
}

if ($runPhp->action == 'run') {
  header('Expires: Mon, 16 Apr 2012 05:00:00 GMT');
  header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); 
  header('Cache-Control: no-store, no-cache, must-revalidate'); 
  header('Cache-Control: post-check=0, pre-check=0', false);
  header('Content-Type: text/html; charset=utf-8');
  header('Pragma: no-cache');
  ini_set('display_errors', 1);

  $fatal = E_ERROR | E_PARSE | E_COMPILE_ERROR;
  $warning = $fatal | E_WARNING;
  $deprecated = $warning | E_DEPRECATED | E_USER_DEPRECATED;
  $notice = $deprecated | E_NOTICE;

  switch ($runPhp->settings->errorReporting)
  {
    case 'fatal': error_reporting($fatal); break;
    case 'warning': error_reporting($warning); break;
    case 'deprecated': error_reporting($deprecated); break;
    case 'notice': error_reporting($notice); break;
    case 'all': error_reporting(-1); break;
    case 'none': default: error_reporting(0); break;
  }

  $runPhp->code = '?>' . ltrim($runPhp->code);
  $tmpDir = sys_get_temp_dir();
  $tmpFile = tempnam($tmpDir, 'runphp_');
  file_put_contents($tmpFile, $runPhp->code);
  ob_start();
  include $tmpFile;
  $runPhp->html = ob_get_clean();
  if (strncmp(realpath($tmpFile), realpath($tmpDir), strlen(realpath($tmpDir))) === 0) {
    unlink($tmpFile); // nosemgrep: php.lang.security.unlink-use.unlink-use
  }
  
  if ($runPhp->settings->preWrap) {
    $runPhp->html = '<pre>' . $runPhp->html . '</pre>';
  }

  if ($runPhp->settings->colorize) {
    $colorPattern = '/^(#[0-9A-Fa-f]{3,8}|rgba?\([\d\s.,%]+\))$/';
    $color = (isset($runPhp->color) && preg_match($colorPattern, $runPhp->color)) ? $runPhp->color : '#000000';
    $background = (isset($runPhp->background_color) && preg_match($colorPattern, $runPhp->background_color)) ? $runPhp->background_color : '#ffffff';

    $runPhp->html = $runPhp->html . '
      <style id="runphpcode-style" media="all">
      html { width: 100%; background-color: ' . $background . '; color: ' . $color . '; }
      .xdebug-error th { background-color: ' . $background . '; font-weight: normal; font-family: sans-serif; }
      .xdebug-error td { color: ' . $color . '; }
      .xdebug-error th span { background-color: ' . $background . ' !important; }
      </style>
    ';
  }

  if (strncmp($runPhp->html, '<!DOCTYPE', 9) !== 0) {
    $runPhp->html = '<!DOCTYPE html>' . $runPhp->html;
  }

  echo $runPhp->html;
  die();
}