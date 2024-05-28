// file: src/common/Mixins.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SafeStrictMode", {
    enumerable: true,
    get: function() {
        return SafeStrictMode;
    }
});
const _lodash = require("lodash");
function getStaticMembers(class_) {
    return Object.getOwnPropertyNames(class_);
}
function getStaticProperties(class_) {
    return getStaticMembers(class_).filter((name)=>typeof class_[name] !== 'function');
}
function getInstanceMembers(class_) {
    if (typeof class_ !== 'function') {
        return [];
    }
    return Object.getOwnPropertyNames(class_.prototype);
}
function getInstanceProperties(class_) {
    if (typeof class_ !== 'function') {
        return [];
    }
    return getInstanceMembers(class_).filter((name)=>typeof class_.prototype[name] !== 'function');
}
function isClassConstructor(value) {
    return typeof value === 'function' && /^class\s/.test(value.toString());
}
function isFunctionConstructor(value) {
    return typeof value === 'function' && /^function\s/.test(value.toString());
}
function canBeConstructed(value) {
    return isClassConstructor(value) || isFunctionConstructor(value);
}
function canBeInstanciatedWithNew(value) {
    return canBeConstructed(value); // Simpler and more accurate based on the naming
}
///////////////////////////////////////////////////////////////////////////////
// MOSTLY CORRECT - I THINK
/**
 * Get all properties of an object, including from its prototype.
 * @param obj The object to get the properties of.
 * @returns An array of all property names of the object.
 */ function getEnumerableProperties(obj) {
    let props = [];
    if (typeof obj !== 'object') {
        return props;
    }
    for(let prop in obj){
        props.push(prop);
    }
    return props;
}
var SafeStrictMode;
(function(SafeStrictMode) {
    /** Global symbol for a value that is ommitted in strict mode. */ SafeStrictMode.Ommitted = Symbol('ommitted');
    /** Global symbol for a property that is ommitted in strict mode. */ SafeStrictMode.Caller = Symbol('caller');
    /** Global symbol for a property that is ommitted in strict mode. */ SafeStrictMode.Callee = Symbol('callee');
    /** Global symbol for a property that is ommitted in strict mode. */ SafeStrictMode.Arguments = Symbol('arguments');
    /** Key-value replacements for restricted members in strict mode. */ const RestrictedMembers = Object.assign(Object.create(null), {
        caller: {
            key: SafeStrictMode.Caller,
            value: SafeStrictMode.Ommitted
        },
        callee: {
            key: SafeStrictMode.Callee,
            value: SafeStrictMode.Ommitted
        },
        arguments: {
            key: SafeStrictMode.Arguments,
            value: SafeStrictMode.Ommitted
        }
    });
    /**
     * Predicate to determine if the value reported for a property must be the same
     * as the value of the corresponding target object property (according to the
     * Proxy invariant spec).
     * @param targetObjectPropertyDescriptor The property descriptor of the target
     * @returns `true` if the value reported for a property must be the same as the
     * value of the corresponding target object property, `false` otherwise.
     * @spec 
     * The value reported for a property must be the same as the value of the
     * corresponding target object property if the target object property is a
     * non-writable, non-configurable own data property.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get#invariants
     */ function intercepetedValueMustMatchTarget(targetObjectPropertyDescriptor) {
        if (targetObjectPropertyDescriptor === undefined) {
            return false;
        }
        return targetObjectPropertyDescriptor.writable === false && // non-writable
        targetObjectPropertyDescriptor.configurable === false && // non-configurable
        targetObjectPropertyDescriptor.enumerable === true // is own property
        ;
    }
    /**
     * Predicate to determine if the value reported for a property must be 
     * undefined (according to the Proxy invariant spec).
     * @param targetObjectPropertyDescriptor The property descriptor of the target
     * @returns `true` if the value reported for a property must be undefined,
     * `false` otherwise.
     * @spec
     * The value reported for a property must be undefined if the corresponding
     * target object property is a non-configurable own accessor property that
     * has undefined as its [[Get]] attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get#invariants
     */ function intercepetedValueMustBeUndefined(targetObjectPropertyDescriptor) {
        if (targetObjectPropertyDescriptor === undefined) {
            return false;
        }
        return targetObjectPropertyDescriptor.configurable === false && // non-configurable
        targetObjectPropertyDescriptor.enumerable === true && // is own property
        targetObjectPropertyDescriptor.get === undefined // has undefined as its [[Get]] attribute
        ;
    }
    function looksLikeStrictModeFunction(value) {
        return typeof value === 'function' && // is a function
        'caller' in value && // has a caller
        'arguments' in value // has arguments
        ;
    }
    function looksLikeStrictModeFunctionArguments(value) {
        return typeof value === 'object' && // is an object
        'callee' in value && // is being called
        'length' in value // has a length
        ;
    }
    function shouldIntercept(value) {
        return looksLikeStrictModeFunction(value) || looksLikeStrictModeFunctionArguments(value);
    }
    function proxyIfNeeded(thing) {
        if (thing === null || thing === undefined) {
            return thing;
        }
        if (!shouldIntercept(thing)) {
            // console.log(`[Proxy] Ignoring '${String(thing)}'`);
            return thing;
        }
        // console.log(`[Proxy] Intercepting '${String(thing)}'`);
        return new Proxy(thing, {
            get (target, key, receiver) {
                if (key in RestrictedMembers) {
                    // console.log(`[Proxy] Access to member '${String(key)}' is restricted in strict mode.`);
                    // console.log(`[Proxy]   this requires special handling...`);
                    const propDesc = Reflect.getOwnPropertyDescriptor(target, key);
                    let specFailCount = 0;
                    let replacementValue = Reflect.get(RestrictedMembers, key).value;
                    if (intercepetedValueMustMatchTarget(propDesc)) {
                        // console.log(`[Proxy]   Spec violation: The value reported for a property must be the same as the value of the corresponding target object property.`);
                        // console.log(`[Proxy]     Reverting replacement value '${String(replacementValue)}' to target object value.`);
                        replacementValue = Reflect.get(target, key, receiver);
                        specFailCount += 1;
                    }
                    if (intercepetedValueMustBeUndefined(propDesc)) {
                        // console.log(`[Proxy]   Spec violation: The value reported for a property must be undefined.`);
                        // console.log(`[Proxy]     Reverting replacement value '${String(replacementValue)}' to 'undefined'.`);
                        replacementValue = undefined;
                        specFailCount += 1;
                    }
                    if (specFailCount === 0) {
                    // console.log(`[Proxy]   Spec compliance: The value may be replaced..`);
                    // console.log(`[Proxy]     Successfuly intercepted 'get' for '${String(key)}',`);
                    } else {
                    // console.log(`[Proxy]   Failed to intercept 'get' for '${String(key)}' (Spec takes precedence)`);
                    }
                    // console.log(`[Proxy]     Returned value:`, replacementValue);
                    return replacementValue;
                } else {
                    return Reflect.get(target, key, receiver);
                }
            }
        });
    }
    SafeStrictMode.proxyIfNeeded = proxyIfNeeded;
    function strictModeGetOwnMembers(obj) {
        const members = [];
        [
            ...Object.getOwnPropertyNames(obj),
            ...Object.getOwnPropertySymbols(obj)
        ].forEach((prop)=>{
            if (prop in RestrictedMembers) {
                members.push({
                    key: RestrictedMembers.prop.key,
                    value: RestrictedMembers.prop.value
                });
            } else {
                members.push({
                    key: prop,
                    value: obj.prop
                });
            }
        });
        return members;
    }
})(SafeStrictMode || (SafeStrictMode = {})); // namespace SafeStrictMode
function getAllMemberKeysAsSet(thing, startLevel = 0, maxLevel) {
    let props = new Set();
    if (thing === null || thing === undefined) {
        return props;
    }
    // clamp levels to prevent infinite recursion
    const traversalLimit = 255;
    startLevel = Math.min(0, Math.max(startLevel || 0), traversalLimit);
    maxLevel = Math.max(0, Math.min(maxLevel || traversalLimit), traversalLimit);
    let currentLevel = 0;
    let currentObj = thing;
    while(currentLevel <= maxLevel && currentObj !== undefined){
        let _currentObj = currentObj === null ? Object : currentObj;
        // skip while not yet at the start level
        if (currentLevel >= startLevel) {
            Reflect.ownKeys(_currentObj).forEach((p)=>props.add(p));
        }
        // if we reach the global object, break
        if (_currentObj === Object) {
            break;
        } else {
            currentObj = Object.getPrototypeOf(currentObj);
            currentLevel += 1;
        }
        if (currentLevel >= traversalLimit) {
            console.warn(`[getAllMemberKeys] Traversal limit reached at level ${currentLevel}. Breaking as-precaution.`);
            break;
        }
    }
    return props;
}
function getProtoypeChain(thing, target, levelLimit) {
    levelLimit = Math.max(0, levelLimit || 32);
    let chain = [];
    let currentObj = thing || null;
    while(currentObj !== undefined && currentObj !== null && currentObj !== target && chain.length < levelLimit){
        currentObj = Object.getPrototypeOf(currentObj);
        chain.push(currentObj === null ? '{null}' : currentObj === undefined ? 'undefined' : String(typeof currentObj === 'function' ? currentObj.name || 'anon' : currentObj.constructor.name));
    }
    return chain.reverse().join('->');
}
var ToStringFirstWord;
(function(ToStringFirstWord) {
    ToStringFirstWord["Class"] = "class";
    ToStringFirstWord["Function"] = "function";
})(ToStringFirstWord || (ToStringFirstWord = {}));
/**
 * Tries to determine the constructor of a given object or function.
 * @param thing The object or function to determine the constructor of.
 * @returns string representation of the constructor like 'Function <name>' or 'Class <name>'
 */ function inspect(thing) {
    // SHOULD WE RECONSIDER THIS? now that we know:
    //
    // > Object.toString()
    //     'function Object() ...'
    // > (new Object).toString()
    //     '[object Object]'
    // > (() => {}).toString()
    //     '( .. ) => { ... }'
    // > (new Function()).toString()
    //     'function anonymous(..) ...'
    // > (globalThis).toString().substring(0,24)
    //     '[object global]'
    let result = '';
    if (thing === undefined) {
        result = 'Built-in Primitive: undefined (value)';
    } else if (thing === null) {
        result = 'Built-in Primitive: null (value)';
    } else if (typeof thing === 'object' || typeof thing === 'function') {
        const _type = typeof thing;
        const _thing = _type === 'function' ? thing : thing.constructor;
        const _suffix = _type === 'function' ? '(definition)' : '(instance)';
        const _definition = _thing.toString();
        const end = _definition[0] === 'c' ? _definition.indexOf('{') : _definition.indexOf('(');
        const parts = _definition.substring(0, end).trim().split(' ', 2);
        let part0;
        let part1;
        const stdBuiltIn = [
            'AggregateError',
            'Array',
            'ArrayBuffer',
            'AsyncFunction',
            'AsyncGenerator',
            'AsyncGeneratorFunction',
            'AsyncIterator',
            'Atomics',
            'BigInt',
            'BigInt64Array',
            'BigUint64Array',
            'Boolean',
            'DataView',
            'Date',
            'Error',
            'EvalError',
            'FinalizationRegistry',
            'Float32Array',
            'Float64Array',
            'Function',
            'Generator',
            'GeneratorFunction',
            'globalThis',
            'Infinity',
            'Int16Array',
            'Int32Array',
            'Int8Array',
            'InternalError Non - standard',
            'Intl',
            'Iterator',
            'JSON',
            'Map',
            'Math',
            'NaN',
            'Number',
            'Object',
            'Promise',
            'Proxy',
            'RangeError',
            'ReferenceError',
            'Reflect',
            'RegExp',
            'Set',
            'SharedArrayBuffer',
            'String',
            'Symbol',
            'SyntaxError',
            'TypedArray',
            'TypeError',
            'Uint16Array',
            'Uint32Array',
            'Uint8Array',
            'Uint8ClampedArray',
            'URIError',
            'WeakMap',
            'WeakRef',
            'WeakSet'
        ];
        let prefix = stdBuiltIn.includes(parts[1] || '') ? 'Built-in' : 'Custom';
        if (prefix === 'Custom' && parts[0] === 'function' && parts[1] === 'anonymous') {
            part0 = 'AnonFn';
            part1 = 'new-Function';
        } else if (prefix === 'Built-in' && parts[0] === 'function') {
            part0 = 'Class';
            part1 = parts[1];
        }
        result = `${prefix} ${part0 || 'ArrowFn'}: ${part1 || 'anonymous'} ${_suffix}`;
    } else {
        result = `Built-in Primitive: ${typeof thing} (value)`;
    }
    return result;
}
function _testRun_(fn, ...args) {
    return fn(...args);
}
function _testOut_(fn, ...args) {
    return String(_testRun_(fn, ...args));
}
function _testLog_(fn, ...args) {
    return console.log(_testOut_(fn, ...args));
}
let testResult = [];
function NamedFn() {}
testResult.push(_testOut_(inspect, NamedFn));
testResult.push(_testOut_(inspect, new NamedFn()));
testResult.push(_testOut_(inspect, ()=>{
    return {};
}));
testResult.push(_testOut_(inspect, (()=>{
    return ()=>{};
})()));
testResult.push(_testOut_(inspect, new Function()));
const AnonFn = new Function();
testResult.push(_testOut_(inspect, AnonFn));
testResult.push(_testOut_(inspect, new AnonFn()));
class FromCl {
}
testResult.push(_testOut_(inspect, FromCl));
testResult.push(_testOut_(inspect, new FromCl()));
class AbsCl {
}
testResult.push(_testOut_(inspect, AbsCl));
class FromAbsCl extends AbsCl {
}
testResult.push(_testOut_(inspect, FromAbsCl));
testResult.push(_testOut_(inspect, new FromAbsCl()));
testResult.push(_testOut_(inspect, Object));
testResult.push(_testOut_(inspect, new Object()));
testResult.push(_testOut_(inspect, (()=>{
    return {};
})()));
testResult.push(_testOut_(inspect, {}));
testResult.push(_testOut_(inspect, 'abc'));
testResult.push(_testOut_(inspect, String()));
testResult.push(_testOut_(inspect, NaN));
testResult.push(_testOut_(inspect, 123));
testResult.push(_testOut_(inspect, Number(123)));
testResult.push(_testOut_(inspect, BigInt(0)));
testResult.push(_testOut_(inspect, true));
testResult.push(_testOut_(inspect));
testResult.push(_testOut_(inspect, Symbol('abc')));
testResult.push(_testOut_(inspect, null));
testResult.push(_testOut_(inspect, void 0));
testResult.push(_testOut_(inspect, globalThis));
testResult.forEach((item, index)=>{
    testResult[index] = item.replace(/[():]/g, '').split(' ');
    testResult[index] = {
        type: testResult[index][0],
        family: testResult[index][1],
        name: testResult[index][2],
        suffix: testResult[index][3]
    };
});
console.table(testResult);
function getAllMembersAsKvRecord(thing) {
    const members = Object.create(null);
    let level = 0;
    let membersCount = 0;
    let membersAddedThisLevel = 0;
    let currentLevelName = '';
    let currentObj = SafeStrictMode.proxyIfNeeded(thing);
    while(currentObj !== undefined){
        let _currentObj = currentObj === null ? Object : currentObj;
        if (level === 0) {
            switch(typeof _currentObj){
                case 'function':
                    currentLevelName = `${String(_currentObj.name) || 'anonymous'}()` + currentLevelName;
                    break;
                case 'object':
                    currentLevelName = `${String(_currentObj.constructor.name)}{}` + currentLevelName;
                    break;
                default:
                    currentLevelName = `<unknown>` + currentLevelName;
                    break;
            }
        } else {
            currentLevelName = `^${currentLevelName}->`;
            switch(typeof _currentObj){
                case 'function':
                    currentLevelName += `${String(_currentObj.name) || 'anonymous'}()`;
                    break;
                case 'object':
                    currentLevelName += `${String(_currentObj.constructor.name)}{}`;
                    break;
                default:
                    currentLevelName += `<unknown>`;
                    break;
            }
        }
        Reflect.ownKeys(_currentObj).forEach((p)=>{
            const propValue = Reflect.get(_currentObj, p);
            const propValueType = typeof propValue;
            if (Reflect.ownKeys(members).includes(p)) {
                // dont overwrite existing members
                // console.log(`level ${level}: ! ${currentLevelName}.${String(p)}: ${propValueType}(${String(propValue)})`);
                console.log(`level ${level}: ! ${currentLevelName}.${String(p)}: ${propValueType}`);
            } else {
                Reflect.set(members, p, propValue);
                membersAddedThisLevel += 1;
                // console.log(`level ${level}: + ${currentLevelName}.${String(p)}: ${propValueType}(${String(propValue)})`);
                console.log(`level ${level}: + ${currentLevelName}.${String(p)}: ${propValueType}`);
            }
        });
        // console.log(`level ${level}:   ${currentLevelName} added ${membersAddedThisLevel} members`);
        membersCount += membersAddedThisLevel;
        membersAddedThisLevel = 0;
        level += 1;
        // break if we reach the global object
        if (_currentObj === Object) {
            break;
        } else {
            currentObj = SafeStrictMode.proxyIfNeeded(Object.getPrototypeOf(currentObj));
        }
    }
    return members;
}
function applyMixins(derivedCtor, baseCtors, baseCtorArgs = []) {
    baseCtors.forEach((baseCtor, i)=>{
        // If arguments for the base constructor are provided, instantiate it
        const instance = baseCtorArgs[i] ? new baseCtor(...baseCtorArgs[i]) : new baseCtor();
        // Copy instance properties and methods
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name)=>{
            const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
            Object.defineProperty(derivedCtor.prototype, name, descriptor);
        });
        // Copy static properties and methods
        Object.getOwnPropertyNames(baseCtor).forEach((name)=>{
            if (name !== 'prototype') {
                const descriptor = Object.getOwnPropertyDescriptor(baseCtor, name);
                Object.defineProperty(derivedCtor, name, descriptor);
            }
        });
        // Copy instance properties and methods from the instantiated mixin
        Object.getOwnPropertyNames(instance).forEach((name)=>{
            const descriptor = Object.getOwnPropertyDescriptor(instance, name);
            Object.defineProperty(derivedCtor.prototype, name, descriptor);
        });
    });
}
/**
 * Determines whether a function is likely intended to be used as a constructor.
 * @param candidate  The function to check.
 * @returns `true` if the function is likely intended to be used as a 
 * constructor, `false` otherwise.
 * @note This function is not foolproof, but it is a good heuristic for
 * determining whether a function is intended to be used as a constructor.
 * It is based on the assumption that constructor functions typically have
 * methods or properties defined on their prototype.
 * @note **False Negatives:** Constructors that do not define additional 
 * methods or properties on their prototype would be incorrectly identified 
 * as not being constructors. This could happen in cases where a constructor 
 * is used primarily for its side effects or setting instance properties, 
 * without adding methods to the prototype.
 * @note **Edge Cases:** Some built-in constructors or objects from external 
 * libraries might not follow the typical pattern of user-defined constructors,
 * potentially leading to incorrect determinations.
 * @note **False Positives:** It's harder to get false positives with this 
 * approach, but it's not impossible, especially with complex objects that 
 * mimic constructor behavior.
 */ function isLikelyConstructor(candidate) {
    // first ensures that the candidate is of type function, which is a
    // necessary condition for being a constructor.
    if (typeof candidate !== 'function') {
        return false;
    }
    // In JavaScript, constructor functions have a prototype property that is
    // used as the prototype for all instances created with that constructor.
    // This property is an object, which, by default, contains a constructor 
    // property pointing back to the function itself.
    if (candidate.prototype === undefined || candidate.prototype === null) {
        return false;
    }
    // This step attempts to distinguish between functions intended to be used
    // as constructors(which typically have methods or properties defined on 
    // their prototype) and regular functions(which usually do not).
    const prototypeKeys = Object.keys(candidate.prototype).filter((key)=>key !== 'constructor');
    return prototypeKeys.length > 0;
}
///////////////////////////////////////////////////////////////////////////////
function isInstance(value) {
    return typeof value === 'object';
}
// Utilizing the isStatic flag to differentiate
function createObjectWithMethods(staticMethods, instanceMethods) {
    return {
        staticMethods,
        instanceMethods
    };
}
function describeComplexObject(members) {
    return {
        members
    };
}
// - - - - - - - - - - - - - -
// pretty print diff between arrays
function anyToString(value) {
    if (value === undefined) {
        return '<undefined>';
    }
    if (value === null) {
        return '<null>';
    }
    if (typeof value === 'string' && value === '') {
        return '<empty>';
    }
    if (typeof value === 'symbol') {
        return value.toString();
    }
    if (typeof value === 'function') {
        return value.name;
    }
    return String(value);
}
function prettyPrintDiff(listA, listB) {
    const inAandB = (0, _lodash.intersection)(listA, listB);
    const onlyInA = (0, _lodash.difference)(listA, listB);
    const onlyInB = (0, _lodash.difference)(listB, listA);
    const combined = (0, _lodash.union)(Array.from(listA), Array.from(listB));
    const lineNrColWidth = 3;
    const typeColWidth = 9;
    // Find the longest string to pad the columns
    let colWidth = 0;
    [
        combined
    ].forEach((arr)=>{
        arr.forEach((item)=>{
            const len = anyToString(item).length;
            if (len > colWidth) {
                colWidth = len;
            }
        });
    });
    const colSep = ' | ';
    let output = '';
    output += `${String('#').padEnd(lineNrColWidth, ' ')}`;
    output += colSep;
    output += `${String('Type').padEnd(typeColWidth, ' ')}`;
    output += colSep;
    output += `${String('In A').padEnd(colWidth, ' ')}`;
    output += colSep;
    output += `${String('In Both').padEnd(colWidth, ' ')}`;
    output += colSep;
    output += `${String('In B').padEnd(colWidth, ' ')}`;
    output += colSep;
    output += '\n';
    output += `${String('').padEnd(lineNrColWidth, '-')}`;
    output += colSep;
    output += `${String('').padEnd(typeColWidth, '-')}`;
    output += colSep;
    output += `${String('').padEnd(colWidth, '-')}`;
    output += colSep;
    output += `${String('').padEnd(colWidth, '-')}`;
    output += colSep;
    output += `${String('').padEnd(colWidth, '-')}`;
    output += colSep;
    output += '\n';
    // vs-code workaround for terminal buffer size: flush output
    // remove last newline
    console.log(output.slice(0, -1));
    output = '';
    let lineNr = 0;
    // for each item in the union
    (0, _lodash.each)(combined, (item)=>{
        lineNr += 1;
        const onlyA = (onlyInA.includes(item) ? anyToString(item) : '').padEnd(colWidth, ' ');
        const both = (inAandB.includes(item) ? anyToString(item) : '').padEnd(colWidth, ' ');
        const onlyB = (onlyInB.includes(item) ? anyToString(item) : '').padEnd(colWidth, ' ');
        // CHEAT
        const type = typeof Reflect.get(globalThis, item);
        output += `${String(lineNr).padEnd(lineNrColWidth, ' ')}`;
        output += colSep;
        output += `${type.padEnd(typeColWidth, ' ')}`;
        output += colSep;
        output += `${onlyA}`;
        output += colSep;
        output += `${both}`;
        output += colSep;
        output += `${onlyB}`;
        output += colSep;
        output += '\n';
        // vs-code workaround for terminal buffer size: flush output
        // remove last newline
        console.log(output.slice(0, -1));
        output = '';
    });
    return output;
}
// - - - - - - - - - - - - - -
// example / test
class SomeClass {
    static staticMethod() {}
    instanceMethod() {}
    static staticData = 1;
    instanceData = 2;
}
// console.log('count of members in globalThis:', getAllMemberKeys(getAllMembersKV(SomeClass)).size);
// log members one by one with line numbers
// const object = getAllMembersKV(globalThis);
// let lineNr = 0;
// [...Object.getOwnPropertyNames(globalThis), ...Object.getOwnPropertySymbols(globalThis)].forEach((key) => {
//     lineNr += 1;
//     console.log(`${lineNr}. ${String(key)} (${typeof object[key]})`);
// });
console.table([
    getAllMemberKeysAsSet(SomeClass, 0, 0),
    getAllMemberKeysAsSet(new SomeClass(), 0, 0)
]);
// console.log(`Is 'SomeClass' a class constructor? ${isClassConstructor(SomeClass)} `);
// console.log(`Is 'SomeClass' a function constructor? ${isFunctionConstructor(SomeClass)} `);
// console.log(`Can 'SomeClass' be constructed ? ${canBeConstructed(SomeClass)} `);
// console.log(`Can 'SomeClass' be instanciated with new? ${canBeInstanciatedWithNew(SomeClass)} `);
// console.log(`Is 'SomeClass' a likely constructor ? ${isLikelyConstructor(SomeClass)} `);
// console.log(`Is 'SomeClass' an instance ? ${isInstance(SomeClass)} `);
// [SomeClass, new SomeClass].forEach((value) => {
//     console.log(`Static members: ${getStaticMembers(value)} `);
//     console.log(`Static properties: ${getStaticProperties(value)} `);
//     console.log(`Instance members: ${getInstanceMembers(value)} `);
//     console.log(`Instance properties: ${getInstanceProperties(value)} `);
// });
console.log('\nDone!');

//# sourceMappingURL=Mixins.js.map