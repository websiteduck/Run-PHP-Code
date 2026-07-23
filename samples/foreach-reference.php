<?php
// @run-php-code output=markdown

function md_list($array) {
  $lines = [];
  foreach ($array as $i => $value) {
    $lines[] = '- `[' . $i . '] => ' . var_export($value, true) . '`';
  }
  // Trailing blank line: PHP discards the newline after a close tag, so
  // lists would otherwise glue into the next paragraph/heading.
  return implode("\n", $lines) . "\n\n";
}
?>
# Foreach References

`foreach ($arr as &$item)` binds `$item` as a **reference** to each element. After the loop, `$item` still references the last element. A later write (or another `foreach` reusing that variable) silently changes the array.

**Fix:** `unset($item)` after a by-reference foreach, or use keys: `foreach ($arr as $i => $item) { $arr[$i] = ...; }`

## Leftover reference

<?php
$colors = ['red', 'green', 'blue'];

foreach ($colors as &$color) {
  $color = strtoupper($color);
}
// $color still references $colors[2] ("BLUE") here
?>
After uppercasing by reference:

<?= md_list($colors) ?>

<?php $color = 'YELLOW'; ?>
After `$color = 'YELLOW'` (no `unset`):

<?= md_list($colors) ?>

## Safe version with `unset()`

<?php
$colors = ['red', 'green', 'blue'];

foreach ($colors as &$color) {
  $color = strtoupper($color);
}
unset($color);

$color = 'YELLOW';
?>
After `unset($color)` then `$color = 'YELLOW'`:

<?= md_list($colors) ?>

## Second foreach reusing `$value` without `unset`

<?php
$numbers = [1, 2, 3];
foreach ($numbers as &$value) {
  $value *= 10;
}
// Forgot unset($value)

foreach ($numbers as $value) {
  // Assignments during this loop keep writing through the leftover reference
}
?>
Numbers after a second foreach without `unset`:

<?= md_list($numbers) ?>
