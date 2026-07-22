Run PHP Code
============

<a href="https://github.com/websiteduck/Run-PHP-Code/archive/master.zip"><b>Download Run PHP Code</b></a>

or

<a href="https://websiteduck.github.io/Run-PHP-Code/"><b>Try the In-Browser WebAssembly Version</b></a>

This script gives you the ability to quickly test snippets of PHP code locally. A local web server is required.

- Create a folder called <b>php</b> or similar in your www folder. 
- Extract the Run PHP Code files into it. 
- Bookmark the URL for easy access.
- Or clone the repository instead and do a git pull every once in a while.
- Access it from <b>127.0.0.1</b> or <b>localhost</b> only. <code>run.php</code> and <code>proxy.php</code> refuse other client IPs (loopback allowlist near the top of each file).
- <b>If you get a blank screen</b>, you are probably not connecting from loopback. Add your client IP to the allowlist in <code>run.php</code> and <code>proxy.php</code> only if you must; prefer binding the server to localhost instead.

<b>This application is meant to be run locally and should not be made publicly accessible.</b>

![screenshot](https://github.com/websiteduck/Run-PHP-Code/raw/master/img/screenshot.png)  

Features
--------
- Ace code editor
- Import gists from GitHub
- Import pastes from PasteBin and Pastie
- PHP search for functions, classes, variables, etc.
- Load/Save files to disk
- Themes from the Ace editor

Tips
----
- Pressing Ctrl-Enter will run your code.
- Ace supports multiple cursors, just hold ctrl and click where you want your cursors.

### Run PHP Code utilizes the following projects:

---

<a href="https://ace.c9.io">Ace</a>  
Copyright (c) 2010, Ajax.org B.V.  
Licensed under the <a href="https://www.opensource.org/licenses/bsd-license.php">BSD License</a>

<a href="https://vuejs.org">Vue.js</a>  
Copyright (c) 2018-present, Yuxi (Evan) You
Licensed under the <a href="https://www.opensource.org/licenses/mit-license.php">MIT License</a>

<a href="https://pinia.vuejs.org">Pinia</a>  
Copyright (c) 2019-present Eduardo San Martin Morote
Licensed under the <a href="https://www.opensource.org/licenses/mit-license.php">MIT License</a>

<a href="https://axios-http.com">Axios</a>  
Copyright (c) 2014-present Matt Zabriskie & Collaborators
Licensed under the <a href="https://www.opensource.org/licenses/mit-license.php">MIT License</a>
