// file: /src/utils/Meta.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getContextName", {
    enumerable: true,
    get: function() {
        return getContextName;
    }
});
function splitStackTraceLine(line) {
    // to split a string like "Object.fnName (path/to/file)"
    // into ["async w.kb", "path/to/file"]
    // remove the leading spaces and the 'at' keyword
    const lean = line.replace(/^\s*at /, "").trim();
    const part0noTrim = (lean.match(/^([a-zA-z._$ ]+)\s+/) || [])[0] || "";
    let part0 = part0noTrim.trim();
    let part1 = lean.substring(part0noTrim.length).replace(/(^\()|(\)$)/g, "");
    part0 = part0.length > 0 ? part0 : "<anonymous>";
    part1 = part1.length > 0 ? part1 : "<unknown:0:0>";
    return [
        part0,
        part1
    ];
}
function getContextName(context) {
    // 'caller' property is non-standard and cannot be used in strict mode.
    // Hence, we will need to change the approach to pass the actual function or use Error stack trace.
    let callerName = "anonymous";
    let callerType = "unknown";
    if (context) {
        // Directly using the passed context's name property if available.
        callerName = context.name || "anonymous";
        // Checking if the context is an instance of a class.
        if (context.prototype) {
            callerType = "class";
        } else {
            callerType = "function";
        }
    } else {
        // Using Error stack trace to get the calling function's name.
        // because `caller` and `callee` is discouraged in strict mode.
        const stackLine = new Error().stack?.split('\n')[2].trim() || "";
        // return a default value if the stackLine is empty.
        const errorStackTrace = new Error().stack?.split('\n') || [
            "Error: Error message",
            "\tat anonymous (unknown-file:0:0)",
            "\tat anonymous (unknown-file:0:0)",
            "\tat anonymous (unknown-file:0:0)"
        ];
        // skipping the first line which is the error message.
        const parsedStackTrace = errorStackTrace.slice(1).map(splitStackTraceLine);
        const callerNameParts = parsedStackTrace[1][0].split(".");
        if (callerNameParts.length === 2) {
            callerName = callerNameParts[1];
            callerType = callerNameParts[0];
        } else {
            callerName = callerNameParts[0];
        }
    }
    return `${callerName}`;
}

//# sourceMappingURL=Meta.js.map