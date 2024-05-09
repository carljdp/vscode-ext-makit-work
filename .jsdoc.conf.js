// file: .jsdoc.conf.js

// TODOS:
// - I can't exactly remember where we we're heading when we started this file
// - I think we were trying to setup real-time jsdoc previews in vscode
// - But were never able to quite get there


'use strict';

/* eslint-disable @typescript-eslint/no-unused-vars */
let _DEBUG_ = (process.env.NODE_ENV === 'development' && process.env.DEBUG);

module.exports = {
    plugins: ['plugins/markdown']
}; 