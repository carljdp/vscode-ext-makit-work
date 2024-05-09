// file: playground.mjs


let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

import { Is, Has } from './Assert.mjs';
import { Inspector, TypeInspector } from './Inspector.mjs';


/** FeatureDescriptor - Describes an EcmaScript feature (for runtime feature checking). 
 * @typedef {{ feature: Function, name: string, typeOf: 'symbol' | 'function' }} FeatureDescriptor */


/** The default ES6 feature descriptor set (for runtime feature checking).
 * @type {FeatureDescriptor[]} */
export const es6FeatureSet = [
    { feature: Symbol, name: 'Symbol', typeOf: 'function' },
    { feature: Symbol.iterator, name: 'Symbol.iterator', typeOf: 'symbol' },
    { feature: Object.assign, name: 'Object.assign', typeOf: 'function' },
    { feature: Object.defineProperty, name: 'Object.defineProperty', typeOf: 'function' },
    { feature: Object.getPrototypeOf, name: 'Object.getPrototypeOf', typeOf: 'function' },
    { feature: Object.setPrototypeOf, name: 'Object.setPrototypeOf', typeOf: 'function' },
    { feature: Object.getOwnPropertyDescriptors, name: 'Object.getOwnPropertyDescriptors', typeOf: 'function' },
    { feature: Object.getOwnPropertySymbols, name: 'Object.getOwnPropertySymbols', typeOf: 'function' },
    { feature: Object.is, name: 'Object.is', typeOf: 'function' },
    { feature: Object.entries, name: 'Object.entries', typeOf: 'function' },
    { feature: Object.values, name: 'Object.values', typeOf: 'function' },
    { feature: Object.keys, name: 'Object.keys', typeOf: 'function' },
    { feature: Array.isArray, name: 'Array.isArray', typeOf: 'function' },
    { feature: Array.prototype.includes, name: 'Array.prototype.includes', typeOf: 'function' },
    { feature: Array.prototype.find, name: 'Array.prototype.find', typeOf: 'function' },
    { feature: Array.prototype.findIndex, name: 'Array.prototype.findIndex', typeOf: 'function' },
    { feature: Array.prototype.fill, name: 'Array.prototype.fill', typeOf: 'function' },
    { feature: Array.prototype.map, name: 'Array.prototype.map', typeOf: 'function' }
];

/** Runtime feature checker for EcmaScript features.
 * If no feature set is provided, the default ES6 feature set is used.
 * @param {FeatureDescriptor[]} [featureSet] - The set of features to check.
 * @throws {TypeError} If the argument is not valid.
 * @throws {Error} Combined error message of missing features, if any.
 */
export const checkRuntimeFeatures = (featureSet = es6FeatureSet) => {
    if (featureSet === undefined || featureSet === null || !Array.isArray(featureSet)) {
        throw new TypeError('Invalid feature set: expected an array.');
    }
    const missingFeatures = [];
    featureSet.forEach((descriptor) => {
        // the shape of the descriptor object we're expecting:
        const d = Object.assign({
            feature: undefined,
            name: 'unknown',
            typeOf: 'unknown'
        }, descriptor);

        if (d.typeOf === 'symbol') {
            if (typeof d.feature !== d.typeOf) missingFeatures.push(d.name);
        }
        else if (d.typeOf === 'function') {
            if (typeof d.feature !== 'function') missingFeatures.push(d.name);
        }
        else {
            throw new Error(`Feature descriptor has invalid 'typeOf' value: '${d.typeOf}'`);
        }
    });
    if (missingFeatures.length > 0) {
        throw new Error(`[Script] Runtime does not support: ${missingFeatures.join(', ')}.`);
    }
}






// console.log(new TypeInspection(1).Is.Number.$);
// console.log(TypeInspection.of(1).Is.Number.$);


// const someTestSubject = true;
// IfType.of(someTestSubject).Is.Number.onResolved({
//     if$: (inspect) => inspect.$ === true,
//     do$: (inspect) => console.log(`type check on ${inspect.subject} evaluated to true`),
//     el$: (inspect) => console.log(`type check on ${inspect.subject} evaluated to false`),
// });

/**
 * Converts the given value to a primitive value.
 *
 * @param {any} any - The value to be converted.
 * @param {string} hint - The hint for the conversion.
 * @returns {string|number|boolean} The converted primitive value.
 * @throws {TypeError} If the conversion result is not a primitive value.
 */
function anyToPrimitive(any, hint) {
    // return as-is if already a primitive value
    if (Inspector.valueOf(any).Is.Primitive.$) {
        return any;
    }
    // still here? so we're dealing with a non-primitive value
    if (!hint in ['string', 'number', 'boolean', 'default']) {
        throw new TypeError(`Invalid hint: '${hint}'`);
    }
    // return the result of the @@toPrimitive method if it exists
    const toPrimitiveFn = any[Symbol.toPrimitive];
    if (Inspector.valueOf(toPrimitiveFn).Exists.$ && Inspector.valueOf(toPrimitiveFn).Is.Function.$) {
        const val = toPrimitiveFn.call(any, hint || 'default');
        if (Inspector.valueOf(val).IsNot.Primitive.$) {
            throw new TypeError('@@toPrimitive must return a primitive value.');
        }
        return val;
    }
    switch (hint) {
        case 'string':
            return String(any);
        case 'number':
            return Number(any);
        case 'boolean':
            return Boolean(any);
        default:
            return String(any);
    }
}

/**
 * Converts a value to a property key.
 *
 * @param {any} value - The value to convert.
 * @returns {string|symbol} The converted property key.
 */
function anyToPropertyKey(value) {
    const key = anyToPrimitive(value, 'string');
    return Inspector.valueOf(key).Is.Symbol.$ ? key : String(key);
}

/**
 * Defines the properties of an object.
 *
 * @param {Object|Function} target - The target object to define properties on.
 * @param {Array} propDescriptors - An array of property descriptors.
 */
function __defineProperties(target, propDescriptors) {
    if (!Is.Object(target) && !Is.Function(target)) {
        throw new TypeError(`Invalid target: ${target}, expected an object or function.`);
    }
    if (!Is.Array(propDescriptors) || propDescriptors.some((d) => !Is.Object(d))) {
        throw new TypeError(`Invalid property descriptors: ${propDescriptors}, expected an array of descriptors`)
    }

    for (let i = 0; i < propDescriptors.length; i++) {
        const descriptor = propDescriptors[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;

        Inspector.valueOf(descriptor.value).Exists.onPass({
            do$: () => descriptor.writable = true
        });

        Object.defineProperty(target, anyToPropertyKey(descriptor.key), descriptor);
    }
}


/**
 * Creates a class with the given constructor, prototype properties, and static properties.
 *
 * @param {Function} namedCtorFn - The constructor function of the class.
 * @param {Array} instanceProps - The prototype properties of the class.
 * @param {Array} staticProps - The static properties of the class.
 * @returns {Function} - The created class constructor.
 */
function createClass(namedCtorFn, instanceProps, staticProps) {
    TypeInspector.of(namedCtorFn).IsNot.Function.then({
        do$: () => { throw new TypeError(`Invalid constructor: ${namedCtorFn}`) }
    });

    if (Is.DefinedAndNotNull(instanceProps)) {
        __defineProperties(namedCtorFn.prototype, instanceProps);
    }
    if (Is.DefinedAndNotNull(staticProps)) {
        __defineProperties(namedCtorFn, staticProps);
    }
    Object.defineProperty(namedCtorFn, 'prototype', { writable: false });
    return namedCtorFn;
}

/**
 * Checks if an instance is an instance of a given constructor function.
 *
 * @param {Object} thing - The instance to check.
 * @param {Function} Constructor - The constructor function to check against.
 * @throws {TypeError} - If the instance is not an instance of the constructor function.
 */
function classConstructorCallCheck(thing, Constructor) {
    if (!(thing instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}


function Script(options, ...args) {
    'use strict;'

    const _defaultOptions = {
        name: 'anonymous',
        ext: 'js',
        eol: '\n',
        encoding: 'utf8',
        indentOpt: {
            char: ' ',
            size: 4
        }
    };
    const _options = Object.assign({}, _defaultOptions, options);

    if (typeof this !== 'object') {
        throw new Error(`[Script] Invalid invocation: 'this' is
            not an object, but a ${typeof this}`);
    }

    // if called without 'new', return a new instance
    if (this === undefined || this === globalThis) {

        throw new Error(`[Script] Invalid invocation: 'this' is
            not an object, but a ${typeof this}`);
        // return new ScriptObj(_options, ...args);
    }

    // if called with 'new', initialize the instance
    else {

        // spread the options args into the instance
        Object.assign(this, _options);

        /**
         * @private @instance @memberof ScriptObj
         * @type {string[]} The lines of the script.
         * */
        let _scriptLines = [];

        this._resetBaseIndent = () => {
            this._baseIndentLevel = 0;
            this._baseIndentStr = '';
        }

        this._resetTaskIndent = () => {
            this._indentTaskHasOwner = false;
            this._indentTaskPending = false;
            this._indentTaskStr = '';
        }

        this._ = (arg) => {
            const width = (typeof arg === 'number')
                ? arg
                : (typeof arg === 'string')
                    ? arg.length
                    : 0;

            this._indentTaskHasOwner = false;
            this._indentTaskPending = true;
            this._indentTaskStr = this.indentOpt.char.repeat(width);

            return this; // for chaining
        }

        /** Set the base indent level */
        this._lvl = (n = 0) => {

            if (typeof n !== 'number') {
                throw new Error(`[Script] Invalid indentation level: ${n}`);
            }
            this._baseIndentLevel = n;
            this._baseIndentStr = this.indentOpt.char.repeat((n) * this.indentOpt.size);
            return this; // for chaining
        }

        /** Increase the base indent level */
        this.indent = () => {
            this._lvl(this._baseIndentLevel + 1);
            return this; // for chaining
        }

        /** Decrease the base indent level */
        this.undent = () => {
            this._lvl(this._baseIndentLevel > 0 ? this._baseIndentLevel - 1 : 0);
            return this; // for chaining
        }



        /** Append all args as concatenated single line. */
        this.appendAsLine = (...args) => {
            try {

                if (TypeInspector.of(args).IsNot.Array.$ || args.some((arg) => TypeInspector.of(arg).IsNot.String.$)) {
                    throw new Error(`[Script] Invalid argument(s): ${args}`);
                }

                let __inlineIndentOwnedByMe = false;

                // take indent ownership if not already taken
                if (this._indentTaskPending && !this._indentTaskHasOwner) {
                    __inlineIndentOwnedByMe = true;
                    this._indentTaskHasOwner = true;
                }

                if (Inspector.valueOf(args.length).strictly(0).$ || ((Inspector.valueOf(args.length).strictly(1).$ && Inspector.valueOf(args[0]).UndefinedOrNull.$))) {

                    // release indent ownership if owned by me
                    if (this._indentTaskPending && __inlineIndentOwnedByMe) {
                        this._resetTaskIndent();
                        __inlineIndentOwnedByMe = false;
                    }

                    return this; // for chaining
                }
                const line = args.reduce((previous, current) => {
                    if (typeof current !== 'string') {
                        throw new Error(`Expected all args to be 'string', encountered '${typeof current}': ${current}`);
                    }
                    return previous + current;
                }, '');

                const _baseIndent = this._baseIndentStr || '';
                const _taskIndent = this._indentTaskStr || '';

                _scriptLines.push(_baseIndent + _taskIndent + line);

                // release indent ownership if owned by me
                if (this._indentTaskPending && __inlineIndentOwnedByMe) {
                    this._resetTaskIndent();
                    __inlineIndentOwnedByMe = false;
                }

                return this; // for chaining  
            } catch (error) {
                throw new Error(`[Script] Error during appendAsLine():\n\t${error.message}`);
            }
        }

        /** Append each arg individually as a seperate line. */
        this.appendAsLines = (...args) => {
            try {

                let inlineIndentOwnedByMe = false;

                // take indent ownership if not already taken
                if (this._indentTaskPending && !this._indentTaskHasOwner) {
                    inlineIndentOwnedByMe = true;
                    this._indentTaskHasOwner = true;
                }


                if (
                    (args.length === 0) ||
                    (args.length === 1 && (args[0] === null || args[0] === undefined))
                ) {

                    // release indent ownership if owned by me
                    if (this._indentTaskPending && inlineIndentOwnedByMe) {
                        this._resetTaskIndent();
                        inlineIndentOwnedByMe = false;
                    }

                    return this; // for chaining
                }
                args.forEach((arg) => {
                    this.appendAsLine(arg);
                });

                // release indent ownership if owned by me
                if (this._indentTaskPending && inlineIndentOwnedByMe) {
                    this._resetTaskIndent();
                    inlineIndentOwnedByMe = false;
                }

                return this; // for chaining
            } catch (error) {
                throw new Error(`[Script] Error during appenAsLines():\n\t${error.message}`);
            }
        }



        this.clear = () => {
            _scriptLines = [];
            this._resetBaseIndent();
            this._resetTaskIndent();

            return this; // for chaining
        }

        /** 
         * @name totalLineCount
         * @readonly @instance @memberof Script
         */
        Object.defineProperty(this, 'totalLineCount', {
            get: () => _scriptLines.length
        });

        /**
         * @name totalCharCount
         * @readonly @instance @memberof Script
         */
        Object.defineProperty(this, 'totalCharCount', {
            get: () => _scriptLines.reduce((previous, current) => previous + current.length, 0)
        });


        Object.defineProperty(this, 'lines', {
            get: () => _scriptLines
        });


        this.toString = () => {
            return _scriptLines.join(this.eol);
        }

        this.valueOf = this.toString;

        this[Symbol.iterator] = () => _scriptLines[Symbol.iterator]();

        this[Symbol.toStringTag] = `${Object.getPrototypeOf(this).constructor.name}<${this.name}.${this.ext}>`;

        this[Symbol.toPrimitive] = (hint) => {
            switch (hint) {
                case 'string':
                    return this.toString();
                case 'boolean':
                    return this.totalCharCount > 0;
                case 'default':
                default:
                    throw new Error(`[Script] Implicit conversion to ${hint} not implemented.`);
            }
        }

        this._resetBaseIndent();
        this._resetTaskIndent();
        return this;

    }

}

const baseFunctionBody = (options) => {

    const _options = Object.assign({
        useStrict: true,
        statements: [],
        returnValue: 'void undefined',
    }, options);

    let script = new Script();
    script.appendAsLine('"use strict";');
    script.appendAsLines(..._options.statements);
    script.appendAsLine(`return ${_options.returnValue};`);

    return script;
}


const FunctionFactory = {

    namedFnMaker: (options) => {

        const opts = Object.assign({
            fnName: 'anonymous',
            useStrict: true,
            statements: [],
            returnValue: undefined
        }, options);

        if (opts.fnName === 'eval') {
            throw new Error(`Invalid function name: '${opts.fnName}'`);
        }

        if (!/^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(opts.fnName)) {
            throw new Error(`Invalid function name: '${opts.fnName}'`);
        }

        const baseAnonFnBodyScript = baseFunctionBody(opts)

        const script = new Script();
        script.appendAsLine('"use strict";');
        script.appendAsLine(`return function ${opts.fnName}() {`);
        script._('....').appendAsLines(...baseAnonFnBodyScript.lines);
        script.appendAsLine('};');

        const fnBody = script.toString();
        const namedFnFactory = new Function(fnBody);

        return namedFnFactory;
    },

    namedFnInstance: (options) => {
        const maker = FunctionFactory.namedFnMaker(options);
        const fn = maker();
        return fn;
    }
}


const myNamedFn = FunctionFactory.namedFnInstance({
    fnName: 'helloWorldFn',
    useStrict: true,
    statements: [
        `console.log("Hello, World!");`,
    ],
    returnValue: `void undefined`,
})



const makeClass = (options) => {
    const defaultsWithUserOpts = Object.assign({
        name: 'ClassName',
        instanceProps: undefined,
        staticProps: undefined
    }, options);

    const namedCtorFn = FunctionFactory.namedFnInstance({
        fnName: defaultsWithUserOpts.name,
        useStrict: true,
        statements: [
            `classConstructorCallCheck(this, ${defaultsWithUserOpts.name});`
        ],
        returnValue: 'this'
    });

    const _class = createClass(namedCtorFn, defaultsWithUserOpts.instanceProps, defaultsWithUserOpts.staticProps);

    return _class;
}

const myCounterCtor = makeClass({ name: "Counter" });

const scriptDependenciesStrs = [
    // myNamedFn.toString(),
    classConstructorCallCheck.toString(),
    myCounterCtor.toString()
];


class Variable {

    constructor(type, name, ...args) {
        if (typeof type !== 'string' || !/^(let|const|var)$/.test(type)) {
            throw new TypeError(`Invalid type: ${type}`);
        }

        let _name;
        if (typeof name === 'function') {
            _name = name(...args);
        }
        else {
            _name = name;
        }
        if (typeof _name !== 'string' || !/^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(_name) || _name.length === 0) {
            throw new TypeError(`Invalid name: ${_name}`);
        }

        this.#type = type;
        this.#name = name;
        this.#value = undefined;
        return this;
    }

    #type
    #name;
    #value;

    get type() {
        return this.#type;
    }

    get name() {
        return this.#name;
    }

    get value() {
        return this.#value;
    }

    set value(v) {
        this.#value = v;
    }

    get [Symbol.toPrimitive]() {
        return (hint) => {
            switch (hint) {
                case 'number':
                    return Number(this.#value);
                case 'string':
                case 'default':
                default:
                    return String(this.#value);
            }
        }
    }
    toString() {
        return this[Symbol.toPrimitive]('string');
    }
    valueOf() {
        return this[Symbol.toPrimitive]('default');
    }

    asStatement() {
        return (this.#value === undefined)
            ? `${this.#type} ${this.#name};`
            : `${this.#type} ${this.#name} = ${this.#value};`;
    }
}


// const myVar = new Variable('let', 'myVar');
// myVar.value = 42;
// console.log(myVar.asStatement());


// process.exit(0);



const txt = {

    let: (identifier, value) => {
        return `${value}`.trim().length === 0
            ? `let ${identifier};`
            : `let ${identifier} = ${value};`;
    },
    const: (identifier, value) => {
        return `${value}`.trim().length === 0
            ? `const ${identifier};`
            : `const ${identifier} = ${value};`;
    },
    new: (classIdentifier, ...identifiers) => {
        return `new ${classIdentifier}(${identifiers.join(', ')});`;
    },
    consoleLog: (...args) => {
        return `console.log(${args.join(', ')});`;
    },
    debugger: () => {
        return 'debugger;';
    },
    string: (s) => `\`${String(s)}\``,
    number: (n) => `${Number(n)}`,

    comment: (str) => `// ${str}`,

    inc: (identifier) => `${identifier}++`,
    dec: (identifier) => `${identifier}--`,

    ifThenElse: (condition, thenBlock, elseBlock) => {
        return `if (${condition}) { ${thenBlock} } else { ${elseBlock} }`;
    },


};

// const myScript = new Script();
// myScript.appendAsLine('"use strict";');
// myScript.appendAsLines(...scriptDependenciesStrs);
// myScript.appendAsLine(txt.const('myCounter', txt.new('Counter', txt.number(0))));
// myScript.appendAsLine(txt.consoleLog(txt.string('myCounter:'), 'myCounter'));
// // myScript.appendAsLine(txt.comment(txt.debugger()));
// myScript.appendAsLine(txt.consoleLog(txt.string('done')));

// const myScriptStr = myScript.toString();
// console.log(myScriptStr + '\n\n');

// eval(myScriptStr);


debugger;