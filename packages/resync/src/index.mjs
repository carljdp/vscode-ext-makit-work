console.log('./index.mjs test...');

import someModule from './importCjsReExportAsEsm.mjs';

console.assert(typeof someModule === 'object');
console.assert(typeof someModule.count === 'function');
console.assert(typeof someModule.CjsModule === 'function');
console.assert(typeof someModule.EsmModule === 'undefined');

console.log(`[count: ${someModule.count()}] Hello from ${someModule.CjsModule.name},`);
console.log(`[count: ${someModule.count()}]  and ${(new someModule.CjsModule()).name}!`);

console.log('DONE');
