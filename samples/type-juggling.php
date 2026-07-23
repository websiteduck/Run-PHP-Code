<?php
// @run-php-code output=markdown
?>
# Type Juggling

Loose equality (`==`) coerces types before comparing. Prefer `===` / `!==`, and pass `$strict = true` to `in_array()` / `array_search()` when types matter.

PHP 8 made some coercions stricter (e.g. `0 == "foo"` is now false), but plenty of footguns remain.

## Loose (`==`) vs strict (`===`)

| Left | Right | `==` | `===` |
| --- | --- | --- | --- |
<?php
$pairs = [
  [0, '0'],
  [0, ''],
  [false, ''],
  [false, 0],
  ['0', false],
  [null, false],
  [null, ''],
  ['0e123', '0e456'],
  ['123', 123],
  [0, 'foo'], // false since PHP 8; was true in PHP 7
];

foreach ($pairs as [$left, $right]):
?>
| `<?= str_replace('|', '\\|', var_export($left, true)) ?>` | `<?= str_replace('|', '\\|', var_export($right, true)) ?>` | <?= $left == $right ? '**true**' : 'false' ?> | <?= $left === $right ? '**true**' : 'false' ?> |
<?php endforeach; ?>

## `empty("0")`

- `empty("0")` → **<?= empty('0') ? 'true' : 'false' ?>**
- `"0"` is a non-empty string, but `empty()` treats it like false/0.

## `in_array()` without strict

<?php $haystack = [0, 1, 2]; ?>
- `in_array("0", [0, 1, 2])` → **<?= in_array('0', $haystack) ? 'true' : 'false' ?>**
- `in_array("0", [0, 1, 2], true)` → **<?= in_array('0', $haystack, true) ? 'true' : 'false' ?>**
- `"0"` loosely matches integer `0` unless strict is true.
