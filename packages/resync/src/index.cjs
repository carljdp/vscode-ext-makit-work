console.log('./index.cjs test...');

const someModule = require('./importEsmReExportAsCjs.cjs');

console.assert(typeof someModule === 'object');
console.assert(typeof someModule.count === 'function');
console.assert(typeof someModule.EsmModule === 'function');
console.assert(typeof someModule.CjsModule === 'undefined');

console.log(`[count: ${someModule.count()}] Hello from ${someModule.EsmModule.name},`);
console.log(`[count: ${someModule.count()}]  and ${(new someModule.EsmModule()).name}!`);

console.log('DONE');
