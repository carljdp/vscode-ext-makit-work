"use strict";
// file: /src/utils/Log.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogSeverity = exports.StrictLoggerNS = void 0;
const Strict_1 = require("./Strict");
var StrictLoggerNS;
(function (StrictLoggerNS) {
    class StrictLogEntry {
        constructor(severity, message, ...args) {
            this.severity = StrictLogger.Severity.Error;
            this.text = "";
            this.args = [];
            this.severity = severity;
            this.text = message;
            this.args = args;
        }
    }
    StrictLoggerNS.StrictLogEntry = StrictLogEntry;
    let StrictLogger;
    (function (StrictLogger) {
        let Severity;
        (function (Severity) {
            Severity["Info"] = "info";
            Severity["Warn"] = "warning";
            Severity["Error"] = "error";
            // TODO: insert exception
            // TODO: make panic
            Severity["Fatal"] = "fatal";
        })(Severity = StrictLogger.Severity || (StrictLogger.Severity = {}));
        // 
        let Eagerness;
        (function (Eagerness) {
            Eagerness["Immediate"] = "immediate";
            Eagerness["Deferred"] = "deferred";
        })(Eagerness = StrictLogger.Eagerness || (StrictLogger.Eagerness = {}));
        let Policy;
        (function (Policy) {
            Policy["Strict"] = "strict";
            Policy["Relaxed"] = "relaxed";
        })(Policy = StrictLogger.Policy || (StrictLogger.Policy = {}));
        let Strategy;
        (function (Strategy) {
            Strategy["Log"] = "log";
            Strategy["Throw"] = "throw";
            Strategy["Abort"] = "abort";
        })(Strategy = StrictLogger.Strategy || (StrictLogger.Strategy = {}));
        let Tolerance;
        (function (Tolerance) {
            Tolerance["Zero"] = "zero";
            Tolerance["One"] = "one";
            Tolerance["Many"] = "many";
        })(Tolerance = StrictLogger.Tolerance || (StrictLogger.Tolerance = {}));
    })(StrictLogger = StrictLoggerNS.StrictLogger || (StrictLoggerNS.StrictLogger = {}));
    let Notify;
    (function (Notify) {
        let Strategy;
        (function (Strategy) {
            Strategy[Strategy["log_continue"] = 0] = "log_continue";
            Strategy[Strategy["log_throw"] = 1] = "log_throw";
            Strategy[Strategy["log_abort"] = 2] = "log_abort";
        })(Strategy = Notify.Strategy || (Notify.Strategy = {}));
        let Eagerness;
        (function (Eagerness) {
            Eagerness["Immediate"] = "immediate";
            Eagerness["Deferred"] = "deferred";
        })(Eagerness = Notify.Eagerness || (Notify.Eagerness = {}));
    })(Notify || (Notify = {}));
})(StrictLoggerNS || (exports.StrictLoggerNS = StrictLoggerNS = {})); // namespace StrictLogger
var LogSeverity;
(function (LogSeverity) {
    LogSeverity[LogSeverity["Trace"] = -2] = "Trace";
    LogSeverity[LogSeverity["Debug"] = -1] = "Debug";
    LogSeverity[LogSeverity["Log"] = 0] = "Log";
    LogSeverity[LogSeverity["Info"] = 1] = "Info";
    LogSeverity[LogSeverity["Warn"] = 2] = "Warn";
    LogSeverity[LogSeverity["Error"] = 3] = "Error";
    LogSeverity[LogSeverity["Fatal"] = 4] = "Fatal";
})(LogSeverity || (exports.LogSeverity = LogSeverity = {}));
(function (LogSeverity) {
    function toString(level) {
        switch (level) {
            case LogSeverity.Trace: return "TRACE";
            case LogSeverity.Debug: return "DEBUG";
            case LogSeverity.Log: return "LOG";
            case LogSeverity.Info: return "INFO";
            case LogSeverity.Warn: return "WARN";
            case LogSeverity.Error: return "ERROR";
            case LogSeverity.Fatal: return "FATAL";
        }
        return "UNKNOWN";
    }
    LogSeverity.toString = toString;
})(LogSeverity || (exports.LogSeverity = LogSeverity = {}));
const defaultLoggerOptions = {
    scopeLabel: "unknown",
    initialRelativeIndent: new Strict_1.ClampedInt(0, 0, 8),
    initialRelativeSeverity: LogSeverity.Log,
    indentString: "  ",
};
class Logger {
    static joinNonEmpty(joiner, ...args) {
        return args.filter((arg) => arg.length > 0).join(joiner);
    }
    // constructor
    constructor(options) {
        // instance functions
        this.trace = (msg, ...args) => {
            this._log(LogSeverity.Trace, msg, ...args);
        };
        this.debug = (msg, ...args) => {
            this._log(LogSeverity.Debug, msg, ...args);
        };
        this.log = (msg, ...args) => {
            this._log(LogSeverity.Log, msg, ...args);
        };
        this.info = (msg, ...args) => {
            this._log(LogSeverity.Info, msg, ...args);
        };
        this.warn = (msg, ...args) => {
            this._log(LogSeverity.Warn, msg, ...args);
        };
        this.error = (msg, ...args) => {
            this._log(LogSeverity.Error, msg, ...args);
        };
        this.fatal = (msg, ...args) => {
            this._log(LogSeverity.Fatal, msg, ...args);
        };
        this.subScope = (options) => {
            if (options.scopeLabel !== undefined && options.scopeLabel.length > 0) {
                options.scopeLabel = Logger.joinNonEmpty(":", this.state.scopeLabel, options.scopeLabel);
            }
            else {
                options.scopeLabel = Logger.joinNonEmpty(":", this.state.scopeLabel, "subScope");
            }
            const mergedOptions = Object.assign({}, this.state, options);
            return new Logger(mergedOptions);
        };
        this._initial = Object.freeze(Object.assign({}, defaultLoggerOptions, options));
        this.state = Object.assign({}, defaultLoggerOptions, this._initial);
    }
    indent(amount = 1) {
        this.state.initialRelativeIndent.value += amount;
    }
    ;
    unindent(amount = 1) {
        this.state.initialRelativeIndent.value -= amount;
    }
    ;
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
        switch (level) {
            case LogSeverity.Trace:
                console.trace(consoleMessage, ...args);
                break;
            case LogSeverity.Debug:
                console.debug(consoleMessage, ...args);
                break;
            case LogSeverity.Log:
                console.log(consoleMessage, ...args);
                break;
            case LogSeverity.Info:
                console.info(consoleMessage, ...args);
                break;
            case LogSeverity.Warn:
                console.warn(consoleMessage, ...args);
                break;
            case LogSeverity.Error:
                console.error(consoleMessage, ...args);
                // Strict error handling
                throw new Error(consoleMessage);
                break;
            case LogSeverity.Fatal:
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
exports.Logger = Logger;
