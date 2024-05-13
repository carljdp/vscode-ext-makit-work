// file: dev/EnvConf.d.cts

/** 
 * @fileoverview Type definitions for EnvConf.js 
 */

/** 
 * @brief Predicate indicating whether the environment is development
 * @remark Value is determined from `process.env.NODE_ENV`:
 * - `true` when [ `development` | `develop` | `dev` ]
 * - `false` otherwise.
 * - Is complimentary value of `_isProd_`
 */
declare const _isDev_: boolean;

/** 
 * @brief Predicate indicating whether the environment is production
 * @remark Value is determined from `process.env.NODE_ENV`:
 * - `true` when [ `production` | `prod` ]
 * - `false` otherwise.
 * - Is complimentary value of `_isDev_`
 */
declare const _isProd_: boolean;

/** 
 * @brief Predicate indicating whether the environment is debug
 * @remark Value is determined from `process.env.DEBUG`:
 * - `true` when [ `true` | `1` | `y` | `yes` | `on` | `enable` | `enabled` ]
 * - `false` when [ `false` | `0` | `n` | `no` | `off` | `disable` | `disabled` ]
 */
declare const _isDebug_: boolean;

interface IEnvConf extends Record<string, boolean> {
    _isDev_: typeof _isDev_;
    _isProd_: typeof _isProd_;
    _isDebug_: typeof _isDebug_;
}

/** 
 * Environment Configuration object.
 */
declare const EnvConf: IEnvConf;
export default EnvConf;


export {
    IEnvConf,
    EnvConf,
    _isDev_,
    _isProd_,
    _isDebug_,
};
