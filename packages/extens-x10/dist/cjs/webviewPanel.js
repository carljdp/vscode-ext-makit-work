"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "threejsWebviewActivate", {
    enumerable: true,
    get: function() {
        return threejsWebviewActivate;
    }
});
const _vscode = /*#__PURE__*/ _interop_require_wildcard(require("vscode"));
const _nodecrypto = /*#__PURE__*/ _interop_require_default(require("node:crypto"));
const _nodepath = require("node:path");
const _EnvConf = require("./dev/EnvConf.js");
const _AppConf = /*#__PURE__*/ _interop_require_default(require("./dev/AppConf.js"));
const _nodeassert = /*#__PURE__*/ _interop_require_default(require("node:assert"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
const __extensionId = `${_AppConf.default.APP_PUBL}.${_AppConf.default.APP_NAME}`;
const __extension = _vscode.extensions.getExtension(__extensionId) || undefined;
if (__extension === undefined) {
    throw new Error(`Extension with id '${__extensionId}' not found`);
}
const normalizeDriveLetter = (path)=>{
    const driveLetterRegex = /^\/?[a-z]:?(?=(\\{1,2}|\/))/;
    const match = path.match(driveLetterRegex);
    if (match) {
        const upper = match[0].toUpperCase();
        return path.replace(driveLetterRegex, upper);
    }
    return path;
};
const __extensionUri = __extension.extensionUri;
const _absExtensRoot = (0, _nodepath.resolve)(_vscode.Uri.parse(String(__extensionUri)).fsPath);
const _absProjRoot = (0, _nodepath.resolve)(_AppConf.default.PROJ_ROOT_ABS_PATH);
// const _relativePath = relative(_absExtensRoot, _absProjRoot);
// const relativeParts = _relativePath.split(sep);
_nodeassert.default.equal(normalizeDriveLetter(_absExtensRoot), normalizeDriveLetter(_absProjRoot), 'WebviewPanel: Context path is not the same as project root path');
const relativePaths = {
    srcWebapp: (0, _nodepath.join)(_AppConf.default.APP_ROOT_SRC_DIR, _AppConf.default.APP_WEBAPP_SRC_DIR),
    distWebapp: (0, _nodepath.join)(_AppConf.default.APP_ROOT_OUT_DIR, _AppConf.default.APP_WEBAPP_OUT_DIR),
    distVendor: (0, _nodepath.join)(_AppConf.default.APP_ROOT_OUT_DIR, _AppConf.default.APP_VENDOR_OUT_DIR)
};
if (_EnvConf._isDebug_) {
    console.log('[webview/index.ts] resourcePath:');
    console.table([
        {
            var: 'resourcePath.srcWebapp',
            value: relativePaths.srcWebapp
        },
        {
            var: 'resourcePath.distWebapp',
            value: relativePaths.distWebapp
        },
        {
            var: 'resourcePath.distVendor',
            value: relativePaths.distVendor
        }
    ]);
}
class ThreeJsWebviewPanel {
    static getNonce() {
        return _nodecrypto.default.randomBytes(16).toString('hex');
    }
    static currentPanel;
    static viewType = 'webviewPanel3';
    static subscriptions = {
        start: (context)=>_vscode.commands.registerCommand('x10shine-webviewPanel3', ()=>{
                ThreeJsWebviewPanel.createOrShow(context.extensionUri);
            })
    };
    static getWebviewOptions(extensionUri) {
        return {
            // Enable javascript in the webview
            enableScripts: true
        };
    }
    static createOrShow(extensionUri) {
        const column = _vscode.window.activeTextEditor ? _vscode.window.activeTextEditor.viewColumn : undefined;
        // If we already have a panel, show it.
        if (ThreeJsWebviewPanel.currentPanel) {
            ThreeJsWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = _vscode.window.createWebviewPanel(ThreeJsWebviewPanel.viewType, ThreeJsWebviewPanel.viewType, {
            viewColumn: column || _vscode.ViewColumn.One,
            preserveFocus: true
        }, ThreeJsWebviewPanel.getWebviewOptions(extensionUri));
        ThreeJsWebviewPanel.revive(panel, extensionUri);
    }
    static revive(panel, extensionUri) {
        ThreeJsWebviewPanel.currentPanel = new ThreeJsWebviewPanel(panel, extensionUri);
    }
    _panel;
    _extensionUri;
    _disposables = [];
    constructor(panel, extensionUri){
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(()=>this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState((event)=>{
            console.log(`Webview panel changed state to ${event.webviewPanel.visible ? 'visible' : 'hidden'}`);
            console.log(`    WebviewPanel Event:\n`, event);
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
    }
    dispose() {
        ThreeJsWebviewPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while(this._disposables.length){
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        console.log('Updating webview content');
        const webview = this._panel.webview;
        // Vary the webview's content based on where it is located in the editor.
        switch(this._panel.viewColumn){
            case _vscode.ViewColumn.Two:
                this._updateForImg(webview);
                return;
            case _vscode.ViewColumn.Three:
                this._updateForImg(webview);
                return;
            case _vscode.ViewColumn.One:
            default:
                this._updateForImg(webview);
                return;
        }
    }
    _updateForImg(webview) {
        this._panel.title = ThreeJsWebviewPanel.viewType;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        // TODO: should the 'dist' bpart rather be configured in webpack?
        const webappPathOnDisk = _vscode.Uri.joinPath(this._extensionUri, relativePaths.distWebapp);
        const vendorPathOnDisk = _vscode.Uri.joinPath(this._extensionUri, relativePaths.distVendor);
        // temp hack
        const pathToSrcCss = _vscode.Uri.joinPath(this._extensionUri, relativePaths.srcWebapp);
        const threeJsScriptUri = webview.asWebviewUri(_vscode.Uri.joinPath(vendorPathOnDisk, 'three/build/three.cjs'));
        const OrbitControlsScriptUri = webview.asWebviewUri(_vscode.Uri.joinPath(vendorPathOnDisk, 'three/examples/jsm/controls/OrbitControls.js'));
        const mainJsScriptUri = webview.asWebviewUri(_vscode.Uri.joinPath(webappPathOnDisk, 'index.js'));
        // const mainCssUri = webview.asWebviewUri(vscode.Uri.joinPath(webappPathOnDisk, 'main.css'));
        const mainCssUri = webview.asWebviewUri(_vscode.Uri.joinPath(pathToSrcCss, 'main.css'));
        // Use a nonce to only allow specific scripts to be run
        const nonce = ThreeJsWebviewPanel.getNonce();
        console.table({
            threeJsScriptUri,
            OrbitControlsScriptUri,
            mainJsScriptUri,
            mainCssUri,
            nonce
        });
        const csp = {
            defaultSrc: `default-src 'none';`,
            styleSrc: `style-src ${webview.cspSource} 'nonce-${nonce}';`,
            scriptSrc: `script-src ${webview.cspSource} 'unsafe-eval' 'nonce-${nonce}';`,
            imgSrc: `img-src ${webview.cspSource} https:;`
        };
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
            
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="${csp.defaultSrc} ${csp.styleSrc} ${csp.scriptSrc} ${csp.imgSrc}">
            
                <meta charset="UTF-8">
		        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">

				<link href="${mainCssUri}" rel="stylesheet" nonce="${nonce}">

                <style nonce="${nonce}">
                    b {
                        color: lightgreen;
                    }
                </style>

				<title>${ThreeJsWebviewPanel.viewType}</title>

			</head>
			<body>

                <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - cameras<br/>
                <b>O</b> orthographic <b>P</b> perspective
                </div>

                <script type="importmap" nonce="${nonce}">
                    {
                        "imports": {
                            "three": "${threeJsScriptUri}",
                            "OrbitControls": "${OrbitControlsScriptUri}"
                        }
                    }
                </script>

				<script type="module" src="${mainJsScriptUri}" nonce="${nonce}"></script>

			</body>
			</html>`;
    }
}
// ============================================================================
function threejsWebviewActivate(context) {
    context.subscriptions.push(ThreeJsWebviewPanel.subscriptions.start(context));
    if (_vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        _vscode.window.registerWebviewPanelSerializer(ThreeJsWebviewPanel.viewType, {
            async deserializeWebviewPanel (webviewPanel, state) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = ThreeJsWebviewPanel.getWebviewOptions(context.extensionUri);
                ThreeJsWebviewPanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}

//# sourceMappingURL=webviewPanel.js.map