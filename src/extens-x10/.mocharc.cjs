'use strict';

console.debug('Mocha config loaded');

// see example file for more options
// https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js

module.exports = {
    package: './package.json',
    require: ['ts-node/register'],
    //
    extension: ['js', 'cjs', 'mjs', 'ts', 'cts', 'mts'],
    spec: ['**/*.{spec,test}.{js,cjs,mjs,ts,cts,mts}'],
    parallel: false,
    recursive: true,
    ignore: [
        'src/**/*',
        'node_modules/**/*',
        'build/**/*',
        'dist/**/*',
        'docs/**/*',
        'out/**/*',
        'temp/**/*',
        'tmp/**/*',
        '.*/**/*',
    ],
    //
    color: true,
    delay: false,
    diff: true,
    //
    watch: true,
    "watch-files": ['**/*.{spec,test}.{js,cjs,mjs,ts,cts,mts}'],
    "watch-ignore": [
        'src/**/*',
        'node_modules/**/*',
        'build/**/*',
        'dist/**/*',
        'docs/**/*',
        'out/**/*',
        'temp/**/*',
        'tmp/**/*',
        '.*/**/*',
    ],
};