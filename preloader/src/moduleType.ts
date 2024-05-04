// src-file: ./preloader/src/moduleType.ts

function detectModuleType() {
    let isESM = false;
    let isCJS = false;

    // Check for ESM compatibility
    try {
        isESM = new Function('return typeof import.meta.url === "string"')();
    } catch (error) {
        isESM = false;
    }

    // Check for CommonJS compatibility
    try {
        isCJS = typeof module === 'object' && module.exports;
    } catch (error) {
        isCJS = false;
    }

    return { isESM, isCJS };
}

export const { isESM, isCJS } = detectModuleType();

export function debugLog() {

    if (isESM === isCJS) {
        console.error('\n\tModule type detection failed. Trace & Exit..\n');
        console.trace();
        process.exit(1);
    }

    if (isESM && !isCJS) {
        console.info('\n\tESM module detected. Continuing..\n');
    }

    if (!isESM && isCJS) {
        console.info('\n\tCJS module detected. Continuing..\n');
    }
}