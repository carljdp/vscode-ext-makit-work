// file: Inspector.mjs

"use strict";
let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

_DEBUG_ = false;

import { Is, Has } from './Assert.mjs';

/**
 * @typedef {boolean} PredicateValue
 * @typedef {(subject: any) => boolean} PredicateFunction
 * @typedef {PredicateValue | PredicateFunction} PredicateExpression
 * @typedef {keyof Inspector.Aspect} AspectModeValue
 * @typedef {keyof Inspector.Combinator} CombinatorValue
 */


export class Inspector {

    /** 
     * The {@linkcode Inspector.Combinator} to be used when evaluating multiple {@linkcode Inspector.expressions}.
     * @readonly
     * @enum {string}
     */
    static get Combinator() {
        return {
            NOT: 'NOT',
            AND: 'AND',
            OR: 'OR',
            NAND: 'NAND',
            NOR: 'NOR',
            XOR: 'XOR',
            XNOR: 'XNOR',
            Undefined: undefined
        }
    }

    /** 
     * The {@linkcode Inspector.Aspect} of the {@linkcode Inspector.subject} to be inspected.
     * @readonly
     * @enum {string}
     */
    static get Aspect() {
        return {
            VALUE: 'VALUE',
            TYPE: 'TYPE'
        }
    }

    /**
     * Begin {@linkcode Inspector} where {@linkcode Inspector.aspectMode} = {@linkcode Inspector.Aspect.VALUE}.
     * @static
     * @construcor
     * @param {any} subject the {@linkcode Inspector.subject} whose **value** is to be inspected.
     * @returns {Inspector} A new {@linkcode Inspector} instance.
     */
    static valueOf(subject) {
        return new Inspector(subject, Inspector.Combinator.Undefined, Inspector.Aspect.VALUE);
    }

    /** 
     * Begin {@linkcode Inspector} where {@linkcode Inspector.aspectMode} = {@linkcode Inspector.Aspect.TYPE}.
     * @static
     * @constructor
     * @param {any} subject the {@linkcode Inspector.subject} whose **type** is to be inspected.
     * @returns {Inspector} a new {@linkcode Inspector} instance.
     */
    static typeOf(subject) {
        return new Inspector(subject, Inspector.Combinator.Undefined, Inspector.Aspect.TYPE);
    }


    /**
     * @private
     * @constructor
     * @param {any} subject the {@linkcode Inspector.subject} whose value or type is to be inspected.
     * @param {CombinatorValue} combinator the {@linkcode CombinatorValue} to be used when evaluating multiple {@linkcode Inspector.expressions}.
     * @param {AspectModeValue} aspect the {@linkcode Inspector~#aspect} to be used when evaluating {@linkcode Inspector.expressions}.
     */
    constructor(subject, combinator, aspect) {
        this._subject = subject;
        this._combinator = combinator;
        this._aspectMode = aspect;
        this._expressions = [];
    }

    /** 
     * The subject that is being inspected.
     * @private
     * @type {any} 
     */
    _subject;

    /**
     * Gets the {@linkcode Inspector.subject} that is being inspected.
     * @returns {any}
     */
    get subject() {
        return this._subject;
    }

    /**
     * @private
     * @type {AspectModeValue}
     */
    _aspectMode;

    /**
     * Gets the {@linkcode Inspector.aspectMode} of the {@linkcode Inspector.subject} being inspected.
     * @returns {AspectModeValue}
     */
    get aspectMode() {
        return this._aspectMode;
    }

    /**
     * The array of {@linkcode Inspector.expressions} to be evaluated for the {@linkcode Inspector.subject}.
     * @private
     * @type {PredicateExpression[]}
     */
    _expressions;

    /**
     * Gets the array of {@linkcode Inspector.expressions} to be evaluated for the {@linkcode Inspector.subject}.
     * @returns {PredicateExpression[]}
     */
    get expressions() {
        return this._expressions;
    }

    /**
     * The {@linkcode Inspector.Combinator} to be used when evaluating multiple {@linkcode Inspector.expressions}.
     * @private @instance @property
     * @type {typeof (keyof Inspector.Combinator)} 
     */
    _combinator;

    /**
     * Gets the {@linkcode Inspector.combinator} to be used when evaluating multiple {@linkcode Inspector.expressions}.
     * @returns {CombinatorValue}
     */
    get combinator() {
        return this._combinator;
    }

    /**
     * Sets {@linkcode Inspector.combinator} to the {@linkcode CombinatorValue} be used when evaluating {@linkcode Inspector.expressions}.
     * @param {CombinatorValue} mode the combinator to use.
     * @throws {TypeError} If the mode is not a string.
     * @throws {RangeError} If the mode is not a valid combinator.
     * @throws {Error} If the mode conflicts with the existing mode.
     * @returns {void} Nothing / non-chaining.
     */
    set combinator(mode) {
        if (typeof mode !== 'string') {
            throw new TypeError(`[Check] Error: Invalid combinator: ${mode}.`);
        }
        const inComingMode = Inspector.Combinator[mode];
        if (inComingMode === undefined) {
            throw new RangeError(`[Check] Error: Invalid combinator: ${mode}`);
        }
        const existingMode = this._combinator;

        if (existingMode === undefined || inComingMode === existingMode) {
            this._combinator = inComingMode;
            return; // non-chaining
        }
        throw new Error(`[Check] Error: '${inComingMode}' combinator cannot be used with '${existingMode}' combinator.`);
    }

    /**
     * Sets the {@linkcode Inspector.combinator} to {@linkcode Inspector.Combinator.AND}.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get AND() {
        this.combinator = Inspector.Combinator.AND;
        return this; // for chaining
    }

    /**
     * Sets the {@linkcode Inspector.combinator} to {@linkcode Inspector.Combinator.OR}.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get OR() {
        this.combinator = Inspector.Combinator.OR;
        return this; // for chaining
    }

    /**
     * Sets the {@linkcode Inspector.combinator} to {@linkcode Inspector.Combinator.XOR}.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get XOR() {
        this.combinator = Inspector.Combinator.XOR;
        return this; // for chaining
    }

    /**
     * Adds a single {@linkcode PredicateExpression} to the array of {@linkcode Inspector.expressions} to be evaluated.
     * @private
     * @param {((any) => boolean)|boolean} expression the expression to add.
     * @returns {void} Nothing.
     * @throws {Error} If the expression is not a predicate function or boolean.
     * 
     * @description
     * This method purposefully does not check for for the presence of a
     * combinator. It is the responsibility of the user to ensure that
     * the combinator is set before expressions are evaluated or solved.
     */
    _addExpression(expression) {
        if (typeof expression === 'function' || typeof expression === 'boolean') {
            this._expressions.push(expression);
            return; // non-chaining
        }
        throw new Error(`[Check] Error: Invalid expression type '${typeof expression}'.\n`);
    }

    /** 
     * Add zero or more {@linkcode PredicateExpression} to the array of {@linkcode Inspector.expressions} to be evaluated.
     * @public
     * @param  {...((any) => boolean|boolean)} args - The {@linkcode PredicateExpression}(s) to add.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    exp(...args) {
        args.forEach((arg) => this._addExpression(arg));
        return this; // for chaining
    }

    // Convenience properties

    /** 
     * Add a {@linkcode Is.True} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get True() { return this.exp(Is.True) }

    /** 
     * Add a {@linkcode Is.False} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get False() { return this.exp(Is.False) }

    /** 
     * Adds a {@linkcode Is.Defined} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get Exists() { return this.exp(Is.Defined) }

    /** 
     * Adds a {@linkcode Is.Defined} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get Defined() { return this.exp(Is.Defined) }

    /** 
     * Adds a {@linkcode Is.Undefined} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get Undefined() { return this.exp(Is.Undefined) }

    /** 
     * Adds a {@linkcode Is.Null} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get Null() { return this.exp(Is.Null) }

    /** 
     * Adds a {@linkcode Is.NotNull} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get NotNull() { return this.exp(Is.NotNull) }

    /** 
     * Adds a {@linkcode Is.DefinedAndNotNull} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get DefinedAndNotNull() { return this.exp(Is.DefinedAndNotNull) }

    /** 
     * Adds a {@linkcode Is.UndefinedOrNull} {@linkcode PredicateFunction} to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     */
    get UndefinedOrNull() { return this.exp(Is.UndefinedOrNull) }

    /** 
     * Adds a {@linkcode PredicateFunction} checking for strict equality ({@linkcode Inspector.subject} `===` `value`) to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @returns {Inspector|boolean}
     */
    strictly(value) {
        return this.exp((subject) => subject === value);
    }

    /** 
     * Adds a {@linkcode PredicateFunction} checking for loose equality ({@linkcode Inspector.subject} `==` `value`) to the array of {@linkcode Inspector.expressions}, to be evaluated later when {@linkcode Inspector.resolve} is called.
     * @param {any} value - The value to compare against.
     * @returns {Inspector|boolean}
     */
    loosely(value) {
        return this.exp((subject) => subject == value);
    }



    // The resolver

    /** 
     * Evaluates all {@linkcode Inspector.expressions} on the 
     * {@linkcode Inspector.subject} using the specified 
     * {@linkcode Inspector.combinator} & 
     * {@linkcode Inspector.aspectMode}, and returns the 
     * {@linkcode Inspector.resolve}d `boolean` result if no 
     * errors were encountered.
     * 
     * @returns {boolean} The result of the check.
     * 
     * @throws {RangeError} When there are any invalid combinations of inputs.
     * @throws {TypeError} When an intermediate expression evaluates to an invalid type.
     * @throws {Error} To report any other errors.
     */
    resolve() {

        if (this._aspectMode === Inspector.Aspect.TYPE && (!this._encounteredVerbIs && !this._encounteredVerbIsNot)) {
            throw new RangeError(`[${this.constructor.name}] Error: No type verb encountered.\n`);
        }

        if (this._expressions === undefined || this._expressions === null || this._expressions.length === 0) {
            throw new RangeError(`[${this.constructor.name}] Error: Found no expressions to solve.\n`);
        }
        if (this._expressions.length > 1 && this._combinator === undefined) {
            throw new RangeError(`[${this.constructor.name}] Error: Multiple expressions require a combinator mode.\n`);
        }
        if (this._combinator !== undefined && this._expressions.length === 1) {
            throw new RangeError(`[${this.constructor.name}] Error: '${this._combinator}' combinator implies multiple expressions.\n`);
        }
        if (_DEBUG_) {
            console.debug(`[${this.constructor.name}] DEBUG: Evaluating ${this._expressions.length} expression(s)...`);
        }

        let invalidExpressionCount = 0;
        return this._expressions
            .map((expression) => {
                let result = undefined;
                switch (typeof expression) {
                    case 'function':
                        result = expression(this._subject);
                        break;
                    case 'boolean':
                        result = expression;
                        break;
                    default:
                        throw new TypeError(`Unexpected '${typeof expression}' expression:`, expression);
                }

                if (typeof result === 'boolean') {
                    return result;
                }
                else {
                    invalidExpressionCount++;
                    return new TypeError(`Invalid expression result:`, result);
                }

            })
            .map((expression) => {
                if (_DEBUG_) {
                    const displayValue = (expression instanceof Error)
                        ? `<invalid>`
                        : expression;
                    console.debug(`[${this.constructor.name}] DEBUG: expr eval -> ${displayValue}`);
                }
                return expression;
            })
            .reduce((previous, current, idx, arr) => {
                // short-circuit: if we encountered an invalid expression above
                if (invalidExpressionCount > 0) {
                    throw new Error(`[${this.constructor.name}] Error: Encountered ${invalidExpressionCount} invalid expressions.\n`);
                }

                switch (this._combinator) {
                    case Inspector.Combinator.AND:
                        return previous && current;
                    case Inspector.Combinator.OR:
                        return previous || current;
                    case undefined:
                        if (arr.length === 1 && idx === 0) {
                            return current;
                        }
                    default:
                        throw new Error(`[${this.constructor.name}] Error: Combination mode '` +
                            `${this._combinator}' not yet implemented, or` +
                            ` not valid for ${this._expressions.length} ` +
                            `expression(s).\n`);
                }
            },
                // initial value depends on the type of operation to be performed
                this._combinator === Inspector.Combinator.AND);
    }

    /**
     * Shorthand for {@linkcode Inspector.resolve}.
     * @returns {boolean} The result of the check.
     */
    get $() {
        return this.resolve();
    }


    /**
     * @typedef {boolean} OnResolvedPredicateVal
     * @typedef {(inspectorContext: Inspector, customContext: Object ...args: any[]) => boolean} OnResolvedPredicateFn
     * @typedef {OnResolvedPredicateVal | OnResolvedPredicateFn} OnResolvedPredicateExpression
     * 
     * @typedef {any} OnResolvedCallbackVal
     * @typedef {(inspectorContext: Inspector, customContext: Object ...args: any[]) => any} OnResolvedCallbackFn
     * @typedef {OnResolvedCallbackVal | OnResolvedCallbackFn} OnResolvedCallbackExpression
     * 
     * @typedef {{ if$: OnResolvedPredicateExpression, do$: OnResolvedCallbackExpression, el$: OnResolvedCallbackExpression, catchAndReturnErrAsValue: boolean }} DoResolveOptions
     * 
     * @typedef {{ do$: OnResolvedCallbackExpression, el$: OnResolvedCallbackExpression, catchAndReturnErrAsValue: boolean }} OnSomePredicateOptions
     */

    /**
     * @private
     * @returns {DoResolveOptions}
     */
    get _defaultDoResolveOptions() {
        return {
            if$: undefined, // not our place - user must provide a predicate
            do$: (inspectorContext, customContext, ...args) => void undefined,
            el$: (inspectorContext, customContext, ...args) => void undefined,
            catchAndReturnErrAsValue: false
        }
    }

    /**
     * Return a value or execute a callback based on the result of a specified predicate.
     * @param {DoResolveOptions} options - The options object that contains the predicate and callback functions.
     * @param {Object} customContext - The optional context to pass along to the callback functions.
     * @param  {...any} args - Optional extra arguments to pass along to the callback functions.
     * @returns {OnResolvedCallbackVal|ReturnType<OnResolvedCallbackFn>|Error} - depending on the result of the predicate and the callback functions, or an error if the predicate threw an error.
     * @throws {TypeError} If the options are invalid.
     */
    do(options, customContext, ...args) {
        if (!typeof options === 'object') {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid options: ${options}, expected an object.`);
        }
        const defaultsWithUserOpts = Object.assign(this._defaultDoResolveOptions, options);
        if ((typeof options.if$ !== 'boolean' && typeof options.if$ !== 'function') || options.if$ === undefined) {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid predicate: ${options.if$}, expected a boolean or function.`);
        }

        if (Is.Defined(customContext) && typeof customContext !== 'object') {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid context type '${typeof customContext}', if you don't need a context, pass 'undefined' or 'null'.`);
        }

        const _inspectContext = this;
        const _customContext = customContext;

        /**
         * Gracefully catch and return errors thrown by predicate functions that were passed in from outside.
         * @param {OnResolvedPredicateExpression|OnResolvedCallbackExpression} expression 
         * @param {Inspector} inspectContext our local context
         * @param {Object} customContext user supplied context
         * @param  {...any} args user supplied arguments
         * @returns {any|Error} The result of the expression, or an error if the expression threw an error.
         */
        const safeEvalPredicateLike = (expression, inspectContext, customContext, ...args) => {

            try {
                return (typeof expression === 'function')
                    ? expression(inspectContext, customContext, ...args)
                    : expression;

            } catch (error) {

                if (defaultsWithUserOpts.catchAndReturnErrAsValue === true) {
                    if (_DEBUG_) console.info(`[${this.constructor.name}] Info: Returning caught error as value:`, error);
                    return error;
                }
                else {
                    if (_DEBUG_) console.error(`[${this.constructor.name}] Error:`, error);
                    throw error;
                }

            }
        }

        const branchToTake = safeEvalPredicateLike(options.if$, _inspectContext, _customContext, ...args);
        if (typeof branchToTake !== 'boolean') {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid predicate result: ${branchToTake}, expected boolean.`);
        }

        return (branchToTake === this.resolve())
            ? safeEvalPredicateLike(options.do$, _inspectContext, _customContext, ...args)
            : safeEvalPredicateLike(options.el$, _inspectContext, _customContext, ...args);
    }

    /**
     * Return a value or execute a callback if the {@linkcode Inspector.resolve} result is `true`.
     * @param {OnSomePredicateOptions} options
     * @param  {...any} args - Optional extra arguments to pass along to the callback functions.
     * @returns {OnResolvedCallbackVal|ReturnType<OnResolvedCallbackFn>}
     * @throws {TypeError} If the options are invalid.
     */
    then(options, customContext, ...args) {
        if (typeof options !== 'object') {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid options: ${options}, expected an object.`);
        }
        if (Reflect.has(options, 'if$')) {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid options: ${options}, 'if$' is not allowed when using 'then', consider using 'do'.`);
        }
        if (Reflect.has(options, 'el$')) {
            throw new TypeError(`[${this.constructor.name}] Error: Invalid options: ${options}, 'el$' is not allowed when using 'then', consider using 'do'.`);
        }
        const defaultsWithUserOpts = Object.assign(this._defaultDoResolveOptions, options);
        return this.do(
            Object.assign(defaultsWithUserOpts, { if$: true }),
            customContext,
            ...args
        );
    }

    /** Implicit type coercion
     * @returns {boolean} The result of {@linkcode Inspector.resolve}ing all {@linkcode Inspector.expressions}.
     * @throws {Error} If there are no expressions to resolve.
     * @description
     * This method is called when the {@linkcode Inspector} instance is used in a type coercion context.
     * It returns the result of {@linkcode Inspector.resolve}ing all {@linkcode Inspector.expressions}.
     */
    get [Symbol.toPrimitive]() {
        return (hint) => {
            let result = false;
            try {
                result = this.resolve();
            } catch (error) {
                console.error(`[${this.constructor.name}] Error:`, error);
                // Note: we're not re-throwing the error here, because we want to return a default value.
                // -> this is a type coercion context, so we should return a value of the expected type.
                // -> also helpful for debugging, as it allows the code to continue running.
            }
            switch (hint || 'default') {
                case 'string':
                    console.warn(`[${this.constructor.name}] WARN: Implicit type coercion of '${result}' to 'string'.`);
                    return String(result);
                case 'number':
                    console.warn(`[${this.constructor.name}] WARN: Implicit type coercion of '${result}' to 'number'.`);
                    return Number(result);
                case 'boolean':
                case 'default':
                default:
                    console.warn(`[${this.constructor.name}] WARN: Implicit type coercion of '${result}' to 'boolean'.`);
                    return Boolean(result);
            }
        }
    }


    /**
     * Returns a string representation of the object.
     * @returns {string} The string representation of the object.
     */
    get [Symbol.toStringTag]() {
        return (this.constructor)
            // return something like '[object Inspector]'
            ? this.constructor.name || '<anonymous>'
            : '<unknown>';
    }

    toString() {
        return this[Symbol.toPrimitive]('string');
    }

    valueOf() {
        return this[Symbol.toPrimitive]('number');
    }


    // get [Symbol.iterator]() {
    //     return this._expressions[Symbol.iterator];
    // }

    /**
     * If we want to ensure instances of this class stay instances of this class,
     * even when subclassed, or when the class is used as a mixin.
     */
    get [Symbol.species]() {
        return this.constructor;
    }

    // get [Symbol.hasInstance]() {
    //     return (instance) => instance instanceof Check;
    // }

    // get [Symbol.match]() {
    //     return this.$;
    // }

    // get [Symbol.replace]() {
    //     return this.$;
    // }

    // get [Symbol.search]() {
    //     return this.$;
    // }

    // get [Symbol.split]() {
    //     return this.$;
    // }

    // get [Symbol.unscopables]() {
    //     return {
    //         $: true,
    //         exp: true,
    //         True: true,
    //         False: true,
    //         Defined: true,
    //         Undefined: true,
    //         Null: true,
    //         NotNull: true,
    //         DefinedAndNotNull: true,
    //     }
    // }

    //

    // NEW FEATURE: NOT FULLY TESTED WITH EXISTING CODE
    //  -> type checking is a new feature, and we're not sure how it might affect
    //     the existing code, so we're going to throw an error for now.

    _encounteredVerbIs = false;

    get encounteredVerbIs() {
        return this._encounteredVerbIs;
    }

    _encounteredVerbIsNot = false;

    get encounteredVerbIsNot() {
        return this._encounteredVerbIsNot;
    }

    /** 
     * Sets the `mode` to {@linkcode Inspector.Aspect.TYPE}.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     * @throws {Error} If new mode conflicts with the existing mode.
     */
    get Is() {
        if (this.aspectMode !== Inspector.Aspect.TYPE) {
            // Beacuse this is a new feature, we're going to throw an error
            //  since we're not sure how it might affect the existing code.
            throw new Error(`[Check] Error: 'Is' verb can only be used in TYPE mode.`);
        }
        if (this._encounteredVerbIs || this._encounteredVerbIsNot) {
            throw new Error(`[Check] Error: Only one TYPE verb can be used at a time.`);
        }
        this._encounteredVerbIs = true;
        return this;
    }

    /**
     * Sets the `mode` to {@linkcode Inspector.Aspect.TYPE}.
     * @returns {Inspector} The {@linkcode Inspector} instance (for chaining).
     * @throws {Error} If new mode conflicts with the existing mode.
     */
    get IsNot() {
        if (this.aspectMode !== Inspector.Aspect.TYPE) {
            // Beacuse this is a new feature, we're going to throw an error
            //  since we're not sure how it might affect the existing code.
            throw new Error(`[Check] Error: 'IsNot' verb can only be used in TYPE mode.`);
        }
        if (this._encounteredVerbIs || this._encounteredVerbIsNot) {
            throw new Error(`[Check] Error: Only one TYPE verb can be used at a time.`);
        }
        this._encounteredVerbIsNot = true;
        return this;
    }


    get Object() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Object);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Object(subject));
        }
        throw new Error(`[Check] Error: 'Object' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get Function() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Function);
        }
        if (this._encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Function(subject));
        }
        throw new Error(`[Check] Error: 'Function' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get Symbol() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Symbol);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Symbol(subject));
        }
        throw new Error(`[Check] Error: 'Symbol' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get String() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.String);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.String(subject));
        }
        throw new Error(`[Check] Error: 'String' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get Number() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Number);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Number(subject));
        }
        throw new Error(`[Check] Error: 'Number' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get BigInt() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.BigInt);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.BigInt(subject));
        }
        throw new Error(`[Check] Error: 'BigInt' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get Boolean() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Boolean);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Boolean(subject));
        }
        throw new Error(`[Check] Error: 'Boolean' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get Array() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Array);
        }
        if (this._encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Array(subject));
        }
        throw new Error(`[Check] Error: 'Array' can only be used in conjunction with 'Is' or IsNot.`);
    }

    get Primitive() {
        if (this.encounteredVerbIs) {
            return this.exp(Is.Primitive);
        }
        if (this.encounteredVerbIsNot) {
            return this.exp((subject) => !Is.Primitive(subject));
        }
        throw new Error(`[Check] Error: 'Primitive' can only be used in conjunction with 'Is' or IsNot.`);
    }

}


export class TypeInspector extends Inspector {

    /**
     * Creates a new {@linkcode TypeInspector} instance.
     * @static
     * @param {any} subject - The subject to be inspected.
     * @returns {TypeInspector} A new {@linkcode TypeInspector} instance.
     */
    static of(subject) {
        return new TypeInspector(subject);
    }

    /**
     * Creates a new {@linkcode TypeInspector} instance.
     * @param {any} subject - The subject to be inspected.
     * @param {CombinatorValue} combinator - The combinator to be used when evaluating multiple expressions.
     * @returns {TypeInspector} A new {@linkcode TypeInspector} instance.
     * @throws {TypeError} If super constructor throws an error.
     */
    constructor(subject, combinator) {
        super(subject, combinator, Inspector.Aspect.TYPE);

        // Proxy to intercept get accessors
        return new Proxy(this, {
            get(target, prop, receiver) {

                const result = Reflect.get(...arguments);

                if (_DEBUG_) {

                    const DEBUG_PRINT_HIDDEN_PROPS = false;
                    const DEBUG_PRINT_PUPLIC_PROPS = false;

                    if ([DEBUG_PRINT_HIDDEN_PROPS, DEBUG_PRINT_PUPLIC_PROPS].every((val) => val === false)) {
                        return result;
                    }

                    const resursiveFindPropDescriptor = (target, prop) => {
                        const propDescriptor = Reflect.getOwnPropertyDescriptor(target, prop);
                        if (propDescriptor) {
                            return propDescriptor;
                        }
                        const proto = Reflect.getPrototypeOf(target);
                        if (proto) {
                            return resursiveFindPropDescriptor(proto, prop);
                        }
                        return undefined;
                    }
                    const propDescriptor = resursiveFindPropDescriptor(target, prop);

                    const isReadableDataProp = (propDescriptor)
                        ? propDescriptor.enumerable
                        : false;

                    const isReadableAccessorProp = (propDescriptor)
                        ? !propDescriptor.set || (propDescriptor.set && propDescriptor.get)
                        : false;

                    const isPrivate = typeof prop === 'symbol' || prop.match(/^[_#$].+/);
                    const isReadable = isReadableDataProp || isReadableAccessorProp;

                    const targetLogTag = Reflect.getPrototypeOf(target).constructor.name;
                    const propLogTag = typeof prop === 'symbol' ? prop.toString() : prop;

                    const modifierString = (isPrivate || !isReadable)
                        ? `hidden`
                        : `public`;

                    const resultLog = (result instanceof Inspector)
                        ? `${targetLogTag}`
                        : typeof result === 'function'
                            ? `function ${result.name}()`
                            : typeof result === 'string'
                                ? `'${result}'`
                                : `${result}`;

                    if (modifierString === 'hidden') {
                        if (DEBUG_PRINT_HIDDEN_PROPS) {
                            console.debug(`[${targetLogTag}] DEBUG: get('${propLogTag}'): ${resultLog} (${modifierString})`);
                        }
                    }
                    else {
                        if (DEBUG_PRINT_PUPLIC_PROPS) {

                            if (String(propLogTag).toLowerCase() in [
                                'string',
                                'number',
                                'bigint',
                                'boolean',
                                'symbol',
                                'object',
                                'function',
                                'array',
                            ]) {
                                console.debug(`[${targetLogTag}] DEBUG: get('${propLogTag}'): ${resultLog}`);
                            }

                            console.debug(`[${targetLogTag}] DEBUG: get('${propLogTag}'): ${resultLog}`);
                        }
                    }
                    return result;

                }
                else {
                    return result;
                }

            }
        });
    }

    get [Symbol.toPrimitive]() {
        return (hint) => {
            console.debug(`[${this.constructor.name}] DEBUG: ${this.constructor.name}[Symbol.toPrimitive]('${hint}')`);
            return super[Symbol.toPrimitive](hint);
        }
    }
}
