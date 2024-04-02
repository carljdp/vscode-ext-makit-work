
import { _isDebug_ } from './Environment';

interface IErrorable {
    instanceError(duringOp: string, failedTo: string, error: Error): Error;
}

interface IDebuggable {
    instanceDebug(message: string): void;
}


interface IOrigin extends IErrorable, IDebuggable {
}

abstract class Origin extends Object implements IOrigin {

    public instanceKey: Readonly<Symbol>;

    public constructor() {
        super();
        this.instanceKey = Symbol.for(`AbstractOrigin`);
    }

    public instanceError(this: IOrigin, duringOp: string, failedTo: string, error: Error): Error {
        return Origin.staticError.call(this, duringOp, failedTo, error);
    }

    public instanceDebug(this: IOrigin, message: string): void {
        return Origin.staticDebug.call(this, message);
    }

    protected static staticError(this: IOrigin, duringOp: string, failedTo: string, error: Error): Error {
        let message = `During ${duringOp} failed to ${failedTo} \n` +
            `\tError: '${error.message}'\n` +
            `\tStack: ${error.stack}\n`;
        Origin.staticDebug.call(this, message);
        return new Error(message);
    }

    protected static staticDebug(this: IOrigin, message: string): void {
        if (_isDebug_) {
            console.debug(`[${this.constructor.name.toString()}] ${message} `);
        }
    }

};

export { IDebuggable, IErrorable, IOrigin, Origin };