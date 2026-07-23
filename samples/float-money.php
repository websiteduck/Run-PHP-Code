<?php
// @run-php-code output=markdown
?>
# Floats & Money

Floating-point numbers are binary approximations. Values like `0.1` cannot be represented exactly, so tiny rounding errors show up in arithmetic.

**Never use floats for money.** Prefer integer cents, or BCMath / Decimal with an appropriate scale. Integer cents still cannot store fractional cents (mills).

## Float problems

<?php
$a = 0.1 + 0.2;
?>
- `0.1 + 0.2` = `<?= var_export($a, true) ?>`
- Equal to `0.3`? **<?= $a === 0.3 ? 'yes' : 'no' ?>**

<?php
$total = 0.0;
for ($i = 0; $i < 10; $i++) {
  $total += 0.1;
}
?>
- Adding `0.1` ten times = `<?= var_export($total, true) ?>`
- Equal to `1.0`? **<?= $total === 1.0 ? 'yes' : 'no' ?>**

<?php
$cents = (int) (19.99 * 100);
?>
- `(int)(19.99 * 100)` = `<?= var_export($cents, true) ?>`
- Equal to `1999`? **<?= $cents === 1999 ? 'yes' : 'no' ?>**

## Integer cents limitation

Fuel prices often use tenths of a cent (mills), e.g. `$3.459/gal`. Whole cents only keep two decimal places.

<?php
$pricePerGallon = 3.459;
$priceAsCents = (int) round($pricePerGallon * 100);
?>
- `$3.459/gal` as integer cents = **<?= $priceAsCents ?>** (`$<?= number_format($priceAsCents / 100, 2) ?>`)
- The fractional cent is gone.

## BCMath

<?php if (!extension_loaded('bcmath')): ?>
> **BCMath is not installed.** Enable the `bcmath` extension to run exact decimal examples.
<?php else: ?>
<?php
$sum = bcadd('0.1', '0.2', 1);
?>
- `bcadd('0.1', '0.2', 1)` = `<?= $sum ?>`
- Equal to `0.3`? **<?= $sum === '0.3' ? 'yes' : 'no' ?>**

<?php
$bcTotal = '0';
for ($i = 0; $i < 10; $i++) {
  $bcTotal = bcadd($bcTotal, '0.1', 1);
}
?>
- Adding `'0.1'` ten times with `bcadd` = `<?= $bcTotal ?>`
- Equal to `1.0`? **<?= $bcTotal === '1.0' ? 'yes' : 'no' ?>**

<?php
$bcCents = bcmul('19.99', '100', 0);
?>
- `bcmul('19.99', '100', 0)` = `<?= $bcCents ?>`
- Equal to `1999`? **<?= $bcCents === '1999' ? 'yes' : 'no' ?>**

Scale 3 keeps the mill that integer cents could not store:

<?php
$bcLineTotal = bcmul('3.459', '10', 3);
?>
- `bcmul('3.459', '10', 3)` = `<?= $bcLineTotal ?>`
- Equal to `34.590`? **<?= $bcLineTotal === '34.590' ? 'yes' : 'no' ?>**
<?php endif; ?>
