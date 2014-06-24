/**
* A jQuery plugin to add typeahead search functionality to the navbar search
* box.  This requires Hogan for templating and typeahead.js for the actual
* typeahead functionality.
*
* Stolen from php.net and modified for use with Run PHP Code
*
*/
(function ($) {

	$.fn.search = function (options) {
		var element = this;

		options.language = options.language || "en";
		options.limit = options.limit || 30;

		var backends = {
			"function": { label: "Functions", elements: [] },
			"variable": { label: "Variables", elements: [] },
			"class": { label: "Classes", elements: [] },
			"exception": { label: "Exceptions", elements: [] },
			"extension": { label: "Extensions", elements: [] },
			"general": { label: "Other Matches", elements: [] }
		};

		$.get('php_search_index.json', function(index) {
			$.each(index, function (id, item) {
				// If the item has a name, then we should figure out what type
				// of data this is, and hence which backend this should go into.
				if (item[0]) {
					var tokens = [item[0]];
					var type = null;

					/*
					if (item[0].indexOf("_") != -1) {
						tokens.push(item[0].replace("_", ""));
					}
					if (item[0].indexOf("::") != -1) {
						// We'll add tokens to make the autocompletion more
						// useful: users can search for method names and can
						// specify that they only want method names by
						// prefixing their search with ::.
						tokens.push(item[0].split("::")[1]);
						tokens.push("::" + item[0].split("::")[1]);
					}
					*/

					switch(item[2]) {
						case "phpdoc:varentry": type = "variable"; break;
						case "refentry": type = "function"; break;
						case "phpdoc:exceptionref": type = "exception"; break;
						case "phpdoc:classref": type = "class"; break;

						case "set":
						case "book":
						case "reference":
						type = "extension"; break;

						case "section":
						case "chapter":
						case "appendix":
						case "article":
						default:
						type = "general";
					}

					if (type) {
						backends[type].elements.push({ id: id, name: item[0], description: item[1], tokens: tokens });
					}
				}
			});

			$.each(backends, function(id, backend) {
				$('#php_search_drop').append('<div class="backend" data-backend-id="' + id + '">' + backend.label + '</div><div class="container" data-backend-id="' + id + '"></div>');

				backend.elements.sort(function (a, b) {
					var a = a.name;
					var b = b.name;

					var aIsMethod = (a.indexOf("::") != -1);
					var bIsMethod = (b.indexOf("::") != -1);

					// Methods are always after regular functions.
					if (aIsMethod && !bIsMethod) return 1;
					else if (bIsMethod && !aIsMethod) return -1;
					
					// If one function name is the exact prefix of the other, we want
					// to sort the shorter version first (mostly for things like date()
					// versus date_format()).
					if (a.length > b.length && a.indexOf(b) == 0) return 1;
					else if (b.indexOf(a) == 0) return -1;

					if (a > b) return 1;
					else if (a < b) return -1;
					return 0;
				});

			});

		}, 'json');

		$(element).keyup(function() {
			var search_string = $(this).val();
			if (search_string === '') $('#php_search_drop').hide();
			else {
				$.each(backends, function(id, backend) {
					var items = [];
					var add = false;
					for (var i = 0; i < backend.elements.length; i++) {
						var element = backend.elements[i];
						var token = element.tokens.join(' ');
						if (token.toLowerCase().indexOf(search_string.toLowerCase()) > -1) {
							items.push('<div class="search_result" data-php-id="' + element.id + '">' + element.name + '<br><span class="desc">' + element.description + '</span></div>');
						}
						if (items.length > 100) break;
					}
					$header = $('#php_search_drop .backend[data-backend-id="' + id + '"]');
					$container = $('#php_search_drop .container[data-backend-id="' + id + '"]');
					$container.html('');
					$.fn.append.apply($('#php_search_drop .container[data-backend-id="' + id + '"]'), items);
					if (items.length > 0) $header.show();
					else $header.hide();
				});
				$('#php_search_drop').show();
			}
		});

		$('#php_search_drop').on('click', '.search_result', function() {
			window.open('http://www.php.net/manual/en/' + $(this).data('php-id') + '.php');
			$('#php_search_drop').hide();
		});

		$(element).click(function() {
			if ($(this).val() !== '') $('#php_search_drop').show();
		});

		$(document).click(function(e) {
			if( $(e.target).closest("#php_search_drop").length > 0 ) return false;
			if (e.target.id === 'php_search') return false;
			$('#php_search_drop').hide();
		});
	};
	
})(jQuery);