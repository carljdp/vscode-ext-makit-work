
import { _isProd_, _isDev_, _isDebug_ } from '../../dev/EnvConf.cjs';


interface IOrigin extends Object {
    instanceError(this: IOrigin, duringOp: string, failedTo: string, error: Error): Error
    instanceDebug(this: IOrigin, message: string): void
}

abstract class Origin extends Object implements IOrigin {

    public constructor() {
        super();
    }

    public instanceError(this: IOrigin, duringOp: string, failedTo: string, error: Error): Error {
        return Origin.staticError.call(this, duringOp, failedTo, error);
    }

    public instanceDebug(this: IOrigin, message: string): void {
        return Origin.staticDebug.call(this, message);
    }

    protected static staticError(this: Origin, duringOp: string, failedTo: string, error: Error): Error {
        let message = `During ${duringOp} failed to ${failedTo} \n` +
            `\tError: '${error.message}'\n` +
            `\tStack: ${error.stack}\n`;
        Origin.staticDebug.call(this, message);
        return new Error(message);
    }

    protected static staticDebug(this: Origin, message: string): void {
        if (_isDebug_) {
            console.debug(`[${this.constructor.name.toString()}] ${message} `);
        }
    }

};

export { IOrigin, Origin };