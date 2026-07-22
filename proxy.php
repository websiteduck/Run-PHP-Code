<?php

// This application is meant to be run locally and should not be made publicly accessible.
if (!in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1', '::ffff:127.0.0.1'))) die();

if (!isset($_GET['url'])) {
  die();	
}

$url = urldecode($_GET['url']);

if (strpos($url, '/..') !== false) {
  header('HTTP/1.0 403 Forbidden');
  die();
}

if (
  strpos($url, 'http://', 0) !== 0 && 
  strpos($url, 'https://', 0) !== 0 &&
  strpos($url, './samples/', 0) !== 0
) {
  die();
}

$content = @file_get_contents($url, false, stream_context_create([
  'http' => [
    'header' => [
      'user-agent: Run-PHP-Code',
    ],
  ],
]));

if ($content === false) {
  echo 'Import failed.';
} else {
  echo $content;
}