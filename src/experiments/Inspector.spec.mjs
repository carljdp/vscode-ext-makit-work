// file: Inspector.spec.mjs

"use strict";
let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

import { expect } from 'chai';

import { Inspector, TypeInspector } from './Inspector.mjs';

describe('class Inspector', () => {

    describe('static methods', () => {
        it('should have a static method get', () => {
            expect(Inspector.get).to.be.a('function');
        });

        it('should have a static method set', () => {
            expect(Inspector.set).to.be.a('function');
        });

        it('should have a static method inspect', () => {
            expect(Inspector.inspect).to.be.a('function');
        });
    });

    describe('instance methods', () => {
        it('should have an instance method inspect', () => {
            const inspector = new Inspector();
            expect(inspector.inspect).to.be.a('function');
        });

        it('should have an instance method get', () => {
            const inspector = new Inspector();
            expect(inspector.get).to.be.a('function');
        });

        it('should have an instance method set', () => {
            const inspector = new Inspector();
            expect(inspector.set).to.be.a('function');
        });
    });

    describe('instance properties', () => {
        it('should have an instance property target', () => {
            const inspector = new Inspector();
            expect(inspector).to.have.property('target');
        });

        it('should have an instance property typeInspector', () => {
            const inspector = new Inspector();
            expect(inspector).to.have.property('typeInspector');
        });
    });

    describe('instance property typeInspector', () => {
        it('should be an instance of TypeInspector', () => {
            const inspector = new Inspector();
            expect(inspector.typeInspector).to.be.an.instanceOf(TypeInspector);
        });
    });


});
