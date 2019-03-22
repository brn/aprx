"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var _a, _b;
/**
 * Process object
 */
var process = (function () {
    var PROCESS = { env: { NODE_ENV: 'production' } };
    return ((function () {
        if (typeof window === 'object') {
            return window['process'];
        }
        else if (typeof global === 'object') {
            return global['process'];
        }
        return null;
    })() || PROCESS);
})();
/**
 * Flag specified bit.
 * @param flags Bit values.
 * @param bit Bit.
 */
function markBit(flags, bit) {
    return flags | bit;
}
/**
 * Return true if bit marked.
 */
function isBitMarked(flags, bit) {
    return (flags & bit) === bit;
}
var PropertyBits;
(function (PropertyBits) {
    PropertyBits[PropertyBits["IS_CALL"] = 1] = "IS_CALL";
    PropertyBits[PropertyBits["IS_SET"] = 2] = "IS_SET";
})(PropertyBits || (PropertyBits = {}));
/**
 * Property representation.
 */
var Property = /** @class */ (function () {
    function Property(name, previousProperty) {
        if (previousProperty === void 0) { previousProperty = null; }
        this.name = name;
        this.previousProperty = previousProperty;
        /**
         * True if this property used as function.
         */
        this.flags = 0;
        /**
         * If call or apply is used, that context is stored.
         */
        this.valueOrThis = null;
        /**
         * If isCall is true, arguments list is stored.
         */
        this.argumentsList = [];
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
    Property.prototype.access = function (context, _a) {
        var strict = _a.strict, onNotExists = _a.onNotExists;
        var _b;
        if (this.name === 'new') {
            return new ((_b = context).bind.apply(_b, [void 0].concat(this.argumentsList)))();
        }
        if (!(this.name in context)) {
            if (onNotExists) {
                return onNotExists(this.name, context);
            }
            else if (strict) {
                throw new Error(this.name.toString() + " is not exists in target object(" + context + ")\n" + this.stack);
            }
        }
        if (isBitMarked(this.flags, PropertyBits.IS_CALL)) {
            return context[this.name].apply(this.valueOrThis || context, this.argumentsList);
        }
        else if (isBitMarked(this.flags, PropertyBits.IS_SET)) {
            return (context[this.name] = this.valueOrThis);
        }
        return context[this.name];
    };
    /**
     * Mark this property as called.
     * @param thisArgs Context value.
     * @param argumentsList Parameter list.
     */
    Property.prototype.markAsCall = function (thisArgs, argumentsList) {
        this.flags = markBit(this.flags, PropertyBits.IS_CALL);
        this.valueOrThis = thisArgs;
        this.argumentsList = argumentsList;
    };
    Property.prototype.markAsSet = function (value) {
        this.flags = markBit(this.flags, PropertyBits.IS_SET);
        this.valueOrThis = value;
    };
    Property.prototype.isCall = function () {
        return isBitMarked(this.flags, PropertyBits.IS_CALL);
    };
    Property.prototype.getValueOrThis = function () {
        return this.valueOrThis;
    };
    Property.prototype.getArgumentsList = function () {
        return this.argumentsList;
    };
    return Property;
}());
var PropertyAccessor = /** @class */ (function () {
    function PropertyAccessor(context, option) {
        this.context = context;
        this.option = option;
        this.properties = [];
    }
    /**
     * Create new PropertyAccessor with new property access.
     * @param property A property name.
     * @returns New PropertyAccessor instance.
     */
    PropertyAccessor.prototype.push = function (property) {
        return this.clone(new Property(property, this.getPreviousProperty()));
    };
    /**
     * Create new PropertyAccessor with new operator access.
     * @returns New PropertyAccessor instance.
     */
    PropertyAccessor.prototype.construct = function () {
        return this.clone(new Property('new', this.getPreviousProperty()));
    };
    /**
     *
     */
    PropertyAccessor.prototype.set = function (property, value) {
        var p = new Property(property, this.getPreviousProperty());
        p.markAsSet(value);
        return this.clone(p);
    };
    PropertyAccessor.prototype.apply = function (thisArgs, argumentsList) {
        var target = this.properties[this.properties.length - 1];
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
    };
    PropertyAccessor.of = function (context, option) {
        function base() { }
        var a = new PropertyAccessor(context, option);
        for (var key in a) {
            base[key] = a[key];
        }
        return base;
    };
    PropertyAccessor.prototype.getPreviousProperty = function () {
        return this.properties[this.properties.length - 1];
    };
    PropertyAccessor.prototype.peelPromise = function (property, thisArgs, argumentsList) {
        var _this = this;
        return property.name === 'then'
            ? this.context.then(function (context) {
                return argumentsList[0].call(thisArgs, _this.properties.reduce(function (context, property) {
                    if (context !== null && context !== undefined) {
                        return context.then
                            ? context.then(function (context) {
                                return property.access(context, _this.option);
                            })
                            : property.access(context, _this.option);
                    }
                    return context;
                }, context));
            })
            : this.context.catch.call(thisArgs || this.context, argumentsList[0]);
    };
    PropertyAccessor.prototype.callSpecialFunction = function (target, thisArgs, argumentsList) {
        var _this = this;
        this.properties.pop();
        var result;
        if (target.name === Symbol.asyncIterator) {
            var peeled_1 = null;
            return {
                finish: true,
                result: {
                    next: function () {
                        if (peeled_1) {
                            return Promise.resolve(peeled_1.next());
                        }
                        return _this.context.then(function (v) {
                            if (!v[Symbol.iterator]) {
                                throw new Error("Symbol.asyncIterator is not exists in " + _this.context);
                            }
                            return (peeled_1 = v[Symbol.iterator]()).next();
                        });
                    },
                },
            };
        }
        if (!this.context[target.name]) {
            result = this.context[FALL_BACK[target.name]].apply(thisArgs || this.context, argumentsList);
        }
        else {
            result = this.context[target.name].apply(thisArgs || this.context, argumentsList);
        }
        return { finish: true, result: result };
    };
    PropertyAccessor.prototype.clone = function (prop) {
        var base = function base() { };
        for (var key in this) {
            base[key] = this[key];
        }
        base.properties = this.properties.concat([prop]);
        return base;
    };
    return PropertyAccessor;
}());
var FALL_BACK = (_a = {},
    _a[Symbol.toPrimitive] = 'toString',
    _a);
var SPECIAL_FUNCTIONS = (_b = {
        toString: 1
    },
    _b[Symbol.asyncIterator] = 1,
    _b[Symbol.toPrimitive] = 1,
    _b[Symbol.toStringTag] = 1,
    _b.valueOf = 1,
    _b);
var PROMISE_FINALYZER = {
    then: 1,
    catch: 1,
};
var IS_APRX = Symbol('@@__aprx__');
var APRX_GET = Symbol('@@__aprxGet__');
/**
 * @example
 * const array = aprx(getPromiseResult())
 * await array.map(() => {...}).filter(() => {...});
 */
var aprx = function (promise, option) {
    if (option === void 0) { option = { strict: true }; }
    var propertyAccessor = PropertyAccessor.of(promise, option);
    var handler = {
        get: function (target, prop, receiver) {
            if (prop === IS_APRX) {
                return true;
            }
            if (prop === APRX_GET) {
                return target;
            }
            return new Proxy(target.push(prop), handler);
        },
        set: function (target, prop, value) {
            return new Proxy(target.set(prop, value), handler);
        },
        apply: function (target, thisArgs, argumentsList) {
            var ret = target.apply(thisArgs[IS_APRX] ? null : thisArgs, argumentsList);
            return ret.finish ? ret.result : new Proxy(ret.result, handler);
        },
        construct: function (target, argumentsList) {
            return new Proxy(target.construct(), handler);
        },
        isExtensible: function () {
            return false;
        },
        getOwnPropertyDescriptor: function () {
            throw new Error("Aprx cannot handle 'getOwnPropertyDescripor' operation.");
        },
        defineProperty: function () {
            throw new Error("Aprx cannot handle 'defineProperty' operation.");
        },
        ownKeys: function () {
            throw new Error('Aprx cannot handle own keys handler.');
        },
        has: function () {
            throw new Error("Aprx cannot handle 'in' operations.");
        },
        getPrototypeOf: function () {
            throw new Error("Aprx cannot handle 'getPrototypeOf' operations.");
        },
        setPrototypeOf: function () {
            throw new Error("Aprx cannot handle 'setPrototypeOf' operations.");
        },
    };
    return new Proxy(propertyAccessor, handler);
};
exports.default = Object.assign(aprx, {
    keys: function (aprxObject) {
        return aprx(aprxObject.then(function (c) { return Object.keys(c); }));
    },
    values: function (context) {
        return aprx(context.then(function (c) { return Object.values(c); }));
    },
    entries: function (context) {
        return aprx(context.then(function (c) { return Object.entries(c); }));
    },
    assign: function (context) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return aprx(context.then(function (c) { return Object.assign.apply(Object, [c].concat(args)); }));
    },
    preventExtensions: function (context) {
        return aprx(context.then(function (c) { return Object.preventExtensions(c); }));
    },
    freeze: function (context) {
        return aprx(context.then(function (c) { return Object.freeze(c); }));
    },
    isExtensible: function (context) {
        return aprx(context.then(function (c) { return Object.isExtensible(c); }));
    },
    seal: function (context) {
        return aprx(context.then(function (c) { return Object.seal(c); }));
    },
    isFrozen: function (context) {
        return aprx(context.then(function (c) { return Object.isFrozen(c); }));
    },
    is: function (context, target) {
        return aprx(context.then(function (c) { return Object.is(c, target); }));
    },
    isSealed: function (context) {
        return aprx(context.then(function (c) { return Object.isSealed(c); }));
    },
    getOwnPropertyNames: function (context) {
        return aprx(context.then(function (c) { return Object.getOwnPropertyNames(c); }));
    },
    getOwnPropertyDescriptor: function (context, name) {
        return aprx(context.then(function (c) { return Object.getOwnPropertyDescriptor(c, name); }));
    },
    getOwnPropertySymbols: function (context) {
        return aprx(context.then(function (c) { return Object.getOwnPropertySymbols(c); }));
    },
    getPrototypeOf: function (context) {
        return aprx(context.then(function (c) { return Object.getPrototypeOf(c); }));
    },
    setPrototypeOf: function (context, p) {
        return aprx(context.then(function (c) { return Object.setPrototypeOf(c, p); }));
    },
    geetOwnPropertySymbols: function (context) {
        return aprx(context.then(function (c) { return Object.getOwnPropertySymbols(c); }));
    },
    getOwnPropertyDescriptors: function (context) {
        return aprx(context.then(function (c) { return Object.getOwnPropertyDescriptors(c); }));
    },
    defineProperty: function (context, name, descriptor) {
        return aprx(context.then(function (c) { return Object.defineProperty(c, name, descriptor); }));
    },
    defineProperties: function (context, descriptors) {
        return aprx(context.then(function (c) { return Object.defineProperties(c, descriptors); }));
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRzs7O0FBOExIOztHQUVHO0FBQ0gsSUFBTSxPQUFPLEdBQW9DLENBQUM7SUFDaEQsSUFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQztJQUNwRCxPQUFPLENBQ0wsQ0FBQztRQUNDLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzlCLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzFCO2FBQU0sSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDckMsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxFQUFFLElBQUksT0FBTyxDQUNoQixDQUFDO0FBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQWNMOzs7O0dBSUc7QUFDSCxTQUFTLE9BQU8sQ0FBQyxLQUFhLEVBQUUsR0FBVztJQUN6QyxPQUFPLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDckIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxXQUFXLENBQUMsS0FBYSxFQUFFLEdBQVc7SUFDN0MsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUM7QUFDL0IsQ0FBQztBQUVELElBQUssWUFHSjtBQUhELFdBQUssWUFBWTtJQUNmLHFEQUFhLENBQUE7SUFDYixtREFBWSxDQUFBO0FBQ2QsQ0FBQyxFQUhJLFlBQVksS0FBWixZQUFZLFFBR2hCO0FBRUQ7O0dBRUc7QUFDSDtJQXFCRSxrQkFDa0IsSUFBcUIsRUFDcEIsZ0JBQXdDO1FBQXhDLGlDQUFBLEVBQUEsdUJBQXdDO1FBRHpDLFNBQUksR0FBSixJQUFJLENBQWlCO1FB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