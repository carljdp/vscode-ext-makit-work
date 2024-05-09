// file: playground.test.mjs

"use strict";
let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

import { expect } from 'chai';

import { Is, Has } from './Assert.mjs';
import { Inspector, TypeInspector } from './Inspector.mjs';

import {
    es6FeatureSet,
    checkRuntimeFeatures,
} from './playground.mjs';


describe('default es6FeatureSet', () => {
    it('should be an array where each element is an object with feature, name, and typeOf properties', () => {
        expect(es6FeatureSet).to.be.an('array');
        es6FeatureSet.forEach(feature => {
            expect(feature).to.be.an('object');
            expect(feature).to.have.property('feature');
            expect(feature).to.have.property('name');
            expect(feature).to.have.property('typeOf');
        });
    });
});


describe('checkRuntimeFeatures', () => {
    it('should not throw an error for the default ES6 features set', () => {
        expect(() => checkRuntimeFeatures()).to.not.throw();
    });

    it('should throw a TypeError if the feature set is invalid', () => {
        const invalidFeatureSet = null; // or 'string', or {}
        expect(() => checkRuntimeFeatures(invalidFeatureSet)).to.throw(TypeError);
    });

    it('should throw an Error if any feature is missing', () => {
        const missingFeatureSet = [
            { feature: undefined, name: 'TestFeature', typeOf: 'function' }
        ];
        expect(() => checkRuntimeFeatures(missingFeatureSet)).to.throw(Error);
    });

    it('should throw an Error if a descriptor has an invalid typeOf value', () => {
        // Valid values for FeatureDescriptor.typeOf are: 'function' | 'symbol'.
        const invalidTypeFeatureSet = [
            { feature: () => { }, name: 'TestFeature', typeOf: 'unknown' }
        ];
        expect(() => checkRuntimeFeatures(invalidTypeFeatureSet)).to.throw(Error);
    });
});



describe('i$ utility object', () => {
    describe('positive checks', () => {
        it('should identify defined values', () => {
            expect(Is.Defined(0)).to.be.true;
            expect(Is.Defined(false)).to.be.true;
            expect(Is.Defined('')).to.be.true;
        });

        it('should identify undefined values', () => {
            expect(Is.Undefined(undefined)).to.be.true;
        });

        it('should identify null values', () => {
            expect(Is.Null(null)).to.be.true;
            expect(Is.Null(undefined)).to.be.false;
        });

        it('should identify empty strings', () => {
            expect(Is.EmptyString('')).to.be.true;
            expect(Is.EmptyString(' ')).to.be.false;
        });

        it('should identify empty arrays', () => {
            expect(Is.EmptyArray([])).to.be.true;
            expect(Is.EmptyArray([1])).to.be.false;
        });

        it('should identify falsy values', () => {
            expect(Is.Falsy(0)).to.be.true;
            expect(Is.Falsy('')).to.be.true;
        });

        it('should identify truthy values', () => {
            expect(Is.Truthy(1)).to.be.true;
            expect(Is.Truthy('a')).to.be.true;
        });
    });

    describe('negations', () => {
        it('should identify not defined', () => {
            expect(Is.Not.Defined(undefined)).to.be.true;
            expect(Is.Not.Defined(0)).to.be.false;
        });

        it('should identify not undefined', () => {
            expect(Is.Not.Undefined(0)).to.be.true;
        });

        it('should identify not null', () => {
            expect(Is.Not.Null(0)).to.be.true;
            expect(Is.Not.Null(null)).to.be.false;
        });

        it('should identify not empty strings', () => {
            expect(Is.Not.EmptyString('non-empty')).to.be.true;
            expect(Is.Not.EmptyString('')).to.be.false;
        });

        it('should identify not empty arrays', () => {
            expect(Is.Not.EmptyArray([1])).to.be.true;
            expect(Is.Not.EmptyArray([])).to.be.false;
        });

        it('should identify not falsy', () => {
            expect(Is.Not.Falsy(1)).to.be.true;
            expect(Is.Not.Falsy(0)).to.be.false;
        });

        it('should identify not truthy', () => {
            expect(Is.Not.Truthy(0)).to.be.true;
            expect(Is.Not.Truthy(1)).to.be.false;
        });
    });
});


