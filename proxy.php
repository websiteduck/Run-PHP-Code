<?php
if (!isset($_GET['url'])) die();
$url = urldecode($_GET['url']);
if (strpos($url, 'http://', 0) !== 0 && strpos($url, 'https://', 0) !== 0) die();

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
$content = curl_exec($ch);
curl_close($ch);

if ($content === false) echo 'Import failed.';
else echo $content;