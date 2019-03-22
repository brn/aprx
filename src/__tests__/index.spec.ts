/**
 * The MIT License (MIT)
 * Copyright (c) Taketoshi Aono
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview
 * @author Taketoshi Aono
 */

import aprx from '../index';
import * as assert from 'power-assert';
import * as nodeAssert from 'assert';

describe('index.ts', () => {
  describe('aprx', () => {
    it('should create operationable promised array', async () => {
      const value = aprx(Promise.resolve([1, 2, 3]));
      const result = await value.map(v => v.toString()).filter(v => v !== '2');
      nodeAssert.deepStrictEqual(result, ['1', '3']);
    });

    it('should create operationable promised object', async () => {
      const value = aprx(Promise.resolve({ a: 1, b: 2, c: 3 }));
      const a = await value.a;
      const b = await value.b;
      const c = await value.c;
      assert.strictEqual(a, 1);
      assert.strictEqual(b, 2);
      assert.strictEqual(c, 3);
    });

    it('should resolve nested promise', async () => {
      const value = await Promise.all(
        await aprx(Promise.resolve([1, 2])).map(v => Promise.resolve(v)),
      );
      nodeAssert.deepStrictEqual(value, [1, 2]);
    });

    it('should create Constructible object', async () => {
      const C: any = aprx(Promise.resolve(class X {}));
      const a = await new C();
      assert.ok(a instanceof C);
    });

    it('should check stringified', async () => {
      const value = aprx(Promise.resolve([1, 2, 3]));
      assert.strictEqual(`${value.map}`, '[object Promise]');
      assert.strictEqual(`${value.filter}`, '[object Promise]');
    });

    it('should accept for-of', async () => {
      const values = [1, 2, 3];
      const value = aprx(Promise.resolve(values));
      let index = 0;
      for (const v of await value) {
        assert.strictEqual(values[index++], v);
      }
    });

    it('should accept async for-of', async () => {
      const expectations = [1, 2, 3];
      const values = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ];
      const value = aprx(Promise.resolve(values));
      let index = 0;
      for await (const v of await value) {
        assert.strictEqual(expectations[index++], v);
      }
    });

    it('should return @keys', async () => {
      const value = aprx(Promise.resolve({ a: 1, b: 2, c: 3 }));
      const keys = await aprx.keys(value);
      nodeAssert.deepStrictEqual(keys, ['a', 'b', 'c']);
    });

    it('should return @entries', async () => {
      const value = aprx(Promise.resolve({ a: 1, b: 2, c: 3 }));
      const entries = await aprx.entries(value);
      nodeAssert.deepStrictEqual(entries, [['a', 1], ['b', 2], ['c', 3]]);
    });

    it('should return @values', async () => {
      const value = aprx(Promise.resolve({ a: 1, b: 2, c: 3 }));
      const entries = await aprx.values(value);
      nodeAssert.deepStrictEqual(entries, [1, 2, 3]);
    });

    it('should return @assign', async () => {
      const value = aprx(Promise.resolve({ a: 1, b: 2, c: 3 }));
      const ret = await aprx.assign(value, { d: 1, e: 1 });
      nodeAssert.deepStrictEqual(ret, { a: 1, b: 2, c: 3, d: 1, e: 1 });
    });
  });
});
