"use strict";
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
    activate: function() {
        return activate;
    },
    deactivate: function() {
        return deactivate;
    }
});
const _vscode = /*#__PURE__*/ _interop_require_wildcard(require("vscode"));
const _fs = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
const _jsoncparser = /*#__PURE__*/ _interop_require_wildcard(require("jsonc-parser"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
const _Log = require("./utils/Log");
const _Meta = require("./utils/Meta");
const _vscodeEnvFacade = require("./system/vscodeEnvFacade");
const _FileHandler = require("./utils/FileHandler");
const _services = require("./services");
const _webviewPanel = require("./webviewPanel");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const EXT_AUTH = `carljdp`;
const EXT_NAME = `x10shine`;
/** The top level file handler for the application. */ const filehandler = _FileHandler.FileHandler.initOnce({
    lockFileOptions: {
        // my arbitrary options '¯\_(ツ)_/¯'
        retries: 5,
        retryWait: 100
    }
});
const root = new _Log.Logger({
    scopeLabel: "",
    initialRelativeSeverity: _Log.LogSeverity.Debug
});
root.debug('--start--');
/**
 * Read and parse a JSONC file.
 * @param extensionsJsonPath e.g. '.vscode/extensions.json'
 * @param encoding e.g. 'utf8'
 * @returns The parsed JSON object or null if there were parsing errors.
 * @throws NONE - Errors are logged and returned as null.
 */ async function readAndParseJSONC(extensionsJsonPath, encoding = 'utf8') {
    try {
        //  check if the file exists
        if (!_fs.existsSync(extensionsJsonPath)) {
            console.info('File does not exist:', extensionsJsonPath);
            return null;
        }
        const existingFileSize = await _services.storageService.fileSize(extensionsJsonPath, '');
        const utf8Buffer = Buffer.alloc(existingFileSize);
        if (!await _services.storageService.readFile(extensionsJsonPath, '', utf8Buffer, encoding)) {
            console.error('Error reading the JSONC file:', extensionsJsonPath);
            return null;
        }
        const jsoncFileContent = new TextDecoder().decode(utf8Buffer);
        const jsoncParseErrors = [];
        const json = _jsoncparser.parse(jsoncFileContent, jsoncParseErrors, {
            disallowComments: false,
            allowTrailingComma: true,
            allowEmptyContent: true
        });
        // Check if there were any errors during parsing
        if (jsoncParseErrors.length === 0) {
            return json;
        } else {
            // Handle or log parsing errors
            console.error('JSONC parsing errors:', jsoncParseErrors);
            return null; // or throw new Error('JSONC parsing errors');
        }
    } catch (error) {
        console.error('Error reading the JSONC file:', error);
        return null; // or throw error;
    }
}
class ExtensionItem extends _vscode.TreeItem {
    extension;
    tag;
    constructor(extension, tag){
        super(extension.id);
        this.extension = extension;
        this.tag = tag;
        if (tag.includes('recommended')) {
            this.iconPath = new _vscode.ThemeIcon('check');
        } else if (tag.includes('unwanted')) {
            this.iconPath = new _vscode.ThemeIcon('error');
        } else {
        //
        }
        this.tooltip = `${extension.packageJSON.displayName}`;
    }
}
class ExtensionViewProvider {
    _onDidChangeTreeData = new _vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    log;
    filter;
    // default constructor
    constructor(fliter){
        this.filter = fliter;
        this.log = root.subScope({
            scopeLabel: (0, _Meta.getContextName)().replace(/new /, '').concat(`(${this.filter})`),
            initialRelativeSeverity: _Log.LogSeverity.Debug
        });
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (element) {
            return [];
        } else {
            const local = this.log.subScope({});
            local.debug('--start--');
            // example usage, not used yet
            const vscodeUserDataGlobalStateJsonPath = await _vscodeEnvFacade.XVS.UserData.globalStateJson.resolved;
            const workspaceFolderPath = _vscode.workspace.workspaceFolders?.[0].uri.fsPath || './';
            const extensionsJsonPath = _path.join(workspaceFolderPath, '.vscode', 'extensions.json');
            local.log('extensionsJsonPath:\n    ', extensionsJsonPath);
            const vscodeFolderExtensions = await readAndParseJSONC(extensionsJsonPath);
            const recommendations = vscodeFolderExtensions?.recommendations || [];
            const unwantedRecommendations = vscodeFolderExtensions?.unwantedRecommendations || [];
            const allKnownExtensions = _vscode.extensions.all;
            let extensionItems = [];
            if (this.filter === 'wanted') {
                local.debug('wanted');
                extensionItems = allKnownExtensions.filter((ext)=>recommendations.includes(ext.id)).map((ext)=>{
                    let tag = '';
                    if (recommendations.includes(ext.id)) {
                        tag = 'recommended';
                    } else if (unwantedRecommendations.includes(ext.id)) {
                        tag = 'unwanted';
                    } else {
                        tag = 'unknown';
                    }
                    return new ExtensionItem(ext, tag);
                });
            }
            if (this.filter === 'unwanted') {
                local.debug('unwanted');
                extensionItems = allKnownExtensions.filter((ext)=>unwantedRecommendations.includes(ext.id)).map((ext)=>{
                    let tag = '';
                    if (recommendations.includes(ext.id)) {
                        tag = 'recommended';
                    } else if (unwantedRecommendations.includes(ext.id)) {
                        tag = 'unwanted';
                    } else {
                        tag = 'unknown';
                    }
                    return new ExtensionItem(ext, tag);
                });
            }
            if (this.filter === 'dontCare') {
                local.debug('dontCare');
                extensionItems = allKnownExtensions.filter((ext)=>!recommendations.includes(ext.id) && !unwantedRecommendations.includes(ext.id)).filter((ext)=>!ext.packageJSON.isBuiltin).map((ext)=>{
                    let tag = '';
                    if (recommendations.includes(ext.id)) {
                        tag = 'recommended';
                    } else if (unwantedRecommendations.includes(ext.id)) {
                        tag = 'unwanted';
                    } else {
                        tag = 'unknown';
                    }
                    return new ExtensionItem(ext, tag);
                });
            }
            // extensionItems = allKnownExtensions
            //     .filter(ext => !ext.packageJSON.isBuiltin)
            //     .map((ext) => {
            //         let tag = '';
            //         if (recommendations.includes(ext.id)) {
            //             tag = 'recommended';
            //         } else if (unwantedRecommendations.includes(ext.id)) {
            //             tag = 'unwanted';
            //         } else {
            //             tag = 'unknown';
            //         }
            //         return new ExtensionItem(ext, tag);
            //     });
            local.debug('---end---');
            return extensionItems;
        }
    }
}
// Define the function to return your webview content
function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Custom Webview</title>
    </head>
    <body>
      <h1>Hello, World!</h1>
    </body>
    </html>
  `;
}
let currentPanel = undefined;
function activate(context) {
    const log = root.subScope({
        scopeLabel: (0, _Meta.getContextName)()
    });
    log.debug('--start--');
    log.indent();
    context.subscriptions.push(_vscode.window.registerTreeDataProvider(`${EXT_NAME}.extMan.view.wanted`, new ExtensionViewProvider('wanted')));
    context.subscriptions.push(_vscode.window.registerTreeDataProvider(`${EXT_NAME}.extMan.view.unwanted`, new ExtensionViewProvider('unwanted')));
    context.subscriptions.push(_vscode.window.registerTreeDataProvider(`${EXT_NAME}.extMan.view.dontCare`, new ExtensionViewProvider('dontCare')));
    // In the activate function
    context.subscriptions.push(_vscode.commands.registerCommand(`${EXT_NAME}.extMan.navigateToExtension`, (item)=>{
        const _log = log.subScope({
            scopeLabel: `${EXT_NAME}.extMan.navigateToExtension`
        });
        _log.debug('--start--');
        // fornow: view the extension info in the extension view
        _vscode.commands.executeCommand('workbench.extensions.action.showExtension', item.extension.id);
        _log.debug('---end---');
    }));
    // In the activate function
    context.subscriptions.push(_vscode.commands.registerCommand(`${EXT_NAME}.enableExtension`, (item)=>{
        const _log = log.subScope({
            scopeLabel: 'enableExtension'
        });
        _log.debug('--start--');
        // TODO: Enable the extension
        _log.info('Enabling extension:', item.extension.id);
        _log.debug('---end---');
    }));
    context.subscriptions.push(_vscode.commands.registerCommand(`${EXT_NAME}.disableExtension`, (item)=>{
        const _log = log.subScope({
            scopeLabel: 'disableExtension'
        });
        _log.debug('--start--');
        // TODO: Disable the extension
        _log.info('Enabling extension:', item.extension.id);
        _log.debug('---end---');
    }));
    // can export a public API here, available to other extensions
    let publicApi = {
        sum (a, b) {
            return a + b;
        },
        mul (a, b) {
            return a * b;
        }
    };
    // ------------------------------------------------------------------------
    context.subscriptions.push(_vscode.commands.registerCommand('x10shine-webviewPanel1', ()=>{
        if (currentPanel) {
            // If we already have a panel, show it.
            currentPanel.reveal(_vscode.ViewColumn.One);
        } else {
            // Otherwise, create a new panel.
            currentPanel = _vscode.window.createWebviewPanel('customWebView', 'Custom Webview', {
                viewColumn: _vscode.ViewColumn.One,
                preserveFocus: true
            }, {
                enableScripts: true
            });
            currentPanel.webview.html = getWebviewContent();
            currentPanel.onDidDispose(()=>{
                // When the panel is closed, set the currentPanel to undefined
                currentPanel = undefined;
            }, null, context.subscriptions);
        }
    }));
    // If your webview should open on workspace load, you can call the command directly here
    // vscode.commands.executeCommand('x10shine-webviewPanel1');
    // ------------------------------------------------------------------------
    (0, _webviewPanel.threejsWebviewActivate)(context);
    // ------------------------------------------------------------------------
    log.unindent();
    log.debug('---end---');
    // 'export' public api-surface
    return publicApi;
}
function deactivate() {
    const log = root.subScope({
        scopeLabel: (0, _Meta.getContextName)()
    });
    log.debug('--start--');
    log.indent();
    log.unindent();
    log.debug('---end---');
}
root.debug('---end---');

//# sourceMappingURL=index.js.map