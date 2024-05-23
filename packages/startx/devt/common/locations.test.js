
import Path from 'node:path';
import { suite } from 'mocha';
import { expect } from 'chai';


suite('common/locations.js', function () {

    suite('getLogTag', function () {      

        test('should return a string', function () {

            import('./locations.js').then((module) => {

                const logTag = module.getLogTag();

                expect(logTag).to.be.a('string');
                expect(logTag).to.have.length.greaterThan(0);
                expect(logTag).to.match(/^[a-z0-9\-.]+$/);
                expect(logTag).to.equal(Path.basename(import.meta.url));
            });


        });

    });


    suite('LocactionInfo', function () {

    });

    suite('Location', function () {

    });


});
