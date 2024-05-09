// file: URI.cjs

// !!! IMPORTANT !!!
// If we want to do conditional imports, have to use require() instead of import
//  .. and thus .cjs extensionm not .mjs
// 

'use strict';
//@ts-check

const util = require('util');

const splitUserAgentRegex = /(?= )?[a-zA-Z0-9]+\/[a-zA-Z0-9.]+( (\([^)]*?\)))?/g


function driveLetterToLowerCase(path) {
    const driveLetterRegex = /^\/?(mnt\/)?[a-z]:?[\/\\]/i;
    const match = path.match(driveLetterRegex);
    if (match) {
        const fixed = match[0].toLowerCase();
        return path.replace(driveLetterRegex, fixed);
    }
    return path;
};


class Environment {
    static _hasProcess = typeof process !== 'undefined';
    static _hasWindow = typeof window !== 'undefined';
    static _hasDocument = typeof document !== 'undefined';
    static _hasNavigator = typeof navigator !== 'undefined';
    static _hasGlobal = typeof global !== 'undefined';
    static _hasRequire = typeof require === 'function';
    static _hasModule = typeof module !== 'undefined';
    static _hasExports = typeof exports === 'object';
    static _hasFilename = typeof __filename === 'string';
    static _hasDirname = typeof __dirname === 'string';

    static _isWebLike = Environment._hasWindow && Environment._hasDocument && Environment._hasNavigator;
    static _isNodeLike = Environment._hasProcess && Environment._hasGlobal && Environment._hasRequire && Environment._hasModule && Environment._hasExports;
    static _isElectronLike = Environment._isWebLike && Environment._hasProcess && Environment._hasGlobal && Environment._hasRequire && Environment._hasModule && Environment._hasExports && Environment._hasFilename && Environment._hasDirname;

    static _isCommonJS = typeof module !== 'undefined' && module.exports;
    static _isEsModule = typeof exports === 'object' && typeof module === 'object' && module.exports === exports && typeof __filename === 'string' && typeof __dirname === 'string';

    static get isWeb() {
        return Environment._isWebLike;
    }

    static get isNode() {
        return Environment._isNodeLike;
    }


    // static get platfrom() {
    //     if (Environment.isWeb) {
    //         return 'web';
    //     } else if (Environment._isElectronLike) {
    //         return 'electron';
    //     } else {
    //         return 'node';
    //     }
    // }

    static get hostname() {
        if (Environment.isWeb) {
            return window.location.hostname;
        } else {
            const os = require('os');
            return process.env.HOSTNAME || os.hostname() || 'localhost';
        }
    }

    // static get username() {
    //     if (Environment.isWeb) {
    //         return '';
    //     } else {
    //         const os = require('os');
    //         return os.userInfo().username;
    //     }
    // }

    static get location() {
        if (Environment.isWeb) {
            return window.location;
        } else {
            const path = require('path');
            return path.normalize(process.cwd());
        }
    }
}


/**
 * @class UserInfo
 * @classdesc Represents the `UserInfo` component of a `URI.Authority`.
 */
class UriUserInfo {

    /** @type {string} */
    username;

    /** @type {string}  */
    password;

    constructor(username = undefined, password = undefined) {

        if (username === undefined) {
            username = '';
        }
        if (password === undefined) {
            password = '';
        }

        this.username = username;
        this.password = password;
    }

    isEmpty() {
        return this.username === '' && this.password === '';
    }

    toString() {
        return String([this.username, this.password]
            .filter((v) => v !== undefined && v !== '')
            .join(':'));
    }

}


/**
 * @class Authority
 * @classdesc Represents the `Authority` component of a `URI`.
 */
class UriAuthority {

    /** @type {UriUserInfo} */
    userInfo;

    /** @type {string} */
    host;

    /** @type {string} */
    port;

    /**
     * @readonly @property {string} hostname - the host name only
     * @description To maintain compatibility with the URL class, 
     * this property returns the host name only.
     */
    get hostname() {
        return `${this.host}`;
    }

    /**
     * @readonly @property {string} hostname - the host name + port
     * @description To maintain compatibility with the URL class, 
     * this property returns the host name + port.
     */
    get host() {
        return `${this.host}${this.port ? `:${this.port}` : ''}`;
    }


    /**
     * @param {string} host A host subcomponent, consisting of either a registered name (including but not limited to a hostname) or an IP address. IPv4 addresses must be in dot-decimal notation, and IPv6 addresses must be enclosed in brackets ([])
     * @param {number|undefined} port An optional port subcomponent preceded by a colon (:), consisting of decimal digits
     * @param {UriUserInfo|undefined} userInfo An optional userinfo subcomponent followed by an at symbol (@)
     * @returns {UriAuthority}
     */
    constructor(host, port = undefined, userInfo = undefined) {

        if (host === undefined) { // Required if constructing a URI.Authority
            host = '';
        }
        if (port === undefined) {
            port = '';
        }
        if (userInfo === undefined) {
            userInfo = new UriUserInfo();
        }

        this.userInfo = userInfo;
        this.host = host.toLowerCase();
        this.port = port;
    }

    isEmpty() {
        return this.host === '' && this.port === '' && this.userInfo.toString() === '';
    }

    toString() {
        const hostInfo = String([this.host, this.port]
            .filter((v) => v !== undefined && v !== '')
            .join(':'));
        const userInfo = this.userInfo.toString();
        return String([userInfo, hostInfo]
            .filter((v) => v !== undefined && v !== '')
            .join('@'));
    }
}


/**
 * @class URI
 * @classdesc Represents a Uniform Resource Identifier (URI).
 */
class Uri {

    /** @type {string} */
    scheme;

    /** @type {UriAuthority} */
    authority;

    /** @type {string} */
    path;

    /** @type {string|undefined} */
    query;

    /** @type {string|undefined} */
    fragment;

    /**
     * @readonly @property {string} protocol - the scheme followed by a colon (:)
     * @description To maintain compatibility with the URL class, 
     * this property returns the scheme followed by a colon (:).
     */
    get protocol() {
        return `${this.scheme}:`;
    }

    /** 
     * @readonly @property {string} origin - the protocol + authority
     * @description To maintain compatibility with the URL class, 
     * this property returns the protocol + authority.
     */
    get origin() {
        let result = String([this.protocol, this.authority]
            .filter((v) => v !== undefined && v !== '')
            .join('//'));
        return result === ''
            ? String(null) // like the URL class
            : result;
    }

    /** 
     * @readonly @property {string} pathname - the path prefixed by a slash (/)
     * @description To maintain compatibility with the URL class, 
     * this property returns the path prefixed with a slash (/).
     */
    get pathname() {
        return `/${this.path}`;
    }

    /** 
     * @readonly @property {string} search - the query preceded by a question mark (?)
     * @description To maintain compatibility with the URL class, 
     * this property returns the query preceded by a question mark (?).
     */
    get search() {
        return this.query ? `?${this.query}` : '';
    }

    /** 
     * @readonly @property {string} hash - the fragment preceded by a hash (#)
     * @description To maintain compatibility with the URL class, 
     * this property returns the fragment preceded by a hash (#).
     */
    get hash() {
        return this.fragment ? `#${this.fragment}` : '';
    }

    /**
     * @readonly @property {string} href - the complete URI as a string
     * @description To maintain compatibility with the URL class,
     * this property returns the complete URI as a string.
     */
    get href() {
        return `${this.origin}${this.pathname}${this.search}${this.hash}`;
    }

    /**
     * @param {string} scheme A non-empty scheme component followed by a colon (:)
     * @param {UriAuthority} authority An optional authority component preceded by two slashes (//)
     * @param {string} path A path component, consisting of a sequence of path segments separated by a slash (/)
     * @param {string|undefined} query An optional query component preceded by a question mark (?)
     * @param {string|undefined} fragment An optional fragment component preceded by a hash (#)
     * @returns {Uri}
     */
    constructor(scheme, authority, path, query = undefined, fragment = undefined) {

        if (scheme === undefined) { // Required if constructing a URI
            scheme = Environment.isWeb ? 'https' : 'file';
        }
        if (authority === undefined) {  // Required if constructing a URI
            authority = new UriAuthority();
        }
        if (path === undefined) {  // Required if constructing a URI
            path = '';
        }
        if (query === undefined) {
            query = '';
        }
        if (fragment === undefined) {
            fragment = '';
        }

        this.scheme = scheme.toLocaleLowerCase();
        this.authority = authority;
        this.path = path;
        this.query = query;
        this.fragment = fragment;
    }

    static fromString(uriString) {
        const url = new URL(uriString);
        return Uri.fromUrl(url);
    }

    static fromUrl(url) {
        const scheme = url.protocol.replace(/:$/, '');
        const authority = new UriAuthority(url.hostname, url.port, new UriUserInfo(url.username, url.password));
        const path = url.pathname.replace(/^\//, '');
        const query = url.search.replace(/^\?/, '')
        const fragment = url.hash.replace(/^#/, '');
        return new Uri(scheme, authority, path, query, fragment);
    }

    toUrl() {
        return new URL(this.toString());
    }

    toString() {
        return this.href;
    }
}

