"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a, _b;
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
function markBit(flags, bit) {
    return flags | bit;
}
function isBitMarked(flags, bit) {
    return (flags & bit) === bit;
}
var PropertyBits;
(function (PropertyBits) {
    PropertyBits[PropertyBits["IS_CALL"] = 1] = "IS_CALL";
    PropertyBits[PropertyBits["IS_SET"] = 2] = "IS_SET";
})(PropertyBits || (PropertyBits = {}));
var Property = (function () {
    function Property(name, previousProperty) {
        if (previousProperty === void 0) { previousProperty = null; }
        this.name = name;
        this.previousProperty = previousProperty;
        this.flags = 0;
        this.valueOrThis = null;
        this.argumentsList = [];
        if (process.env.NODE_ENV !== 'production') {
            this.stack = new Error().stack;
        }
    }
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
var PropertyAccessor = (function () {
    function PropertyAccessor(context, option) {
        this.context = context;
        this.option = option;
        this.properties = [];
    }
    PropertyAccessor.prototype.push = function (property) {
        return this.clone(new Property(property, this.getPreviousProperty()));
    };
    PropertyAccessor.prototype.construct = function () {
        return this.clone(new Property('new', this.getPreviousProperty()));
    };
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
