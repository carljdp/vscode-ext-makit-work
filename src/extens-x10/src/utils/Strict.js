"use strict";
// file: /src/utils/Strict.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClampedInt = void 0;
const Log_1 = require("./Log");
const DefaultStrictOptions = {
    maxAllowedInfo: Number.POSITIVE_INFINITY,
    maxAllowedWarn: Number.POSITIVE_INFINITY,
    maxAllowedError: Number.POSITIVE_INFINITY,
    maxAllowedFatal: 0,
    printImmediate: true,
};
class Strict {
    constructor(options) {
        this._printImmediate = true;
        this._infoCount = 0;
        this._warnCount = 0;
        this._errorCount = 0;
        this._fatalCount = 0;
        this._maxAllowedInfo = 0;
        this._maxAllowedWarn = 0;
        this._maxAllowedError = 0;
        this._maxAllowedFatal = 0;
        this._logBook = [];
        this._initialOptions = Object.freeze(Object.assign({}, DefaultStrictOptions, options));
        this._resetCounters();
    }
    _printEntry(logEntry) {
        switch (logEntry.severity) {
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Info:
                console.info(`[STRICT] Infor: ${logEntry.text}`);
                break;
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Warn:
                console.warn(`[STRICT] Warni: ${logEntry.text}`);
                break;
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Error:
                console.error(`[STRICT] Error: ${logEntry.text}`);
                break;
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Fatal:
                console.error(`[STRICT] Fatal: ${logEntry.text}`);
                break;
            default:
                console.error(`[STRICT] Unknown severity: ${logEntry.severity}`);
        }
    }
    _addEntry(logEntry) {
        this._logBook.push(logEntry);
        switch (logEntry.severity) {
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Info:
                if (++this._infoCount > this._maxAllowedInfo) {
                    this._flush();
                }
                break;
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Warn:
                if (++this._warnCount > this._maxAllowedWarn) {
                    this._flush();
                }
                break;
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Error:
                if (++this._errorCount > this._maxAllowedError) {
                    this._flush();
                }
                break;
            case Log_1.StrictLoggerNS.StrictLogger.Severity.Fatal:
                if (++this._fatalCount > this._maxAllowedFatal) {
                    this._flush();
                }
                break;
            default:
                console.error(`[STRICT] Unknown severity: ${logEntry.severity}`);
        }
        if (this._printImmediate) {
            this._printEntry(logEntry);
        }
    }
    _flush() {
        console.error(`[STRICT] FLUSH LOGBOOK`);
        for (const failure of this._logBook) {
            this._printEntry(failure);
        }
        process.exit(1);
    }
    _resetCounters() {
        this._infoCount = 0;
        this._warnCount = 0;
        this._errorCount = 0;
        this._fatalCount = 0;
    }
    log(severity, message, ...args) {
        this._addEntry(new Log_1.StrictLoggerNS.StrictLogEntry(severity || Log_1.StrictLoggerNS.StrictLogger.Severity.Error, message || "Fail!", ...args));
    }
}
class ClampedInt extends Strict {
    constructor(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, options = {}) {
        super(options);
        this.min = Number.MIN_SAFE_INTEGER;
        this.max = Number.MAX_SAFE_INTEGER;
        this._value = 0;
        this.min = min;
        this.max = max;
        this.value = value;
    }
    _parse(value) {
        if (typeof value === "number") {
            return value;
        }
        else {
            if (value === undefined) {
                this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Warn, "Value should not be undefined");
            }
            if (value === null) {
                this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Warn, "Value should not be null");
            }
            this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Warn, `Value should be a number, not a ${typeof value}`);
            const maybeInt = parseInt(value);
            if (!isNaN(maybeInt)) {
                this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Info, `Was able to parse directly as integer`);
                return maybeInt; // int is "number"
            }
            const maybeFloat = parseFloat(value);
            if (!isNaN(maybeFloat)) {
                this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Info, `Parsed as float, but should be an integer`);
                return Math.round(maybeFloat); // float is "number"
            }
            const maybeOther = Number(value);
            if (!isNaN(maybeOther)) {
                this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Warn, `Parsed as number, but should be an integer`);
                return maybeOther; // number
            }
            return null;
        }
    }
    _clamp(value) {
        if (value < -128 || value > 127) {
            this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Warn, `Value should be in the range -128 to 127, not ${value}`);
        }
        if (value < -128) {
            this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Info, `Clamping value to -128`);
            value - 128;
        }
        if (value > 127) {
            this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Info, `Clamping value to 127`);
            value = 127;
        }
        return value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        const parsed = this._parse(value);
        if (parsed === null) {
            this.log(Log_1.StrictLoggerNS.StrictLogger.Severity.Error, `Value could not be parsed`);
        }
        else {
            const clamped = this._clamp(parsed);
            if (clamped !== this._value) {
                this._value = clamped;
            }
        }
        if (value !== this._value) {
            this._value = value;
        }
        this._value = value;
    }
    inc() {
        this.value++;
    }
    dec() {
        this.value--;
    }
}
exports.ClampedInt = ClampedInt;
