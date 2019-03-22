# Aprx

## What's this?

Aprx is proxied wrapper object for Promise.

## How to install

__npm__
```
npm install aprx -S
```

__yarn__
```
yarn add aprx
```

## How to use

### Basics

__Call function__

```javascript
const aprx = require('aprx');

// e.g. fetch will return below object.
// {
//   isValid: boolean,
//   value: number
// }[]
const result = await aprx(fetch('https://getarray.com'))
                      .json()
                      .filter(result => result.isValid)
                      .map(result => result.value + 1);
console.log(result) // [{isValid: true, value: ...}, ...]
```

__Property access__

```javascript
const aprx = require('aprx');

const x = await aprx(Promise.resolve({x: 100, y: 100})).x
console.log(x) // 100
```

### Specials

__construct__

```javascript
const aprx = require('aprx');

const C = aprx(Promise.resolve(class X {}));
const c = await new C();
assert.ok(c instanceof C); // true
```

__for-of__

```javascript
const aprx = require('aprx');

const values = [1, 2, 3];
const value = aprx(Promise.resolve(values));
let index = 0;
for await (const v of value) {
  assert.strictEqual(values[index++], v); // true
}
```

__Object functions__

keys

```
const wrapper = aprx(Promise.resolve({a: 1, b: 2, c: 3}));
const keys = await aprx.keys(wrapper);
console.log(keys) // ['a', 'b', 'c']
```

values

```
const wrapper = aprx(Promise.resolve({a: 1, b: 2, c: 3}));
const keys = await aprx.values(wrapper);
console.log(keys) // [1, 2, 3]
```

entries

```
const wrapper = aprx(Promise.resolve({a: 1, b: 2, c: 3}));
const keys = await aprx.entries(wrapper);
console.log(keys) // [['a', 1], ['b', 2], ['c', 3]]
```

assign

```
const wrapper = aprx(Promise.resolve({a: 1, b: 2, c: 3}));
const assigned = await aprx.assign(wrapper, {d: 4});
console.log(assigned) // {a: 1, b: 2, c: 3, d: 4}
```

and below functions are supported.

```
preventExtensions
freeze
isExtensible
seal
isFrozen
is
isSealed
getOwnPropertyNames
getOwnPropertyDescriptor
getOwnPropertySymbols
getPrototypeOf
setPrototypeOf
gettOwnPropertySymbols
getOwnPropertyDescriptors
defineProperty
defineProperties
```
