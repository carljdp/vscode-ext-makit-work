// file: /src/utils/Strict.ts

import { StrictLoggerNS } from './Log';

interface IStrictOptions {
	maxAllowedInfo: number;
	maxAllowedWarn: number;
	maxAllowedError: number;
	maxAllowedFatal: number;
	printImmediate: boolean;
}

const DefaultStrictOptions: Required<IStrictOptions> = {
	maxAllowedInfo: Number.POSITIVE_INFINITY,
	maxAllowedWarn: Number.POSITIVE_INFINITY,
	maxAllowedError: Number.POSITIVE_INFINITY,
	maxAllowedFatal: 0,
	printImmediate: true,
};

interface IStrictState {
	infoCount: number;
	warnCount: number;
	errorCount: number;
	fatalCount: number;
	logBook: StrictLoggerNS.StrictLogEntry[];
}

abstract class Strict {

	private readonly _initialOptions: Readonly<Required<IStrictOptions>>;

	private readonly _printImmediate: boolean = true;

	private _infoCount: number = 0;
	private _warnCount: number = 0;
	private _errorCount: number = 0;
	private _fatalCount: number = 0;

	private readonly _maxAllowedInfo: number = 0;
	private readonly _maxAllowedWarn: number = 0;
	private readonly _maxAllowedError: number = 0;
	private readonly _maxAllowedFatal: number = 0;

	private _logBook: StrictLoggerNS.StrictLogEntry[] = [];

	constructor(options: Partial<IStrictOptions>) {
		this._initialOptions = Object.freeze(Object.assign({}, DefaultStrictOptions, options));
		this._resetCounters();
	}

	private _printEntry(logEntry: StrictLoggerNS.StrictLogEntry): void {
		switch (logEntry.severity) {
			case StrictLoggerNS.StrictLogger.Severity.Info:
				console.info(`[STRICT] Infor: ${logEntry.text}`);
				break;
			case StrictLoggerNS.StrictLogger.Severity.Warn:
				console.warn(`[STRICT] Warni: ${logEntry.text}`);
				break;
			case StrictLoggerNS.StrictLogger.Severity.Error:
				console.error(`[STRICT] Error: ${logEntry.text}`);
				break;
			case StrictLoggerNS.StrictLogger.Severity.Fatal:
				console.error(`[STRICT] Fatal: ${logEntry.text}`);
				break;
			default:
				console.error(`[STRICT] Unknown severity: ${logEntry.severity}`);
		}
	}

	private _addEntry(logEntry: StrictLoggerNS.StrictLogEntry): void {
		this._logBook.push(logEntry);

		switch (logEntry.severity) {
			case StrictLoggerNS.StrictLogger.Severity.Info:
				if (++this._infoCount > this._maxAllowedInfo) {
					this._flush();
				}
				break;
			case StrictLoggerNS.StrictLogger.Severity.Warn:
				if (++this._warnCount > this._maxAllowedWarn) {
					this._flush();
				}
				break;
			case StrictLoggerNS.StrictLogger.Severity.Error:
				if (++this._errorCount > this._maxAllowedError) {
					this._flush();
				}
				break;
			case StrictLoggerNS.StrictLogger.Severity.Fatal:
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

	private _flush(): void {
		console.error(`[STRICT] FLUSH LOGBOOK`);
		for (const failure of this._logBook) {
			this._printEntry(failure);
		}
		process.exit(1);
	}

	protected _resetCounters(): void {
		this._infoCount = 0;
		this._warnCount = 0;
		this._errorCount = 0;
		this._fatalCount = 0;
	}

	protected log(severity?: StrictLoggerNS.StrictLogger.Severity, message?: string, ...args: any[]): void {
		this._addEntry( new StrictLoggerNS.StrictLogEntry(severity || StrictLoggerNS.StrictLogger.Severity.Error, message || "Fail!", ...args));
	}

}



export class ClampedInt extends Strict {

	public readonly min: number = Number.MIN_SAFE_INTEGER;
	public readonly max: number = Number.MAX_SAFE_INTEGER;

	private _value: number = 0;

	constructor(value: number, min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER, options: Partial<IStrictOptions> = {}) {
		super(options);
		this.min = min;
		this.max = max;
		this.value = value;
	}

	private _parse(value: any): number|null {

		if (typeof value === "number") {
			return value;
		}
		else {

			if (value === undefined) {
				this.log(StrictLoggerNS.StrictLogger.Severity.Warn, "Value should not be undefined");
			}
	
			if (value === null) {
				this.log(StrictLoggerNS.StrictLogger.Severity.Warn, "Value should not be null");
			}

			this.log(StrictLoggerNS.StrictLogger.Severity.Warn, `Value should be a number, not a ${typeof value}`);

			
			const maybeInt = parseInt(value);

			if (!isNaN(maybeInt)) {
				this.log(StrictLoggerNS.StrictLogger.Severity.Info, `Was able to parse directly as integer`);
				return maybeInt; // int is "number"
			}

			const maybeFloat = parseFloat(value);
			if (!isNaN(maybeFloat)) {
				this.log(StrictLoggerNS.StrictLogger.Severity.Info, `Parsed as float, but should be an integer`);
				return Math.round(maybeFloat); // float is "number"
			}

			const maybeOther = Number(value);
			if (!isNaN(maybeOther)) {
				this.log(StrictLoggerNS.StrictLogger.Severity.Warn, `Parsed as number, but should be an integer`);
				return maybeOther; // number
			}

			return null;
		}		
	}

	private _clamp(value: number): number {
		
		if (value < -128 || value > 127) {
			this.log(StrictLoggerNS.StrictLogger.Severity.Warn, `Value should be in the range -128 to 127, not ${value}`);
		}

		if (value < -128) {
			this.log(StrictLoggerNS.StrictLogger.Severity.Info, `Clamping value to -128`);
			value -128;
		}

		if (value > 127) {
			this.log(StrictLoggerNS.StrictLogger.Severity.Info, `Clamping value to 127`);
			value = 127;
		}

		return value;
	}

	get value(): number {
		return this._value;
	}

	set value(value: any) {
		
		const parsed = this._parse(value);
		
		if (parsed === null) {
			this.log(StrictLoggerNS.StrictLogger.Severity.Error, `Value could not be parsed`);
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

	inc(): void {
		this.value++;
	}

	dec(): void {
		this.value--;
	}

}

