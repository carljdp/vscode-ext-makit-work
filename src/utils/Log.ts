// file: /src/utils/Log.ts

import { ClampedInt } from './Strict';


export namespace StrictLoggerNS {

export class StrictLogEntry {
	
    severity: StrictLogger.Severity = StrictLogger.Severity.Error;
    text: string = "";
    args: any[] = [];

    constructor(severity: StrictLogger.Severity, message: string, ...args: any[]) {
        this.severity = severity;
        this.text = message;
        this.args = args;
    }
}

export namespace StrictLogger {

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

} // namespace StrictLogger

export enum LogSeverity {
	Trace = -2,
	Debug = -1,
	Log = 0,
	Info = 1,
	Warn = 2,
	Error = 3,
	Fatal = 4,
}
export namespace LogSeverity {

	export function toString(level: LogSeverity): string {
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

}

export interface ILoggerOptions {
	scopeLabel: string;
	initialRelativeIndent: ClampedInt;
	initialRelativeSeverity: LogSeverity;
	indentString: string;
}
const defaultLoggerOptions: Required<ILoggerOptions> = {
	scopeLabel: "unknown",
	initialRelativeIndent: new ClampedInt(0, 0, 8),
	initialRelativeSeverity: LogSeverity.Log,
	indentString: "  ",
};

export class Logger {

	public static joinNonEmpty(joiner: string, ...args: string[]): string {
		return args.filter((arg) => arg.length > 0).join(joiner);
	}

	// instance variables
	_initial: Required<ILoggerOptions>;
	state: Required<ILoggerOptions>;

	// constructor
	constructor(options: Partial<ILoggerOptions>) {
		this._initial = Object.freeze(Object.assign({}, defaultLoggerOptions, options));
		this.state = Object.assign({}, defaultLoggerOptions, this._initial);
	}

	// instance functions
	trace = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Trace, msg, ...args);
	};

	debug = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Debug, msg, ...args);
	};

	log = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Log, msg, ...args);
	};

	info = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Info, msg, ...args);
	};

	warn = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Warn, msg, ...args);
	};

	error = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Error, msg, ...args);
	};

	fatal = (msg: string, ...args: any[]): void => {
		this._log(LogSeverity.Fatal, msg, ...args);
	};

	indent(amount: number = 1): void {
		this.state.initialRelativeIndent.value += amount;
	};

	unindent(amount: number = 1): void {
		this.state.initialRelativeIndent.value -= amount;
	};

	subScope = (options: Partial<ILoggerOptions>): Logger => {

		if (options.scopeLabel !== undefined && options.scopeLabel.length > 0) {
			options.scopeLabel = Logger.joinNonEmpty(":",
				this.state.scopeLabel, 
				options.scopeLabel
			);
		}
		else {
			options.scopeLabel = Logger.joinNonEmpty(":", this.state.scopeLabel, "subScope");
		}

		const mergedOptions = Object.assign({}, this.state, options);
		return new Logger(mergedOptions);
	};



	private _log(level: LogSeverity, msg: string, ...args: any[]): void {
		// short-circuit if the level is below the threshhold
		if (level < this.state.initialRelativeSeverity) {
			return;
		}

		// get the current label
		const label = this.state.scopeLabel || this._initial.scopeLabel || defaultLoggerOptions.scopeLabel;
		const indent = this.state.initialRelativeIndent || this._initial.initialRelativeIndent || defaultLoggerOptions.initialRelativeIndent;
		const indentStr = this.state.indentString || this._initial.indentString || defaultLoggerOptions.indentString;

		const consoleMessage = Logger.joinNonEmpty(":",
			LogSeverity.toString(level), 
			label, 
			indentStr.repeat(indent.value), 
			msg
		);

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

