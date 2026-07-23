<?php
// @run-php-code output=markdown
?>
# DateTime Mutability

`DateTime` is **mutable**: `modify()` / `add()` / `setTime()` change the same object in place. Assignment with `=` shares that object, so changing one variable changes the other.

Prefer `DateTimeImmutable`, or `clone` when you need a separate mutable copy.

## Shared by assignment

<?php
$start = new DateTime('2026-01-15 09:00:00');
$end = $start;
$end->modify('+1 day');
?>
- `$start` = `<?= $start->format('Y-m-d H:i:s') ?>`
- `$end` = `<?= $end->format('Y-m-d H:i:s') ?>`
- Both changed — `$end` is the same object as `$start`.

## `clone` makes a separate mutable object

<?php
$start = new DateTime('2026-01-15 09:00:00');
$end = clone $start;
$end->modify('+1 day');
?>
- `$start` = `<?= $start->format('Y-m-d H:i:s') ?>`
- `$end` = `<?= $end->format('Y-m-d H:i:s') ?>`

## `DateTimeImmutable` (preferred)

<?php
$start = new DateTimeImmutable('2026-01-15 09:00:00');
$end = $start->modify('+1 day');
?>
- `$start` = `<?= $start->format('Y-m-d H:i:s') ?>`
- `$end` = `<?= $end->format('Y-m-d H:i:s') ?>`
- `modify()` returned a new object; `$start` is unchanged.
