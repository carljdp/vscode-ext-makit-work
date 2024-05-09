// file: Assert.mjs

"use strict";
let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

/** i$ utility object */
class Assert {

    /**
     * Returns a new assertion object (for direct chaining)
     * @param {any} subject - The subject that the assertion is being made about
     * @returns {Assert} - The assertion object (for chaining)
     */
    static that(subject) {
        return new Assert(subject)
    }

    /**
     * Creates a new assertion object
     * @param {any} subject - The subject that the assertion is being made about
     * @returns {Assert} - The assertion object (for chaining)
     */
    constructor(subject) {
        this.#subject = subject;
        return this
    }

    /**
     * @private
     * @instance
     * @type {any|undefined}
     */
    #subject = undefined;

    #expression = (subject) => { return Boolean(subject) }

    #strict = true;

    /**
     * @private
     * @instance
     * @type {boolean=false}  - Whether the assertion is inverted
     */
    #invert = false;

    /**
     * Makes an assertion about the subject
     * @returns {Assert} - The assertion object (for chaining)
     */
    get IS() {
        this.#invert = false;
        return this
    }

    /**Negates: assertion about the subject,
     * @returns {Assert} - The assertion object (for chaining)
     */
    get NOT() {
        this.#invert = !Boolean(this.#invert)
        return this
    }

    resolve() {

    }

    get strictly() {
        this.#strict = true
        return this
    }

    get loosely() {
        this.#strict = false
        return this
    }

    static Mode = {
        STRICT: true,
        LOOSE: false
    }

    // Primitives (according to https://developer.mozilla.org/en-US/docs/Glossary/Primitive)




    static checkFn = {

        forType: {

            string: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'string'
                    : typeof subject == 'string'
                return invert ? !result : result
            },

            number: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'number'
                    : typeof subject == 'number'
                return invert ? !result : result
            },

            bigint: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'bigint'
                    : typeof subject == 'bigint'
                return invert ? !result : result
            },

            boolean: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'boolean'
                    : typeof subject == 'boolean'
                return invert ? !result : result
            },

            undefined: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'undefined'
                    : typeof subject == 'undefined'
                return invert ? !result : result
            },

            symbol: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'symbol'
                    : typeof subject == 'symbol'
                return invert ? !result : result
            },

            null: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'object' && subject === null
                    : typeof subject == 'object' && subject == null
                return invert ? !result : result
            },

            object: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'object' && subject !== null
                    : typeof subject == 'object' && subject !== null
                return invert ? !result : result
            },

            function: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? typeof subject === 'function'
                    : typeof subject == 'function'
                return invert ? !result : result
            },

            array: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? Array.isArray(subject)
                    : Array.isArray(subject)
                return invert ? !result : result
            },

            any: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                return true
            }

        },

        forValue: {

            true: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? subject === true
                    : subject == true
                return invert ? !result : result
            },

            false: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? subject === false
                    : subject == false
                return invert ? !result : result
            },

            truthy: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? !!subject
                    : !!subject
                return invert ? !result : result
            },

            falsy: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? !subject
                    : !subject
                return invert ? !result : result
            },

            defined: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? subject !== undefined
                    : subject != undefined
                return invert ? !result : result
            },

            notNull: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? subject !== null
                    : subject != null
                return invert ? !result : result
            },

            definedAndNotNull: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? subject !== undefined && subject !== null
                    : subject != undefined && subject != null
                return invert ? !result : result
            },

            undefinedOrNull: (subject = undefined, strict = Assert.Mode.STRICT, invert = undefined) => {
                const result = (strict)
                    ? subject === undefined || subject === null
                    : subject == undefined || subject == null
                return invert ? !result : result
            },

        }
    }

    get string() {
        this.#expression = Assert.checkFn.forType.string;
        return this
    }

    get number() {
        this.#expression = Assert.checkFn.forType.number;
        return this
    }

    get bigint() {
        this.#expression = Assert.checkFn.forType.bigint;
        return this
    }

    get boolean() {
        this.#expression = Assert.checkFn.forType.boolean;
        return this
    }

    get undefined() {
        this.#expression = Assert.checkFn.forType.undefined;
        return this
    }

    get symbol() {
        this.#expression = Assert.checkFn.forType.symbol;
        return this
    }

    get null() {
        this.#expression = Assert.checkFn.forType.null;
        return this
    }

    // Non-primitives

    get object() {
        this.#expression = Assert.checkFn.forType.object;
        return this
    }

    get function() {
        this.#expression = Assert.checkFn.forType.function;
        return this
    }

    get array() {
        this.#expression = Assert.checkFn.forType.array;
        return this
    }

    // Composites

    get primitive() {
        this.#expression = (subject) => {
            return (
                Assert.that(subject).IS.boolean ||
                Assert.that(subject).IS.string ||
                Assert.that(subject).IS.symbol ||
                Assert.that(subject).IS.number ||
                Assert.that(subject).IS.bigint ||
                Assert.that(subject).IS.undefined ||
                Assert.that(subject).IS.null
            )
        }
        return this
    }

    get any() {
        this.#expression = Assert.checkFn.forType.any;
        return this
    }

    // Convenience

    get true() {
        if (!this.#strict) {
            console.warn('Loose mode is not recommended for true checks')
        }
        this.#expression = Assert.checkFn.forValue.true;
        return this
    }

    get false() {
        if (!this.#strict) {
            console.warn('Loose mode is not recommended for false checks')
        }
        this.#expression = Assert.checkFn.forValue.false;
        return this
    }

    get falsy() {
        if (this.#strict) {
            console.warn('Strict mode is not recommended for falsy checks')
        }
        this.#expression = Assert.checkFn.forValue.falsy;
        return this
    }

    get truthy() {
        if (this.#strict) {
            console.warn('Strict mode is not recommended for truthy checks')
        }
        this.#expression = Assert.checkFn.forValue.truthy;
        return this
    }

    get defined() {
        this.#expression = Assert.checkFn.forValue.defined;
        return this
    }

    get exists() {
        return this.defined
    }

    get notNull() {
        this.#expression = Assert.checkFn.forValue.notNull;
        return this
    }

    get definedAndNotNull() {
        this.#expression = Assert.checkFn.forValue.definedAndNotNull;
        return this
    }

    get undefinedOrNull() {
        this.#expression = Assert.checkFn.forValue.undefinedOrNull;
        return this
    }

    get instance() {
        this.#expression = (subject) => {
            return (Assert.that(subject).IS.object.resolve() &&
                (Has.SomePrototype(subject) || Has.NullPrototype(subject)))
        }
        return this
    }

    /**
     * Resolves the assertion to a boolean value
     * @returns {boolean} - The result of the assertion
     */
    resolve() {
        try {
            return this.#expression(this.#subject, this.#strict, this.#invert)
        } catch (error) {
            throw new Error(`[${this.constructor.name}] Error: During 'resolve()', failed to evaluate expression: ${this.#expression.toString()}`, error);
        }
    }

    /** 
     * A shorthand for the 'resolve()' method
     * @returns {boolean} - The result of the assertion
     */
    get $() {
        return this.resolve()
    }

    get [Symbol.toPrimitive]() {
        return (hint) => {
            try {
                const result = this.$
                switch (hint) {
                    case 'string':
                        return String(result)
                    case 'number':
                        return Number(result)
                    case 'boolean':
                    case 'default':
                    default:
                        return Boolean(result)
                }
            } catch (_) {
                return false
            }
        }
    }

    toString() {
        return () => {
            this[Symbol.toPrimitive]('string')
        }
    }

    valueOf() {
        return () => {
            this[Symbol.toPrimitive]('number')
        }
    }

}

export class Is {

    static String = (value) => Assert.that(value).IS.string.$
    static Number = (value) => Assert.that(value).IS.number.$
    static BigInt = (value) => Assert.that(value).IS.bigint.$
    static Boolean = (value) => Assert.that(value).IS.boolean.$
    static Undefined = (value) => Assert.that(value).IS.undefined.$
    static Symbol = (value) => Assert.that(value).IS.symbol.$
    static Null = (value) => Assert.that(value).IS.null.$

    static Object = (value) => Assert.that(value).IS.object.$
    static Function = (value) => Assert.that(value).IS.function.$
    static Array = (value) => Assert.that(value).IS.array.$

    static Primitive = (value) => Assert.that(value).IS.primitive.$
    static Any = (value) => Assert.that(value).IS.any.$

    static True = (value) => Assert.that(value).IS.true.$
    static False = (value) => Assert.that(value).IS.false.$

    static Truthy = (value) => Assert.that(value).IS.truthy.$
    static Falsy = (value) => Assert.that(value).IS.falsy.$

    static Defined = (value) => Assert.that(value).IS.defined.$
    static Exists = (value) => Assert.that(value).IS.exists.$
    static NotNull = (value) => Assert.that(value).IS.notNull.$

    static DefinedAndNotNull = (value) => Assert.that(value).IS.definedAndNotNull.$
    static UndefinedOrNull = (value) => Assert.that(value).IS.undefinedOrNull.$

    static Instance = (value) => Assert.that(value).IS.instance.$
}


export class Has {
    static SomePrototype = (value) => Is.Object(value) && Object.getPrototypeOf(value) !== null
    static NullPrototype = (value) => Is.Object(value) && Object.getPrototypeOf(value) === null
}
