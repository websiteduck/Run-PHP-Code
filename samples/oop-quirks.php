<?php
// @run-php-code output=markdown
?>
# OOP Quirks

1. `self::` is early-bound to the class where it is written; `static::` is late-bound to the class that was actually called (LSB).
2. `clone` is a **shallow** copy — nested objects are still shared.

## `self::` vs `static::`

<?php
class ParentGreeter
{
  public static function who()
  {
    return 'ParentGreeter';
  }

  public static function withSelf()
  {
    return self::who();
  }

  public static function withStatic()
  {
    return static::who();
  }
}

class ChildGreeter extends ParentGreeter
{
  public static function who()
  {
    return 'ChildGreeter';
  }
}
?>
- `ChildGreeter::withSelf()` → **<?= ChildGreeter::withSelf() ?>**
- `ChildGreeter::withStatic()` → **<?= ChildGreeter::withStatic() ?>**
- `self::` sticks to `ParentGreeter`; `static::` uses `ChildGreeter`.

## `clone` is a shallow copy

<?php
class Address
{
  public $city;

  public function __construct($city)
  {
    $this->city = $city;
  }
}

class Person
{
  public $name;
  public $address;

  public function __construct($name, Address $address)
  {
    $this->name = $name;
    $this->address = $address;
  }
}

$alice = new Person('Alice', new Address('Chicago'));
$bob = clone $alice;
$bob->name = 'Bob';
$bob->address->city = 'Austin';
?>
- Alice's city: **<?= $alice->address->city ?>**
- Bob's city: **<?= $bob->address->city ?>**
- Name was copied, but `Address` is still the same object.

## Deep copy (clone nested object yourself)

<?php
$alice = new Person('Alice', new Address('Chicago'));
$bob = clone $alice;
$bob->name = 'Bob';
$bob->address = clone $alice->address;
$bob->address->city = 'Denver';
?>
- Alice's city: **<?= $alice->address->city ?>**
- Bob's city: **<?= $bob->address->city ?>**
