// file: /src/utils/Log.ts

import { ClampedInt } from './Strict';

    
export class LogEntry {
    severity: Logging.Severity = Logging.Severity.Error;
    text: string = "";
    args: any[] = [];

    constructor(severity: Logging.Severity, message: string, ...args: any[]) {
        this.severity = severity;
        this.text = message;
        this.args = args;
    }
}

export namespace Logging {

    export enum Severity {
        Info = "info",
        Warn = "warning",
        Error = "error",

        // TODO: insert exception

        // TODO: make panic
        Fatal = "fatal",
    }

    // 
    export enum Eagerness {
        Immediate = "immediate",
        Deferred = "deferred",
    }
    
    export enum Policy {
        Strict = "strict",
        Relaxed = "relaxed",
    }
    
    export enum Strategy {
        Log = "log",
        Throw = "throw",
        Abort = "abort",
    }
    
    export enum Tolerance {
        Zero = "zero",
        One = "one",
        Many = "many",
    }
}

namespace Notify {

    export enum Strategy {
        log_continue,
        log_throw,
        log_abort,
    }

    export enum Eagerness {
        Immediate = "immediate",
        Deferred = "deferred",
    }
}

enum LogLevel {
	Trace = -2,
	Debug = -1,
	Log = 0,
	Info = 1,
	Warn = 2,
	Error = 3,
	Fatal = 4,
}

namespace LogLevel {

	export function toString(level: LogLevel): string {
		switch (level) {
			case LogLevel.Trace: return "TRACE";
			case LogLevel.Debug: return "DEBUG";
			case LogLevel.Log: return "LOG";
			case LogLevel.Info: return "INFO";
			case LogLevel.Warn: return "WARN";
			case LogLevel.Error: return "ERROR";
			case LogLevel.Fatal: return "FATAL";
		}
		return "UNKNOWN";
	}

}

export interface ILoggerOptions {
	scopeLabel: string;
	initialRelativeIndent: ClampedInt;
	initialRelativeSeverity: LogLevel;
	indentString: string;
}
const defaultLoggerOptions: Required<ILoggerOptions> = {
	scopeLabel: "unknown",
	initialRelativeIndent: new ClampedInt(0, 0, 8),
	initialRelativeSeverity: LogLevel.Log,
	indentString: "  ",
};

export class Logger {

	// instance variables
	_initial: Required<ILoggerOptions>;
	state: Required<ILoggerOptions>;

	// constructor
	constructor(options: Partial<ILoggerOptions>) {
		this._initial = Object.freeze(Object.assign({}, defaultLoggerOptions, options));
		this.state = Object.assign({}, this._initial);
	}

	// instance functions
	trace = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Trace, msg, ...args);
	}

	debug = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Debug, msg, ...args);
	}

	log = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Log, msg, ...args);
	}

	info = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Info, msg, ...args);
	}

	warn = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Warn, msg, ...args);
	}

	error = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Error, msg, ...args);
	}

	fatal = (msg: string, ...args: any[]): void => {
		this._log(LogLevel.Fatal, msg, ...args);
	}

	indent(amount: number = 1): void {
		this.state.initialRelativeIndent.value += amount;
	}

	unindent(amount: number = 1): void {
		this.state.initialRelativeIndent.value -= amount;
	}

	subScope = (label?: string): Logger => {
		return new Logger({
			scopeLabel: `${this.state.scopeLabel}->${label || "subscope"}`, 
			initialRelativeIndent: this.state.initialRelativeIndent, 
			initialRelativeSeverity: this.state.initialRelativeSeverity, 
			indentString: this.state.indentString
		});
	}

	private _log(level: LogLevel, msg: string, ...args: any[]): void {
		// short-circuit if the level is below the threshhold
		if (level < this.state.initialRelativeSeverity) {
			return;
		}

		// get the current label
		const label = this.state.scopeLabel || this._initial.scopeLabel || defaultLoggerOptions.scopeLabel;
		const indent = this.state.initialRelativeIndent || this._initial.initialRelativeIndent || defaultLoggerOptions.initialRelativeIndent;
		const indentStr = this.state.indentString || this._initial.indentString || defaultLoggerOptions.indentString;

		switch (level) {
			case LogLevel.Trace:
				console.trace(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				break;
			case LogLevel.Debug:
				console.debug(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				break;
			case LogLevel.Log:
				console.log(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				break;
			case LogLevel.Info:
				console.info(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				break;
			case LogLevel.Warn:
				console.warn(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				break;
			case LogLevel.Error:
				console.error(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				// Strict error handling
				throw new Error(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`);
				break;
			case LogLevel.Fatal:
				console.error(`[${label}] ${indentStr.repeat(indent.value)} ${level}: ${msg}`, ...args);
				// Strict error handling
				process.exit(1);
				break;
			default:
				throw new Error(`[PANIC] Log level: ${level} not implemented`);
		}
		return;
	}

}

