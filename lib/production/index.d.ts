declare type UnPromisify<T> = T extends Promise<infer A> ? A : T;
declare type Objects = Pick<ObjectConstructor, {
    [P in keyof ObjectConstructor]: P extends 'create' | 'prototype' | 'constructor' | 'valueOf' | 'toString' ? never : ObjectConstructor[P] extends (...args: any[]) => any ? P : never;
}[keyof ObjectConstructor]>;
export declare type Aprx<T> = {
    [Symbol.asyncIterator](): {
        next(): Promise<IteratorResult<T extends Array<infer R> ? R : T>>;
    };
} & {
    [P in keyof T]: T[P] extends () => infer Ia ? <A = Ia>() => Aprx<UnPromisify<A>> : T[P] extends (a: infer Ia) => infer Ib ? <A = Ia, B = Ib>(a: A) => Aprx<UnPromisify<B>> : T[P] extends (a: infer Ia, b: infer Ib) => infer Ic ? <A = Ia, B = Ib, C = Ic>(a: A, b: B) => Aprx<UnPromisify<C>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic) => infer Id ? <A = Ia, B = Ib, C = Ic, D = Id>(a: A, b: B, c: C) => Aprx<UnPromisify<D>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic, d: infer Id) => infer Ie ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie>(a: A, b: B, c: C, d: D) => Aprx<UnPromisify<E>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic, d: infer Id, e: infer Ie) => infer If ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If>(a: A, b: B, c: C, d: D, e: E) => Aprx<UnPromisify<F>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic, d: infer Id, e: infer Ie, f: infer If) => infer Ig ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If, G = Ig>(a: A, b: B, c: C, d: D, e: E, f: F) => Aprx<UnPromisify<G>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic, d: infer Id, e: infer Ie, f: infer If, h: infer Ih) => infer Ig ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If, G = Ig, H = Ih>(a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Aprx<UnPromisify<H>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic, d: infer Id, e: infer Ie, f: infer If, h: infer Ih, i: infer Ii) => infer Ig ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If, G = Ig, H = Ih, I = Ii>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, i: H) => Aprx<UnPromisify<I>> : T[P] extends (a: infer Ia, b: infer Ib, c: infer Ic, d: infer Id, e: infer Ie, f: infer If, h: infer Ih, i: infer Ii, j: infer Ij) => infer Ig ? <A = Ia, B = Ib, C = Ic, D = Id, E = Ie, F = If, G = Ig, H = Ih, I = Ii, J = Ij>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Aprx<UnPromisify<J>> : Aprx<T[P]>;
} & (T extends Array<infer V> ? {
    [P in keyof Array<V>]: Array<V>[P] extends (...a: infer X) => infer R ? (...a: X) => Aprx<R> : Aprx<Array<V>[P]>;
} : {}) & Promise<T>;
declare type AprxConstructor = {
    <T>(promise: Promise<T>, option?: AprxOption<T>): Aprx<T>;
} & {
    [P in keyof Objects]: Objects[P] extends (base: any, ...a: infer A) => infer R ? <T>(context: Aprx<T>, ...a: A) => Aprx<R> : never;
};
interface AprxOption<T> {
    strict?: boolean;
    onNotExists?(property: string | symbol, target: T): void;
}
declare const _default: AprxConstructor;
export default _default;
