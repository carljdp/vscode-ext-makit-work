// file: .jsdoc.conf.js

'use strict';

/* eslint-disable @typescript-eslint/no-unused-vars */
let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

module.exports = {
    plugins: ['plugins/markdown']
}; 