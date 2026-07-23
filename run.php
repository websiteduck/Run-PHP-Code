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
  header('Content-Type: application/json; charset=utf-8');
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

  $outputModeOverride = null;
  if (preg_match('/@run-php-code\s+output\s*=\s*(html|console|markdown)\b/i', $runPhp->code, $match)) {
    $outputModeOverride = strtolower($match[1]);
  }

  $runPhp->code = '?>' . ltrim($runPhp->code);

  $ctx = [
    'sent' => false,
    'start' => hrtime(true),
    'settings' => $runPhp->settings,
    'color' => $runPhp->color ?? null,
    'background_color' => $runPhp->background_color ?? null,
    'output_mode_override' => $outputModeOverride,
  ];

  $buildHtml = function ($html) use (&$ctx) {
    $settings = $ctx['settings'];
    $outputMode = $ctx['output_mode_override']
      ?? $settings->outputMode
      ?? (!empty($settings->preWrap) ? 'console' : 'html');
    $ctx['output_mode'] = $outputMode;

    if ($outputMode === 'console') {
      $html = htmlspecialchars($html, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $html = '<style id="runphpcode-console-style">'
        . 'html { margin: 0; }'
        . 'body { margin: 0; padding: 8px; overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.4; white-space: pre-wrap; }'
        . '</style>'
        . $html;
    } elseif ($outputMode === 'markdown') {
      require_once __DIR__ . '/lib/Parsedown.php';
      $parsedown = new Parsedown();
      $parsedown->setSafeMode(true);
      $html = $parsedown->text($html);
      $html = '<style id="runphpcode-markdown-style">'
        . 'html { margin: 0; }'
        . 'body { margin: 0; padding: 12px 16px; overflow-wrap: anywhere; font-family: Georgia, "Times New Roman", serif; font-size: 15px; line-height: 1.5; }'
        . 'body > :first-child { margin-top: 0; }'
        . 'body > :last-child { margin-bottom: 0; }'
        . 'h1, h2, h3, h4, h5, h6 { font-family: Verdana, sans-serif; line-height: 1.25; }'
        . 'pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.9em; }'
        . 'pre { padding: 10px 12px; overflow-x: auto; white-space: pre-wrap; overflow-wrap: anywhere; }'
        . 'code { padding: 0.1em 0.3em; }'
        . 'pre code { padding: 0; }'
        . 'blockquote { margin-left: 0; padding-left: 1em; border-left: 3px solid currentColor; opacity: 0.9; }'
        . 'table { border-collapse: collapse; max-width: 100%; }'
        . 'th, td { border: 1px solid currentColor; padding: 4px 8px; }'
        . '</style>'
        . $html;
    }

    if (!empty($settings->colorize)) {
      $colorPattern = '/^(#[0-9A-Fa-f]{3,8}|rgba?\([\d\s.,%]+\))$/';
      $color = (isset($ctx['color']) && preg_match($colorPattern, $ctx['color'])) ? $ctx['color'] : '#000000';
      $background = (isset($ctx['background_color']) && preg_match($colorPattern, $ctx['background_color'])) ? $ctx['background_color'] : '#ffffff';

      $html = $html . '
      <style id="runphpcode-style" media="all">
      html, body { background-color: ' . $background . '; color: ' . $color . '; }
      .xdebug-error th { background-color: ' . $background . '; font-weight: normal; font-family: sans-serif; }
      .xdebug-error td { color: ' . $color . '; }
      .xdebug-error th span { background-color: ' . $background . ' !important; }
      </style>
    ';
    }

    if (strncmp($html, '<!DOCTYPE', 9) !== 0) {
      $html = '<!DOCTYPE html>' . $html;
    }

    return $html;
  };

  $sendResponse = function ($html, $fatalError = null) use (&$ctx, $buildHtml) {
    if ($ctx['sent']) {
      return;
    }

    $ctx['sent'] = true;
    $durationMs = (hrtime(true) - $ctx['start']) / 1e6;

    echo json_encode([
      'html' => $buildHtml($html),
      'duration_ms' => round($durationMs, 3),
      'memory_bytes' => memory_get_peak_usage(true),
      'php_version' => PHP_VERSION,
      'output_mode' => $ctx['output_mode'] ?? 'html',
      'fatal_error' => $fatalError,
    ], JSON_INVALID_UTF8_SUBSTITUTE);
  };

  register_shutdown_function(function () use (&$ctx, $sendResponse) {
    if ($ctx['sent']) {
      return;
    }

    $error = error_get_last();
    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];
    $fatalError = null;
    $html = ob_get_level() > 0 ? ob_get_clean() : '';

    if ($error && in_array($error['type'], $fatalTypes, true)) {
      $fatalError = $error['message'];
      if (!empty($error['file'])) {
        $fatalError .= ' in ' . $error['file'];
      }
      if (!empty($error['line'])) {
        $fatalError .= ' on line ' . $error['line'];
      }
    }

    $sendResponse($html === false ? '' : $html, $fatalError);
  });

  ob_start();
  $fatalError = null;

  try {
    eval($runPhp->code);
  } catch (Throwable $e) {
    $fatalError = $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
  }

  $html = ob_get_clean();
  if ($html === false) {
    $html = '';
  }

  $sendResponse($html, $fatalError);
  die();
}
