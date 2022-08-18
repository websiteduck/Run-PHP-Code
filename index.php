<?php
/**
 * Run PHP Code
 * 
 * This script gives you the ability to quickly test snippets of PHP code locally.
 *
 * @copyright  Copyright 2011-2022, Website Duck LLC (http://www.websiteduck.com)
 * @link       http://github.com/websiteduck/Run-PHP-Code Run PHP Code
 * @license    MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
 
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Run PHP Code</title>
    <script src="lib/ace/ace.js" charset="utf-8"></script>
    <script src="lib/vue.global.prod.js"></script>
    <script src="lib/vue-demi.iife.js"></script>
    <script src="lib/vue-use-shared.iife.js"></script>
    <script src="lib/vue-use-core.iife.js"></script>
    <script src="lib/pinia.iife.js"></script>
    <script src="lib/axios.min.js"></script>
    <link rel="shortcut icon" href="favicon.ico" >
    <link rel="stylesheet" href="css/run-php-code.css">
  </head>
  <body>
    <div style="display: none;">
      <?=file_get_contents('./img/check.svg')?>
      <?=file_get_contents('./img/check-selected.svg')?>
      <?=file_get_contents('./img/eraser.svg')?>
      <?=file_get_contents('./img/github-octicon.svg')?>
      <?=file_get_contents('./img/menu.svg')?>
      <?=file_get_contents('./img/open.svg')?>
      <?=file_get_contents('./img/play.svg')?>
      <?=file_get_contents('./img/radio.svg')?>
      <?=file_get_contents('./img/radio-selected.svg')?>
      <?=file_get_contents('./img/save.svg')?>
    </div>
    <div id="app"></div>
  </body>
  <script type="module" src="js/run-php-code.js"></script>
</html>