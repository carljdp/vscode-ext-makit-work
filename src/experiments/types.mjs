'use strict';
//@ts-check

import * as util from 'util';
import * as assert from 'assert';

import lodash from 'lodash';
import { Socket } from 'net';


/** 
 * @typedef {Object} EsType
 * @property {Map<string, any>} value
 * @property {string[]} docs
 */

/** ECMAScript Language Built-in Types
 * @type {Record<string, EsType>}
 */
const EsType = {
    Undefined: {
        value: new Map([['undefined', undefined]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-undefined-type'
        ]
    },
    Null: {
        value: new Map([['null', null]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-null-type'
        ]
    },
    Boolean: {
        value: new Map([['false', false], ['true', true]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-boolean-type'
        ]
    },
    String: {
        value: new Map([['String', String]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-string-type'
        ]
    },
    Symbol: {
        value: new Map([['Symbol', Symbol]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-symbol-type'
        ]
    },
    Number: {
        value: new Map([['Number', Number]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type'
        ]
    },
    BigInt: {
        value: new Map([['BigInt', BigInt]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-bigint-type'
        ]
    },
    Object: {
        value: new Map([['Object', Object]]),
        docs: [
            'https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-object-type'
        ]
    }
};


// An Object is:
//  - a collection of uniquely identifyable properties

// A Property key is:
//  - either a `String` or a `Symbol`
//  - including '' and `Symbol()`

// A Property name is:
//  - a property key that is a `String`

// An Intger index is:
//  - a Property Name N (0 <= N < 2^53 - 1)

// An Array index is:
//  - an Integer index N (0 <= N < 2^32 - 1)


// An Enumerable property
//  - the property will be enumerated by a for-in enumeration


// Function Object:
//  - A function object is an object that supports the [[Call]] internal method

// Constructor
//  - A constructor is an object that supports the [[Construct]] internal method.

// Every object that supports [[Construct]] must support [[Call]]; that is:
//  - every constructor must be a function object.Therefore,
//  - a constructor may also be referred to as a constructor function or constructor function object.


// [[OwnPropertyKeys]]()
//
//     The normal return type is List.
//     The returned List must not contain any duplicate entries.
//     The Type of each element of the returned List is either String or Symbol.
//     The returned List must contain at least the keys of all non - configurable own properties that have previously been observed.
//     If the target is non - extensible, the returned List must contain only the keys of all own properties of the target that are observable using[[GetOwnProperty]].
//




// const isDataProperty = (obj, prop) => {
//     return Object.prototype.hasOwnProperty.call(obj, prop) &&
//         Object.prototype.propertyIsEnumerable.call(obj, prop);
// };

// const isAccessorProperty = (obj, prop) => {
//     return Object.prototype.hasOwnProperty.call(obj, prop) &&
//         !Object.prototype.propertyIsEnumerable.call(obj, prop);
// }


/** @typedef {typeof Object.create(null)} NullObject */

/**
 * An Integer-based Counter object.
 * @global @interface Counter @extends {NullObject}
 * 
 * @property {number} value - The current value of the counter.
 * 
 * @property {Function} inc - Increments the counter by a specified amount.
 * @property {Function} dec - Decrements the counter by a specified amount.
 * 
 * @property {Function} valueOf - Returns the primitive value of the Counter.
 * @property {Function} toString - Returns the string representation of the Counter.
 */

/**
 * @constructs Counter
 * @param {number} [startValue=0] - The initial value of the counter.
 */
function newCounter(startValue = 0) {
    assert.ok(typeof startValue === 'number' && Number.isInteger(startValue),
        'Counter: startValue must be an integer number');

    // private (closured) fields

    /** @type {number} */
    let _value = startValue || 0;

    // public api

    /** @lends Counter.prototype */
    const _publicApi = {
        get value() {
            return _value;
        },

        set value(n) {
            assert.ok(typeof n === 'number' && Number.isInteger(n),
                'Counter: value must be an integer number');
            _value = n;
        },

        inc: (n = 1) => {
            assert.ok(typeof n === 'number' && Number.isInteger(n) && n >= 0,
                'Counter: inc(val) val must be a non-negative integer number');
            return _value += n;
        },

        dec(n = 1) {
            assert.ok(typeof n === 'number' && Number.isInteger(n) && n >= 0,
                'Counter: dec(val) val must be a non-negative integer number');
            return _value -= n;
        },

        valueOf() {
            return this.value;
        },

        toString() {
            return String(this.value);
        },

    };

    return Object.assign(Object.create(null), _publicApi);
}

/** @global @class */
function MyClass() {

}

const counter = new Counter;


function safeStringify(thing, counter = counter(0), seen = new Map()) {

    const shouldIncludeNativeCodeProps = false;
    const includeFunctionBody = true;



    if (thing === undefined) {
        return 'undefined';
    }
    if (thing === null) {
        return 'null';
    }

    const typeName = thing[Symbol.toStringTag] !== undefined
        ? thing[Symbol.toStringTag]
        : (thing.constructor && thing.constructor.name)
            ? thing.constructor.name
            : 'unknown';

    if (typeof thing === 'object') {

        if (seen.has(thing)) {

            const cachedItem = thing
            const itemNum = seen.get(cachedItem);
            const itemType = typeof cachedItem;

            return `< references #${itemNum} >`;
        }

        else {

            seen.set(thing, counter.inc());

            let keys;
            let values;
            let replaced;

            if (Array.isArray(thing)) {

                keys = thing.map((_, i) => i);
                values = thing;
                replaced = values.map(v => safeStringify(v, counter, seen));

                return `[${replaced.join(', ')}]`
            }

            else {

                keys = keys = [...Object.getOwnPropertyNames(thing), ...Object.getOwnPropertySymbols(thing)];
                values = keys.map(key => thing[key]);
                replaced = values.map(v => safeStringify(v, counter, seen));

                return `{${keys.map((key, i) => {
                    let result = '';
                    let isNativeCodeProp = false;

                    const strKey = typeof key === 'symbol' ? key.toString() : key;
                    let strValue = replaced[i];

                    // if strValue ends with `{ [native code] }`, then replace it's entire value with `<native>`
                    if (strValue.endsWith('{ [native code] }')) {
                        strValue = '<native>';
                        isNativeCodeProp = true;
                    }

                    result = `${strKey}: ${strValue}`

                    if (isNativeCodeProp && !shouldIncludeNativeCodeProps) {
                        result = ``;
                    }

                    return result;
                })
                    .filter(str => str.length > 0)
                    .join(',\n')}}`;
            }

        }
    }

    else if (typeof thing === 'function') {

        if (includeFunctionBody) {

            return thing.toString();
        }
        else {
            return `<function ${thing.name || 'anonymous'}>`;
        }
    }

    else {
        let stringified;
        try {
            stringified = JSON.stringify(thing);
        } catch (error) {
            stringified = `< failed to stringify >`
        }
        return `${stringified}`;
    }
}


console.log(safeStringify(newCounter()));
console.log(safeStringify(newCounter));

debugger;









function checkMaxCallStackSize(depth = 1) {
    try {
        return checkMaxCallStackSize(depth + 1);
    } catch (e) {
        if (e instanceof RangeError) {
            return depth;
        }
        throw e; // Rethrows errors that aren't related to stack size
    }
}

const maxStackDepth = checkMaxCallStackSize();
console.log(`Maximum call stack size is approximately: ${maxStackDepth}`);

// same
const objLiteral = {};
const objMeh1 = Object.create(Object.prototype);
const objMeh2 = Object.create({});
const objMeh4 = Object.create({ __proto__: Object.prototype });
const objMeh5 = Object.create({ __proto__: {} });

// same
const objNullProto = Object.create(null);
const objMeh3 = Object.create({ __proto__: null });
const objMeh6 = Object.create(Object.create(null))


function deserializeRecursiveJson(data) {

    const obj = JSON.parse(data);

    // Recursively parse nested JSON strings
    function deepParse(json) {
        if (typeof json === 'string') {
            try {
                return deepParse(JSON.parse(json));
            } catch (e) {
                // Return as is if not a JSON string
                return json;
            }
        } else if (typeof json === 'object') {
            for (let key in json) {
                json[key] = deepParse(json[key]);
            }
        }
        return json;
    }

    // Process each property
    for (let key in obj) {
        obj[key] = deepParse(obj[key]);
    }

    // // Assuming the function strings are correct and safe to evaluate
    // // Convert string representations of functions
    // obj.fn = eval(obj.fn);
    // obj.type = eval(`(${obj.type})`);
    // obj["Symbol(sym)"] = eval(`(${obj["Symbol(sym)"]})`);

    return obj;
}


const logBook = {};
let logEntryCount = 0;
let logKeyCount = 0;


function serialize(obj) {

    if (obj instanceof Socket) {
        console.log('SKIPPING <Socket>');
        return `SKIPPING <Socket>`;
    }

    if (!obj[Symbol.toStringTag] && obj.constructor) {
        if ([
            'Object',
            'Array',
            //
            // 'Socket',
            // 'Pipe',
            // 'ReadableState',
            // 'WritableState',
            //
            // 'BufferList',
        ].includes(obj.constructor.name)) {
            const protoCtor1 = Object.getPrototypeOf(obj);
            const protoCtor1Name = protoCtor1.constructor.name;

            const protoCtor2 = Object.getPrototypeOf(Object.getPrototypeOf(obj));

            // NOT GOOGD ENOUGH
            const okObject = protoCtor1Name === 'Object' && protoCtor2 !== null;

            const okArray = protoCtor1Name === 'Array' && protoCtor2 !== null;


            if (!okObject && !okArray) {
                console.log(`SKIPPING ${obj.constructor.name || 'unknown'}`);

                debugger;

                return `SKIPPING ${obj.constructor.name || 'unknown'}`
            }
            else {

                if (okArray && obj.length === 0) {
                    return JSON.stringify(obj);
                }
                else if (okArray && obj.length > 0) {

                    console.log(`ARRAY WITH ${obj.length} ITEMS`);

                    return obj.toString();
                }

                const names = Object.getOwnPropertyNames(obj);
                const symbols = Object.getOwnPropertySymbols(obj);

                debugger;
            }
        }
    }


    const logKey = obj.constructor.toString().split('\n')[0];
    if (!logBook.hasOwnProperty(logKey)) {
        logBook[logKey] = 1;
        logEntryCount++;
        logKeyCount++;
    } else {
        logBook[logKey]++;
        logEntryCount++;
    }
    if (logEntryCount % 200 === 0) {
        console.log(`Entries: ${logEntryCount}, Keys: ${logKeyCount}`);
    }
    if (logEntryCount % 2000 === 0) {
        console.log(JSON.stringify(logBook, null, 4));
        process.exit();
    }


    const ownProperties = new Set();
    const stringProps = Object.getOwnPropertyNames(obj)
        .forEach((prop, idx, arr) => {
            let value = obj[prop];
            let type = typeof value;

            const valueIsGlobal = valueMatchesGlobal(value);
            const nameIsGlobal = nameMatchesGlobal(value);

            ['global', 'globalThis', 'window'].forEach(globalProp => {
                if (prop === globalProp && obj[prop] === obj) {
                    value = '<circular reference>';
                    type = typeof obj[prop];
                }
            });
            ownProperties.add({
                name: prop,
                value: value,
                type: type,
                asString: `${ToString(prop)}: ${ToString(value)}`
            });
        });
    const symbolProps = Object.getOwnPropertySymbols(obj)
        .forEach((prop, idx, arr) => {
            ownProperties.add({
                name: prop,
                value: obj[prop],
                type: typeof obj[prop],
                asString: `${ToString(prop)}: ${ToString(obj[prop])}`
            });
        });

    let result = [...ownProperties].map(prop => {
        // const name = `${ToString(prop.name)}`;
        // const value = `${ToString(prop.value)}`;
        // const maybeQuoted = prop.type === 'string' ? `"${value}"` : value;
        // return `"${name}": ${maybeQuoted}`

        const name = JSON.stringify(ToString(prop.name));
        const value = JSON.stringify(ToString(prop.value));
        return `${name}:${value}`;

    }).join(`,`);

    const parsed = deserializeRecursiveJson(`{${result}}`);

    let stringified = '';
    try {
        stringified = JSON.stringify(parsed, null, 4);
    } catch (error) {
        debugger;
    }

    // return `{ ${result} }`;
    return stringified;
}

function serializeWithMethods(obj) {
    return JSON.stringify(obj, (key, value) => {
        console.log(`[serializeWithMethods] key: ${key}, value: ${value}, type: ${typeof value}`);
        if (typeof value === 'function') {
            return value.toString();
        }
        return value;
    });
}

function deserializeWithMethods(json) {
    return JSON.parse(json, (key, value) => {
        if (typeof value === 'string' && value.startsWith('function')) {
            return eval(`(${value})`);
        }
        return value;
    });
}


function serializeInstance(instance) {
    const proto = Object.getPrototypeOf(instance);
    const constructorName = proto.constructor.name;  // Capture the constructor name

    return JSON.stringify({
        constructorName,
        properties: instance,
        methods: Object.getOwnPropertyNames(proto)
            // .filter(prop => typeof proto[prop] === 'function' && prop !== 'constructor')
            .reduce((acc, key) => {
                acc[key] = proto[key].toString() + `\n\n`;
                return acc;
            }, {})
    });
}

function deserializeInstance(serialized) {
    const parsed = JSON.parse(serialized);
    const constructor = eval(parsed.constructorName); // Assume constructor is globally available
    const instance = new constructor(parsed.properties.value);

    Object.keys(parsed.methods).forEach(methodName => {
        instance[methodName] = eval(`(${parsed.methods[methodName]})`);
    });

    return instance;
}

function NullObjectWith(instance) {
    const serialized = serializeInstance(instance);
    const functionBody = `return Object.assign(Object.create(null), ${serialized})`;
    return new Function(functionBody)();
};

function nameMatchesGlobal(name) {
    return (name !== undefined && name !== null) && (name[Symbol.toStringTag] === 'global' || name[Symbol.toStringTag] === 'Window');
}
function valueMatchesGlobal(obj) {
    return obj === globalThis;
}

function ToString(thing, nestedToStringFn = serialize) {

    // Useful for debugging, but not for production
    const includeFunctionShapeComment = false;

    // short circuit for the usual suspects
    if (thing === undefined || thing === null) {
        return String(thing);
    }

    if (typeof thing === 'object') {
        // --> then we need to solve all the nested properties

        // If the prototype of the current object is null, then 
        //  - this current object is already the root of this object tree
        //  - `.toString()` probably does not exist for this object
        if (Object.getPrototypeOf(thing) === null) {
            // A null value indicates that there are no inherited properties.
            //  - thus any remaining properties are exactly at this level

            return nestedToStringFn(thing);
        }

        // run the nestedToStringFn, passing this object as-is to it
        return nestedToStringFn(thing);
    }

    if (typeof thing === 'function') {
        // Then:
        //  - we identify what kind of function it is
        //  - we convert it to a string via `.toString()`
        //    which should be available for all functions

        if (includeFunctionShapeComment) {

            const isNamed = thing.name !== '';
            const isPlainFn = thing.prototype !== undefined;
            const isViaNew = (isPlainFn && thing.prototype.constructor && thing.prototype.constructor.toString)
                ? thing.prototype.constructor.toString() === 'function anonymous(\n) {\n\n}'
                : false;

            const comment = isPlainFn
                ? isViaNew
                    ? `new Function( .. )`
                    : `function ${thing.name}( .. ) { .. }`
                : `const ${thing.name} = ( .. ) => { .. }`

            // return the function as a string with a comment
            return `\n// ----------------\n// ${comment}\n${thing.toString()}`;
        }
        else {
            // return the function as a string
            return thing.toString();
        }
    }

    // Else, if none of the above, it should be one of the remaining Primitives:
    //  - string, number, bigint, boolean, symbol.
    return thing.toString();
}

let plainObj = {
    a: 1,
    b: 2,
    c: 3,
    d: {
        e: 4,
        f: 5,
        g: 6,
        h: {
            i: 7,
            j: 8,
            k: 9,
        }
    }
};

let NS = {
    anonymous: () => {
        return new Function(`
  return function myFunction() { 
    return 'Hello from my named function!'; 
  }
`);
    }
};

const NSconst = () => {
    return new Function(`
  return function myFunction() { 
    return 'Hello from my named function!'; 
  }
`);
}

let namedArrowFn = (a, b) => {
    const d = {
        nested: {
            obj: {
                a: 1,
                b: 2,
                c: 3,
            },
            arr: [1, 2, 3],
            str: 'hello',
            str2: new String('hello'),
        },
        fn: () => { 'fff' },
        [Symbol('sym')]: Object,
        type: Symbol
    };
    return d;
};

// console.log(ToString(objLiteral));
// console.log(ToString(objNullProto));
// console.log(ToString(objMeh1));
// console.log(ToString(objMeh2));
// console.log(ToString(objMeh3));
// console.log(ToString(objMeh4));
// console.log(ToString(objMeh5));
// console.log(ToString(objMeh6));

// test with js primitives
const primitives = [
    // undefined,
    // null,
    // true,
    // false,
    // 0,
    // 1,
    // 1.1,
    1n, // 1
    BigInt, // function BigInt() { [native code] }
    BigInt(1), // 1
    // 'hello',
    Symbol, // function Symbol() { [native code] }
    Symbol('sym'), // Symbol(sym)
    () => { 'fff' },
    new Date(), // shows { }, but not the date
    // new RegExp('hello'), // shows { lastIndex: 0 }
    // new Map(), // shows { }
    // new Set(), // shows { }
    // new WeakMap(), // shows { }
    // new WeakSet(), // shows { }
    // new Error('hello'), // shows { message: 'hello', stack: '...' }
    // new Object(), // shows { }
    // new Array(), // shows { length: 0}
    new Function(), // shows function() { \n }
    // new Number(), // shows { }
    // new String(), // shows { length: 0 }
    // new Boolean(),  // shows { }
    Object,
    Object.create(null), // shows {}
    // Object.create({}), // shows { }
    // {}, // shows { }
    // [], // shows { length: 0 }
    Buffer,
    Buffer.from('hello'), // shows { 0: 104, 1: 101, 2: 108, 3: 108, 4: 111 }, but not the fn's
];

// console.log(ToString(this));
console.log(ToString(globalThis));


[
    // () => { },
    // function named() { },
    // new Function(),

    // NSconst,
    // NS.anonymous,
    // NS.anonymous(),
    // NS.anonymous()(),
    // NS.anonymous()()(),
    // namedArrowFn,
    namedArrowFn(),
    ...primitives
].forEach(p => {
    console.log(ToString(p));
});


console.log(ToString(namedArrowFn));


console.log(ToString(namedArrowFn));

console.log(JSON.stringify(logBook, null, 4));

debugger;
debugger;
debugger;

console.log(JSON.stringify(namedArrowFn));
console.log(serializeWithMethods(namedArrowFn));
console.log(serializeInstance(namedArrowFn));


let nullObjectWith = NullObjectWith(namedArrowFn);

console.log(util.inspect(nullObjectWith, { depth: Infinity }));

class Compose {
    static _nullObject = Object.create(null);

    #typeChain = [];

    get typeChain() {
        return this.#typeChain;
    }

    get baseType() {
        return this.#typeChain[0] || undefined;
    }

    set baseType(type) {
        Compose._assertIsAType(type, 'baseType must be a constructable function or class');
        this.#typeChain[0] = type;
    }

    constructor(baseType = undefined) {
        this.baseType = baseType;
    }

    static from(baseType) {
        return new Compose(baseType);
    }

    addSub(type) {
        Compose._assertIsAType(type, 'extension must be a constructable function or class');
        this.#typeChain.push(type);
        return this;
    }

    addSuper(type) {
        Compose._assertIsAType(type, 'extension must be a constructable function or class');
        this.#typeChain.unshift(type);
        return this;
    }

    static _overWrite(target, source) {
        const targetProps = Object.getOwnPropertyDescriptors(target);
        const sourceProps = Object.getOwnPropertyDescriptors(source);
        for (const [key, value] of Object.entries(sourceProps)) {
            if (targetProps.hasOwnProperty(key)) {
                Object.defineProperty(target, key, value);
            }
        }
        return target;
    }

    static _typeToDynamicExtender(_sub, _super) {
        return class extends _super {
            #thisType = undefined;
            #superType = undefined;
            get type() {
                return this.#thisType || 'anonynous';
            }
            get typeName() {
                return this.type.name || 'anonynous';
            }
            constructor(options = {}, ...args) {
                // `this` not yet defined
                console.debug(`[Compose] ${_sub.name || 'anonynous'}.constructor() - extends ${_super.name
                    || 'anonynous'}`);
                // a call to `super()` is required if the class extends another class
                super(options, ...args);
                // `this` is now defined

                // --- declaration initialization injected here ---

                // final initialization
                this.#thisType = _sub;
                this.#superType = _super;

                console.log(this);
                console.log(Object.getOwnPropertyDescriptors(this));

                Object.assign(this, options)

                console.debug(`[Compose]  ${_sub.name || 'anonynous'}.constructor() done.`)
            }

            static get [Symbol.species]() {
                return _sub;
            }
        };
    }

    static _prepTypeChain(typeChain) {
        const chain = [...typeChain]
            .filter(type => type !== undefined && type !== null)

        if (chain.length === 0) {
            throw new Error('No composable types found in the chain');
        }

        const root = chain.shift();
        const dynamicExtenders = chain.map(_sub => {
            return (_super) => Compose._typeToDynamicExtender(_sub, _super);
        });
        return { root, dynamicExtenders };
    }

    static _mixin(...extenders) {
        return function (baseType) {
            return extenders.reduce((accumulator, current) => {
                return current(accumulator);
            }, baseType);
        };
    }

    _exec() {
        const chain = Compose._prepTypeChain(this.#typeChain);
        const composed = Compose._mixin(...chain.dynamicExtenders)(chain.root);
        return composed;
    }

    asType() {
        return this._exec();
    }

    asInstance() {
        return new (this._exec())();
    }

    static _assertIsAType(actualValue, msgOnFail) {
        if (typeof actualValue !== 'function') {
            let msg = `[Compose] Expected a type, but got ${typeof actualValue}`;
            msg += msgOnFail ? `: ${msgOnFail}` : '';
            throw new Error(msg);
        }
    }
}

class _ {
    constructor() {
        return Object.create(null);
    }
}

class A {
    constructor() {
        this.name = 'A';
    }
    print() {
        console.log(`${this.name}.print()`);
    }
}

class B {
    constructor() {
        this.name = 'B';
    }
    print() {
        console.log(`${this.name}.print()`);
    }
}

class C {
    constructor() {
        this.name = 'C';
    }
    print() {
        console.log(`${this.name}.print()`);
    }
}

// const t_ = Compose.from(Object).asType();
// const tA = Compose.from(t_).addSub(A).asType();
// const tB = Compose.from(t_).addSub(B).asType();
// const tC = Compose.from(t_).addSub(C).asType();

const tOABC = Compose.from(Object).addSub(A).addSub(B).addSub(C).asType();

// const a = new tA();
// const b = new tB();
// const c = new tC();

const oabc = new tOABC();



console.log(util.inspect(oabc, { depth: Infinity }));


function SubClass() {
    const superClass = Object.create(null);
    return Object.assign(superClass, {
        toString() {
            return 'hello from subclass';
        }
    });
}
console.log(new SubClass().toString());

let sc = new SubClass();
console.log(util.inspect(sc, { depth: Infinity }));





class Super {
    constructor() {
        Object.assign(this, Object.create(null));

        console.log(`\n\nSuper:\n${util.inspect(this, { depth: Infinity })}`);
        console.log(String(this.toString()));
    }
}


class Sub extends Super {
    constructor() {
        const s = super();
        // Object.setPrototypeOf(this, Object.getPrototypeOf(this));
        // Object.setPrototypeOf(this, Sub.prototype);

        console.log(`\n\nSub  :\n${util.inspect(this, { depth: Infinity })}`);
        console.log(String(this.toString()));
    }

    toString() {
        return 'sub to string';
    }
}

const s = new Sub();

console.log(new Sub().toString());

debugger;

class Box {

    /** @type {any[]|undefined} */
    #values;

    /** @type {any[]|undefined} */
    #errors;

    /** @type {boolean|undefined} */
    #sealed;

    _assertUnsealed(extraMessage) {
        if (this.#sealed) {
            let msg = 'Sealed';
            msg += extraMessage ? `: ${extraMessage}` : '';
            throw new Error(msg);
        }
    }

    _assertSealed(extraMessage) {
        if (!this.#sealed) {
            let msg = 'Unsealed';
            msg += extraMessage ? `: ${extraMessage}` : '';
            throw new Error(msg);
        }
    }

    get values() {
        this._assertUnsealed('Cannot access values of a sealed Op');
        return this.#values || [];
    }

    set values(_ignored) {
        throw new Error('Use `resolve` method instead');
    }

    get errors() {
        this._assertUnsealed('Cannot access errors of a sealed Op');
        return this.#errors || [];
    }

    set errors(_ignored) {
        throw new Error('Use `reject` method instead');
    }

    get hasValues() {
        this._assertUnsealed('Cannot check for values on a sealed Op');
        const _values = this.#values || [];
        return _values.length !== 0;
    }

    get hasErrors() {
        this._assertUnsealed('Cannot check for errors on a sealed Op');
        const _errors = this.#errors || [];
        return _errors.length !== 0;
    }

    constructor() {
        this.#values = undefined;
        this.#errors = undefined;
        this.#sealed = false;
    }

    static new() {
        return new Box();
    }

    // static newResolveAndSeal(value) {
    //     return Box.new()
    //         ._resolve(value)
    //         .seal();
    // }

    // static newRejectAndSeal(reason, extra) {
    //     return Box.new()
    //         ._reject(value)
    //         .seal();
    // }

    seal() {
        this._assertUnsealed('Cannot seal an already sealed Op');
        this.#sealed = true;
        return this;
    }

    addValue(value) {
        this._assertUnsealed('Cannot add when sealed');
        // late initialized
        this.#values = [...this.#values || [], value];
        return this;
    }

    addProblem(reason, extra = undefined) {
        this._assertUnsealed('Cannot add when sealed');
        // late initialized
        this.#errors = [...this.#errors || [], { reason, extra }];
        return this;
    }

    unseal() {
        this._assertSealed('Cannot unseal an already unsealed Op');
        this.#sealed = false;
        return this;
    }

    assertSealedSuccess() {
        this.unseal();
        return this.hasValues && !this.hasErrors;
    }

    assertSealedFailure() {
        this.unseal();
        return this.hasErrors && !this.hasValues;
    }

    // adoptSealedValues() {
    //     this.unseal();
    //     const values = this.values;
    //     this.values = [];
    //     return [values[0], values.slice(1)];
    // }

    // adoptSealedErrors() {
    //     this.unseal();
    //     const errors = this.errors;
    //     this.errors = [];
    //     return [errors[0], errors.slice(1)];
    // }

    // adoptSealed() {
    //     this.unseal();
    //     return [this.values, this.errors];
    // }

}

class _String {

    #raw;
    #value;

    constructor(value) {
        this.#raw = value;
        this.#value = undefined;
    }

    get value() {
        this.#value = this.#raw.toString();
        return this.#value;
    }

    toString() {
        return this.value;
    }

    valueOf() {
        return this.value;
    }

    [Symbol.toPrimitive](hint) {
        return this.value;
    }

}


class _Union {

    #types;

    constructor(...types) {
        if (typeof types === 'object') {
            if (types instanceof Array || types instanceof Map || types instanceof Set) {
                types = [...types];
            }
        }
        else {
            throw new Error('Invalid types argument');
        }
    }

    static of(...types) {
        return new _Union(...types);
    }

    typeCheck(value) {
        return this.#types.some(type => value instanceof type);
    }


    toString() {
        return this.#types.join(' | ');
    }

    valueOf() {
        return this.#types;
    }

    [Symbol.toPrimitive](hint) {
        return this.toString();
    }

}

const PathLike = new _Union(String, Buffer, URL);


class _PathLike {
    typeofString = 'string';
    typeofBuffer = 'Buffer';
    typeofURL = 'URL';

    #pathLike;

    constructor(pathLike) {
        this.#pathLike = pathLike;
    }

    get type() {
        if (typeof this.#pathLike === 'string') {
            return _PathLike.typeofString;
        }
        if (this.#pathLike instanceof Buffer) {
            return _PathLike.typeofBuffer;
        }
        if (this.#pathLike instanceof URL) {
            return _PathLike.typeofURL;
        }
        throw new Error(`Invalid PathLike type: ${this.#pathLike}`);
    }

    get value() {
        switch (this.type) {
            case _PathLike.typeofString:
            case _PathLike.typeofBuffer:
            case _PathLike.typeofURL:
                return this.#pathLike.toString();
            default:
                throw new Error(`Invalid PathLike type: ${this.#pathLike}`);
        }
    }

    toString() {
        return this.value;
    }
    valueOf() {
        return this.value;
    }

}


function sealedOpGetIfPathLike(pathLike) {
    const result = Box.new();
    return (typeof pathLike === 'string' || pathLike instanceof Buffer || pathLike instanceof URL)
        ? result.addValue(pathLike).seal()
        : result.addProblem('Argument must be a PathLike').seal();
}

function sealedOpGetIfDirent(dirent) {
    const b = Box.new();
    return (dirent instanceof Dirent)
        ? b.addValue(dirent).seal()
        : b.addProblem('Argument must be a Dirent').seal();
}

/**
 * 
 * @param {Dirent|PathLike} direntOrPathLike 
 * @returns {Box}
 */
function sealedOpResolveDirentOrPathLike(direntOrPathLike) {
    const box = Box.new();

    if (direntOrPathLike === undefined || direntOrPathLike === null) {
        box.addProblem('direntOrPathLike is null or undefined', direntOrPathLike);
    }

    const direntOp = sealedOpGetIfDirent(direntOrPathLike);
    if (direntOp.assertSealedSuccess()) {
        box.addValue(direntOp.values[0]);
    }

    const pathlikeOp = sealedOpGetIfPathLike(direntOrPathLike);
    if (pathlikeOp.assertSealedSuccess()) {
        box.addValue(String(pathlikeOp.values[0]));
    }

    box.addProblem('Unable to resolve Dirent or PathLike', direntOrPathLike);

    return box.seal();
}


function getLeafInfo(direntOrPathLike) {
    try {
        const original = direntOrPathLike;


        const box = sealedOpResolveDirentOrPathLike(direntOrPathLike);

        if (box.assertSealedFailure()) {
            throw new Error(box.errors.pop(), box.errors);
        }
        const value = box.values[0];

        const fullPath = (value instanceof Dirent)
            ? P.join(value.path, value.name)
            : value;

        const normalized = P.normalize(fullPath);
        const resolved = P.resolve(normalized);

        const dirname = P.dirname(resolved);
        const basename = P.basename(resolved);

        const isFile = fsSync.statSync(resolved).isFile();

        return {
            original,
            normalized,
            resolved,
            dirname,
            basename,
            isFile,
        };

    }
    catch (error) {
        throw error;
    }
}

/** 
 * @param {PathLike} location 
 * @returns {string} 
 * @throws {Error}
 * @throws {Error} Only if the passed in argument resolves with an error
 */
function snapToClosestDir(direntOrPathLike) {
    try {
        if (direntOrPathLike === undefined || direntOrPathLike === null) {
            direntOrPathLike = '.';
        }

        const leaf = getLeafInfo(direntOrPathLike);
        const closest = leaf.isFile ? leaf.dirname : leaf.resolved
        return closest;

    } catch (error) {
        throw error;
    }
}

function getClosestDirContents(direntOrPathLike) {
    try {
        const fullPath = snapToClosestDir(direntOrPathLike)
        const contents = fsSync.readdirSync(fullPath, {
            withFileTypes: true,
            recursive: false
        });
        return contents;
    } catch (error) {
        throw error;
    }
}

let testUrl = new URL('file:///C:/Users/username/Documents/Projects/ProjectName');

// export type PathLike = string | Buffer | URL;
// export type PathOrFileDescriptor = PathLike | number;

/**
 * @enum {string} FsPathType
 * @readonly
 */
const FsPathType = {
    string: 'string',
    Buffer: 'Buffer',
    URL: 'URL',
    number: 'number',

}


// class FsEntry {

//     argValue;
//     argType;
//     argPath;

//     _stats;

//     name;
//     location;

//     /**
//      * @param {Dirent|PathLike} arg
//      * @returns {FsEntry}
//      */
//     constructor(arg) {
//         this.argValue = arg;

//         if (typeof this.argValue === 'object' && this.argValue instanceof Dirent) {
//             this.argType = 'Dirent';
//         }
//         else {
//             this.argType = 'PathLike';
//         }

//         this.stats = fsSync.statSync(this.argPath);
//     }

//     snapToClosestDir() {
//         switch (this.argType) {
//             case 'Dirent':
//                 return snapToClosestDir(this.argValue);
//             case 'PathLike':
//                 return snapToClosestDir(this.argValue);
//         }
//     }

// }

class FsEntry {

    #from

    constructor(from = undefined) {
        this.#from = undefined;
    }

    /**
     * @param {Dirent|PathLike} closestDir 
     * @returns {FsEntry}
     */
    static from(location) {
        const _dir = snapToClosestDir(location);
        return new FsEntry();
    }

}


const main = () => {
    const proj_root = snapToClosestDir();

    const src_dir = snapToClosestDir(P.join(proj_root, 'src'));

    const dirs = getClosestDirContents(src_dir)
        .filter(dirent => dirent.isDirectory());

    const subModules = dirs
        .map(dirent => snapToClosestDir(dirent)
            .filter(dirent => dirent.isFile() && dirent.name === 'package.json')
            .map(dirent => dirent)
        )
        .flat(1);


    console.log(util.inspect(subModules, { depth: 1 }))
}
main();

