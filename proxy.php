<?php

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