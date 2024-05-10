// file: src/common/AppConf.d.cts

/**
 * @fileoverview Type definitions for AppConf.cjs 
 */


declare const PROJ_ROOT_ABS_PATH: string;
declare const APP_PUBL: string;
declare const APP_NAME: string;
declare const APP_ROOT_DEVTIME: string;
declare const APP_ROOT_SRC_DIR: string;
declare const APP_ROOT_OUT_DIR: string;
declare const APP_COMMON_SRC_DIR: string;
declare const APP_COMMON_OUT_DIR: string;
declare const APP_EXTENS_SRC_DIR: string;
declare const APP_EXTENS_OUT_DIR: string;
declare const APP_SERVER_SRC_DIR: string;
declare const APP_SERVER_OUT_DIR: string;
declare const APP_WEBAPP_SRC_DIR: string;
declare const APP_WEBAPP_OUT_DIR: string;
declare const APP_VENDOR_OUT_DIR: string;


/**
 * Interface for Application Configuration.
 * @extends {Record<string, string>}
 */
interface IAppConf extends Record<string, string> {
    PROJ_ROOT_ABS_PATH: typeof PROJ_ROOT_ABS_PATH,
    APP_PUBL: typeof APP_PUBL,
    APP_NAME: typeof APP_NAME,
    APP_ROOT_DEVTIME: typeof APP_ROOT_DEVTIME,
    APP_ROOT_SRC_DIR: typeof APP_ROOT_SRC_DIR,
    APP_ROOT_OUT_DIR: typeof APP_ROOT_OUT_DIR,
    APP_COMMON_SRC_DIR: typeof APP_COMMON_SRC_DIR,
    APP_COMMON_OUT_DIR: typeof APP_COMMON_OUT_DIR,
    APP_EXTENS_SRC_DIR: typeof APP_EXTENS_SRC_DIR,
    APP_EXTENS_OUT_DIR: typeof APP_EXTENS_OUT_DIR,
    APP_SERVER_SRC_DIR: typeof APP_SERVER_SRC_DIR,
    APP_SERVER_OUT_DIR: typeof APP_SERVER_OUT_DIR,
    APP_WEBAPP_SRC_DIR: typeof APP_WEBAPP_SRC_DIR,
    APP_WEBAPP_OUT_DIR: typeof APP_WEBAPP_OUT_DIR,
    APP_VENDOR_OUT_DIR: typeof APP_VENDOR_OUT_DIR,
}

/**
 * Application Configuration object.
 */
declare const AppConf: IAppConf;
export default AppConf;


export {
    IAppConf,
    AppConf,
    APP_PUBL,
    APP_NAME,
    PROJ_ROOT_ABS_PATH,
    APP_ROOT_DEVTIME,
    APP_ROOT_SRC_DIR,
    APP_ROOT_OUT_DIR,
    APP_COMMON_SRC_DIR,
    APP_COMMON_OUT_DIR,
    APP_EXTENS_SRC_DIR,
    APP_EXTENS_OUT_DIR,
    APP_SERVER_SRC_DIR,
    APP_SERVER_OUT_DIR,
    APP_WEBAPP_SRC_DIR,
    APP_WEBAPP_OUT_DIR,
    APP_VENDOR_OUT_DIR,
};
