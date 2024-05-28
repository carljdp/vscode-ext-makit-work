// file: /src/utils/Log.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    LogSeverity: function() {
        return LogSeverity;
    },
    Logger: function() {
        return Logger;
    },
    StrictLoggerNS: function() {
        return StrictLoggerNS;
    }
});
const _Strict = require("./Strict");
var StrictLoggerNS;
(function(StrictLoggerNS) {
    class StrictLogEntry {
        severity = StrictLogger.Severity.Error;
        text = "";
        args = [];
        constructor(severity, message, ...args){
            this.severity = severity;
            this.text = message;
            this.args = args;
        }
    }
    StrictLoggerNS.StrictLogEntry = StrictLogEntry;
    let StrictLogger;
    (function(StrictLogger) {
        let Severity;
        (function(Severity) {
            Severity["Info"] = "info";
            Severity["Warn"] = "warning";
            Severity["Error"] = "error";
            // TODO: insert exception
            // TODO: make panic
            Severity["Fatal"] = "fatal";
        })(Severity = StrictLogger.Severity || (StrictLogger.Severity = {}));
        let Eagerness;
        (function(Eagerness) {
            Eagerness["Immediate"] = "immediate";
            Eagerness["Deferred"] = "deferred";
        })(Eagerness = StrictLogger.Eagerness || (StrictLogger.Eagerness = {}));
        let Policy;
        (function(Policy) {
            Policy["Strict"] = "strict";
            Policy["Relaxed"] = "relaxed";
        })(Policy = StrictLogger.Policy || (StrictLogger.Policy = {}));
        let Strategy;
        (function(Strategy) {
            Strategy["Log"] = "log";
            Strategy["Throw"] = "throw";
            Strategy["Abort"] = "abort";
        })(Strategy = StrictLogger.Strategy || (StrictLogger.Strategy = {}));
        let Tolerance;
        (function(Tolerance) {
            Tolerance["Zero"] = "zero";
            Tolerance["One"] = "one";
            Tolerance["Many"] = "many";
        })(Tolerance = StrictLogger.Tolerance || (StrictLogger.Tolerance = {}));
    })(StrictLogger = StrictLoggerNS.StrictLogger || (StrictLoggerNS.StrictLogger = {}));
    let Notify;
    (function(Notify) {
        let Strategy;
        (function(Strategy) {
            Strategy[Strategy["log_continue"] = 0] = "log_continue";
            Strategy[Strategy["log_throw"] = 1] = "log_throw";
            Strategy[Strategy["log_abort"] = 2] = "log_abort";
        })(Strategy = Notify.Strategy || (Notify.Strategy = {}));
        let Eagerness;
        (function(Eagerness) {
            Eagerness["Immediate"] = "immediate";
            Eagerness["Deferred"] = "deferred";
        })(Eagerness = Notify.Eagerness || (Notify.Eagerness = {}));
    })(Notify || (Notify = {}));
})(StrictLoggerNS || (StrictLoggerNS = {})); // namespace StrictLogger
var LogSeverity;
(function(LogSeverity) {
    LogSeverity[LogSeverity["Trace"] = -2] = "Trace";
    LogSeverity[LogSeverity["Debug"] = -1] = "Debug";
    LogSeverity[LogSeverity["Log"] = 0] = "Log";
    LogSeverity[LogSeverity["Info"] = 1] = "Info";
    LogSeverity[LogSeverity["Warn"] = 2] = "Warn";
    LogSeverity[LogSeverity["Error"] = 3] = "Error";
    LogSeverity[LogSeverity["Fatal"] = 4] = "Fatal";
})(LogSeverity || (LogSeverity = {}));
(function(LogSeverity) {
    function toString(level) {
        switch(level){
            case -2:
                return "TRACE";
            case -1:
                return "DEBUG";
            case 0:
                return "LOG";
            case 1:
                return "INFO";
            case 2:
                return "WARN";
            case 3:
                return "ERROR";
            case 4:
                return "FATAL";
        }
        return "UNKNOWN";
    }
    LogSeverity.toString = toString;
})(LogSeverity || (LogSeverity = {}));
const defaultLoggerOptions = {
    scopeLabel: "unknown",
    initialRelativeIndent: new _Strict.ClampedInt(0, 0, 8),
    initialRelativeSeverity: 0,
    indentString: "  "
};
class Logger {
    static joinNonEmpty(joiner, ...args) {
        return args.filter((arg)=>arg.length > 0).join(joiner);
    }
    // instance variables
    _initial;
    state;
    // constructor
    constructor(options){
        this._initial = Object.freeze(Object.assign({}, defaultLoggerOptions, options));
        this.state = Object.assign({}, defaultLoggerOptions, this._initial);
    }
    // instance functions
    trace = (msg, ...args)=>{
        this._log(-2, msg, ...args);
    };
    debug = (msg, ...args)=>{
        this._log(-1, msg, ...args);
    };
    log = (msg, ...args)=>{
        this._log(0, msg, ...args);
    };
    info = (msg, ...args)=>{
        this._log(1, msg, ...args);
    };
    warn = (msg, ...args)=>{
        this._log(2, msg, ...args);
    };
    error = (msg, ...args)=>{
        this._log(3, msg, ...args);
    };
    fatal = (msg, ...args)=>{
        this._log(4, msg, ...args);
    };
    indent(amount = 1) {
        this.state.initialRelativeIndent.value += amount;
    }
    unindent(amount = 1) {
        this.state.initialRelativeIndent.value -= amount;
    }
    subScope = (options)=>{
        if (options.scopeLabel !== undefined && options.scopeLabel.length > 0) {
            options.scopeLabel = Logger.joinNonEmpty(":", this.state.scopeLabel, options.scopeLabel);
        } else {
            options.scopeLabel = Logger.joinNonEmpty(":", this.state.scopeLabel, "subScope");
        }
        const mergedOptions = Object.assign({}, this.state, options);
        return new Logger(mergedOptions);
    };
    _log(level, msg, ...args) {
        // short-circuit if the level is below the threshhold
        if (level < this.state.initialRelativeSeverity) {
            return;
        }
        // get the current label
        const label = this.state.scopeLabel || this._initial.scopeLabel || defaultLoggerOptions.scopeLabel;
        const indent = this.state.initialRelativeIndent || this._initial.initialRelativeIndent || defaultLoggerOptions.initialRelativeIndent;
        const indentStr = this.state.indentString || this._initial.indentString || defaultLoggerOptions.indentString;
        const consoleMessage = Logger.joinNonEmpty(":", LogSeverity.toString(level), label, indentStr.repeat(indent.value), msg);
        switch(level){
            case -2:
                console.trace(consoleMessage, ...args);
                break;
            case -1:
                console.debug(consoleMessage, ...args);
                break;
            case 0:
                console.log(consoleMessage, ...args);
                break;
            case 1:
                console.info(consoleMessage, ...args);
                break;
            case 2:
                console.warn(consoleMessage, ...args);
                break;
            case 3:
                console.error(consoleMessage, ...args);
                // Strict error handling
                throw new Error(consoleMessage);
                break;
            case 4:
                console.error(consoleMessage, ...args);
                // Strict error handling
                process.exit(1);
                break;
            default:
                throw new Error(`[PANIC] Log level: ${level} not implemented`);
        }
        return;
    }
}

//# sourceMappingURL=Log.js.map