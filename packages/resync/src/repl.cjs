
console.log('');
console.log('=================================================');
console.log('#            Start of file: repl.mjs            #');
console.log('-------------------------------------------------');
console.log('');

console.log('# Initializations:');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
process.on('beforeExit', (code) => {
    console.log(`Node.js process 'beforeExit' event with code: ${code}`);
});
console.log(`  ✔ Setup Node.js envent handler for 'beforeExit'`);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
process.on('exit', (code) => {
    console.log(`Node.js process 'exit' event with code: ${code}`);
});
console.log(`  ✔ Setup Node.js envent handler for 'exit'`);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
process.on('unhandledException', (error, origin) => {
    console.log(`Node.js process 'unhandledException' event with error: ${error}`, origin);
    //debugger;
});
console.log(`  ✔ Setup Node.js envent handler for 'unhandledException'`);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
process.on('unhandledRejection', (reason, promise) => {
    console.log(`Node.js process 'unhandledRejection' event with reason: ${reason}`, promise);
    //debugger;
});
console.log(`  ✔ Setup Node.js envent handler for 'unhandledRejection'`);

console.log('');
console.log('-------------------------------------------------');
console.log('');
console.log('# Start of the main code.');
console.log('- - - - - - - - - - - - - - - - - - - - - - - - -');
console.log('');
console.log('');
////////////////////////////////////////////////////////////////


const { execSync } = require('child_process');
const { writeFileSync, unlinkSync } = require('fs');
const { join } = require('path');

const syncImport = (path) => {

    const scriptContent = `"use strict";
    (async () => {
        const module = await import('${path}');
        console.log(JSON.stringify(module));
    })();`;

    // Write the script to a temporary file
    const scriptPath = join(__dirname, '../', 'tempScript.js');
    writeFileSync(scriptPath, scriptContent);

    // Execute the script and get the result
    const result = execSync(`node ${scriptPath}`);
    const resultString = result.toString();

    // Clean up the temporary script file
    unlinkSync(scriptPath);

    // Parse the result and return it
    return JSON.parse(resultString);
};

(async () => {
    const esmModule = syncImport('./src/esmModule.mjs');
    module.exports = esmModule;
})();



////////////////////////////////////////////////////////////////
console.log('');
console.log('');
console.log('- - - - - - - - - - - - - - - - - - - - - - - - -');
console.log('# End of the main code.');
console.log('');

console.log('');
console.log('-------------------------------------------------');
console.log('#            End of file: repl.mjs              #');
console.log('=================================================');
console.log('');
