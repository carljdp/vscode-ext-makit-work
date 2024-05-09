// file: src/common/AppConf.cjs
/**
 * -------------------------------------------------------------------------- *
 * NOTE: This file is intentionally a plain JavaScript file, so that it can   *
 *        be used in both the NodeJS and Webpack config files.                *
 * -------------------------------------------------------------------------- *
 * 
 * @fileoverview Application configuration variables are used to determine
 * the current environment of the application, for both the build and runtime
 * environments.
 * 
 */


/** @type {import('./AppConf.d.cts').IAppConf} */
const AppConf = {
    PROJ_ROOT_ABS_PATH: String(process.env.PROJ_ROOT_ABS_PATH || ''),
    APP_PUBL: String(process.env.APP_PUBL || ''),
    APP_NAME: String(process.env.APP_NAME || ''),
    APP_ROOT_DEVTIME: String(process.env.APP_ROOT_DEVTIME || 'dev'),
    APP_ROOT_SRC_DIR: String(process.env.APP_ROOT_SRC_DIR || 'src'),
    APP_ROOT_OUT_DIR: String(process.env.APP_ROOT_OUT_DIR || 'dist'),
    APP_COMMON_SRC_DIR: String(process.env.APP_COMMON_SRC_DIR || 'common'),
    APP_COMMON_OUT_DIR: String(process.env.APP_COMMON_OUT_DIR || 'common'),
    APP_EXTENS_SRC_DIR: String(process.env.APP_EXTENS_SRC_DIR || 'extens'),
    APP_EXTENS_OUT_DIR: String(process.env.APP_EXTENS_OUT_DIR || 'extens'),
    APP_SERVER_SRC_DIR: String(process.env.APP_SERVER_SRC_DIR || 'server'),
    APP_SERVER_OUT_DIR: String(process.env.APP_SERVER_OUT_DIR || 'server'),
    APP_WEBAPP_SRC_DIR: String(process.env.APP_WEBAPP_SRC_DIR || 'webapp'),
    APP_WEBAPP_OUT_DIR: String(process.env.APP_WEBAPP_OUT_DIR || 'webapp'),
    APP_VENDOR_OUT_DIR: String(process.env.APP_VENDOR_OUT_DIR || 'vendor'),
};

module.exports = AppConf;
