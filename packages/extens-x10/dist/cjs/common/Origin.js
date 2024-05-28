"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Origin", {
    enumerable: true,
    get: function() {
        return Origin;
    }
});
const _EnvConf = require("../dev/EnvConf.js");
class Origin extends Object {
    constructor(){
        super();
    }
    instanceError(duringOp, failedTo, error) {
        return Origin.staticError.call(this, duringOp, failedTo, error);
    }
    instanceDebug(message) {
        return Origin.staticDebug.call(this, message);
    }
    static staticError(duringOp, failedTo, error) {
        let message = `During ${duringOp} failed to ${failedTo} \n` + `\tError: '${error.message}'\n` + `\tStack: ${error.stack}\n`;
        Origin.staticDebug.call(this, message);
        return new Error(message);
    }
    static staticDebug(message) {
        if (_EnvConf._isDebug_) {
            console.debug(`[${this.constructor.name.toString()}] ${message} `);
        }
    }
}

//# sourceMappingURL=Origin.js.map