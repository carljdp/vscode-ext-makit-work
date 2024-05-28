// file: dev/EnvConf.d.cts
/** 
 * @fileoverview Type definitions for EnvConf.js 
 */ /** 
 * @brief Predicate indicating whether the environment is development
 * @remark Value is determined from `process.env.NODE_ENV`:
 * - `true` when [ `development` | `develop` | `dev` ]
 * - `false` otherwise.
 * - Is complimentary value of `_isProd_`
 */ "use strict";
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
    EnvConf: function() {
        return EnvConf;
    },
    _isDebug_: function() {
        return _isDebug_;
    },
    _isDev_: function() {
        return _isDev_;
    },
    _isProd_: function() {
        return _isProd_;
    },
    default: function() {
        return _default;
    }
});
const _default = EnvConf;

//# sourceMappingURL=EnvConf.d.js.map