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

type UnPromisify<T> = T extends Promise<infer A> ? A : T;
type Objects = Pick<
  ObjectConstructor,
  {
    [P in keyof ObjectConstructor]: P extends
      | 'create'
      | 'prototype'
      | 'constructor'
      | 'valueOf'
      | 'toString'
      ? never
      : ObjectConstructor[P] extends (...args: any[]) => any ? P : never
  }[keyof ObjectConstructor]
>;

/**
 * Aprxed Value type.
 * Aprxed promise behave like normal object.
 * So we convert all method and properties return value of T to Aprx<ReturnType>.
 */
export type Aprx<T> = {
  [Symbol.asyncIterator](): {
    next(): Promise<IteratorResult<T extends Array<infer R> ? R : T>>;
  };
} & {
  [P in keyof T]: T[P] extends () => infer Ia
    ? <A = Ia>() => Aprx<UnPromisify<A>>
    : T[P] extends (a: infer Ia) => infer Ib
      ? <A = Ia, B = Ib>(a: A) => Aprx<UnPromisify<B>>
      : T[P] extends (a: infer Ia, b: infer Ib) => infer Ic
        ? <A = Ia, B = Ib, C = Ic>(a: A, b: B) => Aprx<UnPromisify<C>>
        : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic) => infer Id
          ? <A = Ia, B = Ib, C = Ic, D = Id>(
              a: A,
              b: B,
              c: C,
            ) => Aprx<UnPromisify<D>>
          : T[P] extends (
              a: infer Ia,
              b: infer Ib,
              c: infer Ic,
              d: infer Id,
            ) => infer Ie
            ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie>(
                a: A,
                b: B,
                c: C,
                d: D,
              ) => Aprx<UnPromisify<E>>
            : T[P] extends (
                a: infer Ia,
                b: infer Ib,
                c: infer Ic,
                d: infer Id,
                e: infer Ie,
              ) => infer If
              ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If>(
                  a: A,
                  b: B,
                  c: C,
                  d: D,
                  e: E,
                ) => Aprx<UnPromisify<F>>
              : T[P] extends (
                  a: infer Ia,
                  b: infer Ib,
                  c: infer Ic,
                  d: infer Id,
                  e: infer Ie,
                  f: infer If,
                ) => infer Ig
                ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If, G = Ig>(
                    a: A,
                    b: B,
                    c: C,
                    d: D,
                    e: E,
                    f: F,
                  ) => Aprx<UnPromisify<G>>
                : T[P] extends (
                    a: infer Ia,
                    b: infer Ib,
                    c: infer Ic,
                    d: infer Id,
                    e: infer Ie,
                    f: infer If,
                    h: infer Ih,
                  ) => infer Ig
                  ? <
                      A = Ia,
                      B = Ib,
                      C = Ic,
                      D = Id,
                      E = Ie,
                      F = If,
                      G = Ig,
                      H = Ih
                    >(
                      a: A,
                      b: B,
                      c: C,
                      d: D,
                      e: E,
                      f: F,
                      g: G,
                    ) => Aprx<UnPromisify<H>>
                  : T[P] extends (
                      a: infer Ia,
                      b: infer Ib,
                      c: infer Ic,
                      d: infer Id,
                      e: infer Ie,
                      f: infer If,
                      h: infer Ih,
                      i: infer Ii,
                    ) => infer Ig
                    ? <
                        A = Ia,
                        B = Ib,
                        C = Ic,
                        D = Id,
                        E = Ie,
                        F = If,
                        G = Ig,
                        H = Ih,
                        I = Ii
                      >(
                        a: A,
                        b: B,
                        c: C,
                        d: D,
                        e: E,
                        f: F,
                        g: G,
                        i: H,
                      ) => Aprx<UnPromisify<I>>
                    : T[P] extends (
                        a: infer Ia,
                        b: infer Ib,
                        c: infer Ic,
                        d: infer Id,
                        e: infer Ie,
                        f: infer If,
                        h: infer Ih,
                        i: infer Ii,
                        j: infer Ij,
                      ) => infer Ig
                      ? <
                          A = Ia,
                          B = Ib,
                          C = Ic,
                          D = Id,
                          E = Ie,
                          F = If,
                          G = Ig,
                          H = Ih,
                          I = Ii,
                          J = Ij
                        >(
                          a: A,
                          b: B,
                          c: C,
                          d: D,
                          e: E,
                          f: F,
                          g: G,
                          h: H,
                          i: I,
                        ) => Aprx<UnPromisify<J>>
                      : Aprx<T[P]>
} &
  (T extends Array<infer V>
    ? {
        [P in keyof Array<V>]: Array<V>[P] extends (...a: infer X) => infer R
          ? (...a: X) => Aprx<R>
          : Aprx<Array<V>[P]>
      }
    : {}) &
  Promise<T>;

type AprxConstructor = {
  <T>(promise: Promise<T>, option?: AprxOption<T>): Aprx<T>;
} & {
  [P in keyof Objects]: Objects[P] extends (base: any, ...a: infer A) => infer R
    ? <T>(context: Aprx<T>, ...a: A) => Aprx<R>
    : never
};

/**
 * Process object
 */
const process: { env: { [key: string]: any } } = (function() {
  const PROCESS = { env: { NODE_ENV: 'production' } };
  return (
    (() => {
      if (typeof window === 'object') {
        return window['process'];
      } else if (typeof global === 'object') {
        return global['process'];
      }
      return null;
    })() || PROCESS
  );
})();

/**
 * aprx function options.
 */
interface AprxOption<T> {
  /**
   * If strict is true, aprx check unexists method or property.
   */
  strict?: boolean;

  onNotExists?(property: string | symbol, target: T): void;
}

/**
 * Flag specified bit.
 * @param flags Bit values.
 * @param bit Bit.
 */
function markBit(flags: number, bit: number) {
  return flags | bit;
}

/**
 * Return true if bit marked.
 */
function isBitMarked(flags: number, bit: number) {
  return (flags & bit) === bit;
}

enum PropertyBits {
  IS_CALL = 0x1,
  IS_SET = 0x2,
}

/**
 * Property representation.
 */
class Property {
  /**
   * True if this property used as function.
   */
  private flags = 0;

  /**
   * If call or apply is used, that context is stored.
   */
  private valueOrThis: any = null;

  /**
   * If isCall is true, arguments list is stored.
   */
  private argumentsList: any[] = [];

  /**
   * Error stack of called timing.
   */
  private stack?: string;

  constructor(
    public readonly name: string | symbol,
    private readonly previousProperty: Property | null = null,
  ) {
    if (process.env.NODE_ENV !== 'production') {
      this.stack = new Error().stack;
    }
  }

  /**
   * Access to this property.
   * @param context Target object.
   * @param strict Whether strictly check property existence or not.
   * @param onNotExists Called when property not exits in context.
   * @returns Property return value.
   */
  public access<T>(context: T, { strict, onNotExists }: AprxOption<T>): any {
    if (this.name === 'new') {
      return new (context as any)(...this.argumentsList);
    }

    if (!(this.name in context)) {
      if (onNotExists) {
        return onNotExists(this.name, context);
      } else if (strict) {
        throw new Error(
          `${this.name.toString()} is not exists in target object(${context})\n${
            this.stack
          }`,
        );
      }
    }

    if (isBitMarked(this.flags, PropertyBits.IS_CALL)) {
      return context[this.name].apply(
        this.valueOrThis || context,
        this.argumentsList,
      );
    } else if (isBitMarked(this.flags, PropertyBits.IS_SET)) {
      return (context[this.name] = this.valueOrThis);
    }

    return context[this.name];
  }

  /**
   * Mark this property as called.
   * @param thisArgs Context value.
   * @param argumentsList Parameter list.
   */
  public markAsCall(thisArgs: any, argumentsList: any[]) {
    this.flags = markBit(this.flags, PropertyBits.IS_CALL);
    this.valueOrThis = thisArgs;
    this.argumentsList = argumentsList;
  }

  public markAsSet(value: any) {
    this.flags = markBit(this.flags, PropertyBits.IS_SET);
    this.valueOrThis = value;
  }

  public isCall() {
    return isBitMarked(this.flags, PropertyBits.IS_CALL);
  }

  public getValueOrThis() {
    return this.valueOrThis;
  }

  public getArgumentsList() {
    return this.argumentsList;
  }
}

class PropertyAccessor<T> {
  private properties: Property[] = [];

  constructor(private context: Promise<T>, private option: AprxOption<T>) {}

  /**
   * Create new PropertyAccessor with new property access.
   * @param property A property name.
   * @returns New PropertyAccessor instance.
   */
  public push(property: string) {
    return this.clone(new Property(property, this.getPreviousProperty()));
  }

  /**
   * Create new PropertyAccessor with new operator access.
   * @returns New PropertyAccessor instance.
   */
  public construct() {
    return this.clone(new Property('new', this.getPreviousProperty()));
  }

  /**
   *
   */
  public set(property: string, value: any) {
    const p = new Property(property, this.getPreviousProperty());
    p.markAsSet(value);
    return this.clone(p);
  }

  public apply(
    thisArgs: any,
    argumentsList: any[],
  ): { finish: boolean; result: any } {
    const target = this.properties[this.properties.length - 1];
    if (PROMISE_FINALYZER[target.name]) {
      this.properties.pop();
      return {
        finish: true,
        result: this.peelPromise(target, thisArgs, argumentsList),
      };
    }

    if (SPECIAL_FUNCTIONS[target.name]) {
      return this.callSpecialFunction(target, thisArgs, argumentsList);
    }

    target.markAsCall(thisArgs, argumentsList);
    return { finish: false, result: this };
  }

  public static of<T>(
    context: Promise<T>,
    option: AprxOption<T>,
  ): PropertyAccessor<T> {
    function base() {}
    const a = new PropertyAccessor(context, option);
    for (const key in a) {
      base[key] = a[key];
    }
    return base as any;
  }

  private getPreviousProperty() {
    return this.properties[this.properties.length - 1];
  }

  private peelPromise(property: Property, thisArgs: any, argumentsList: any[]) {
    return property.name === 'then'
      ? this.context.then(context => {
          return argumentsList[0].call(
            thisArgs,
            this.properties.reduce((context, property) => {
              if (context !== null && context !== undefined) {
                return (context as any).then
                  ? (context as any).then(context =>
                      property.access(context, this.option),
                    )
                  : property.access(context, this.option);
              }
              return context;
            }, context),
          );
        })
      : this.context.catch.call(thisArgs || this.context, argumentsList[0]);
  }

  private callSpecialFunction(
    target: Property,
    thisArgs: any,
    argumentsList: any[],
  ) {
    this.properties.pop();
    let result: any;
    if (target.name === Symbol.asyncIterator) {
      let peeled: Iterator<any> | null = null;
      return {
        finish: true,
        result: {
          next: () => {
            if (peeled) {
              return Promise.resolve(peeled.next());
            }
            return this.context.then(v => {
              if (!v[Symbol.iterator]) {
                throw new Error(
                  `Symbol.asyncIterator is not exists in ${this.context}`,
                );
              }
              return (peeled = v[Symbol.iterator]()).next();
            });
          },
        },
      };
    }
    if (!this.context[target.name]) {
      result = this.context[FALL_BACK[target.name]].apply(
        thisArgs || this.context,
        argumentsList,
      );
    } else {
      result = this.context[target.name].apply(
        thisArgs || this.context,
        argumentsList,
      );
    }
    return { finish: true, result };
  }

  private clone(prop: Property): PropertyAccessor<T> {
    const base: any = function base() {};
    for (const key in this) {
      base[key] = this[key];
    }
    base.properties = this.properties.concat([prop]);
    return base;
  }
}

const FALL_BACK = {
  [Symbol.toPrimitive]: 'toString',
};
const SPECIAL_FUNCTIONS = {
  toString: 1,
  [Symbol.asyncIterator]: 1,
  [Symbol.toPrimitive]: 1,
  [Symbol.toStringTag]: 1,
  valueOf: 1,
};
const PROMISE_FINALYZER = {
  then: 1,
  catch: 1,
};
const IS_APRX = Symbol('@@__aprx__');
const APRX_GET = Symbol('@@__aprxGet__');

/**
 * @example
 * const array = aprx(getPromiseResult())
 * await array.map(() => {...}).filter(() => {...});
 */
const aprx = <T>(
  promise: Promise<T>,
  option: AprxOption<T> = { strict: true },
): Aprx<T> => {
  const propertyAccessor = PropertyAccessor.of(promise, option);
  const handler = {
    get(target: PropertyAccessor<T>, prop: string | symbol, receiver) {
      if (prop === IS_APRX) {
        return true;
      }
      if (prop === APRX_GET) {
        return target;
      }
      return new Proxy(target.push(prop as string), handler);
    },
    set(target: PropertyAccessor<T>, prop: string, value: any) {
      return new Proxy(target.set(prop, value), handler);
    },
    apply(target: PropertyAccessor<T>, thisArgs: any, argumentsList: any[]) {
      const ret = target.apply(
        thisArgs[IS_APRX] ? null : thisArgs,
        argumentsList,
      );
      return ret.finish ? ret.result : new Proxy(ret.result, handler);
    },
    construct(target, argumentsList) {
      return new Proxy(target.construct(), handler);
    },
    isExtensible() {
      return false;
    },
    getOwnPropertyDescriptor() {
      throw new Error(
        "Aprx cannot handle 'getOwnPropertyDescripor' operation.",
      );
    },
    defineProperty() {
      throw new Error("Aprx cannot handle 'defineProperty' operation.");
    },
    ownKeys() {
      throw new Error('Aprx cannot handle own keys handler.');
    },
    has() {
      throw new Error("Aprx cannot handle 'in' operations.");
    },
    getPrototypeOf() {
      throw new Error("Aprx cannot handle 'getPrototypeOf' operations.");
    },
    setPrototypeOf() {
      throw new Error("Aprx cannot handle 'setPrototypeOf' operations.");
    },
  };

  return new Proxy(propertyAccessor, handler) as any;
};

export default Object.assign(aprx, {
  keys<T>(aprxObject: Aprx<T>): Aprx<string[]> {
    return aprx(aprxObject.then(c => Object.keys(c)));
  },
  values<T>(context: Aprx<T>): Aprx<any[]> {
    return aprx(context.then(c => Object.values(c)));
  },
  entries<T>(context: Aprx<T>): Aprx<[string, any][]> {
    return aprx(context.then(c => Object.entries(c)));
  },
  assign<T>(context: Aprx<T>, ...args): Aprx<any> {
    return aprx(context.then(c => Object.assign(c as any, ...args)));
  },
  preventExtensions<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.preventExtensions(c)));
  },
  freeze<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.freeze(c)));
  },
  isExtensible<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.isExtensible(c)));
  },
  seal<T>(context: Aprx<T>): Aprx<T> {
    return aprx(context.then(c => Object.seal(c)));
  },
  isFrozen<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.isFrozen(c)));
  },
  is<T>(context: Aprx<T>, target: any) {
    return aprx(context.then(c => Object.is(c, target)));
  },
  isSealed<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.isSealed(c)));
  },
  getOwnPropertyNames<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.getOwnPropertyNames(c)));
  },
  getOwnPropertyDescriptor<T>(context: Aprx<T>, name) {
    return aprx(context.then(c => Object.getOwnPropertyDescriptor(c, name)));
  },
  getOwnPropertySymbols<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.getOwnPropertySymbols(c)));
  },
  getPrototypeOf<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.getPrototypeOf(c)));
  },
  setPrototypeOf<T>(context: Aprx<T>, p) {
    return aprx(context.then(c => Object.setPrototypeOf(c, p)));
  },
  geetOwnPropertySymbols<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.getOwnPropertySymbols(c)));
  },
  getOwnPropertyDescriptors<T>(context: Aprx<T>) {
    return aprx(context.then(c => Object.getOwnPropertyDescriptors(c)));
  },
  defineProperty<T>(context: Aprx<T>, name, descriptor) {
    return aprx(context.then(c => Object.defineProperty(c, name, descriptor)));
  },
  defineProperties<T>(context: Aprx<T>, descriptors) {
    return aprx(context.then(c => Object.defineProperties(c, descriptors)));
  },
}) as AprxConstructor;
