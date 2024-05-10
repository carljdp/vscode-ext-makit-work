import * as vscode from 'vscode';

import crypto from 'node:crypto';

import { join, basename, sep, relative, resolve } from 'node:path';

import { _isProd_, _isDev_, _isDebug_ } from '../../dev/EnvConf.cjs';
import AppConf from '../../dev/AppConf.cjs';
import assert from 'node:assert';

const __extensionId = `${AppConf.APP_PUBL}.${AppConf.APP_NAME}`;
const __extension = vscode.extensions.getExtension(__extensionId) || undefined;
if (__extension === undefined) {
    throw new Error(`Extension with id '${__extensionId}' not found`);
}

const normalizeDriveLetter = (path: string) => {
    const driveLetterRegex = /^\/?[a-z]:?(?=(\\{1,2}|\/))/;
    const match = path.match(driveLetterRegex);
    if (match) {
        const upper = match[0].toUpperCase();
        return path.replace(driveLetterRegex, upper);
    }
    return path;
};

const __extensionUri = __extension.extensionUri;
const _absExtensRoot = resolve(vscode.Uri.parse(String(__extensionUri)).fsPath);
const _absProjRoot = resolve(AppConf.PROJ_ROOT_ABS_PATH);
// const _relativePath = relative(_absExtensRoot, _absProjRoot);
// const relativeParts = _relativePath.split(sep);


assert.equal(normalizeDriveLetter(_absExtensRoot), normalizeDriveLetter(_absProjRoot), 'WebviewPanel: Context path is not the same as project root path');

const relativePaths = {
    srcWebapp: join(AppConf.APP_ROOT_SRC_DIR, AppConf.APP_WEBAPP_SRC_DIR),
    distWebapp: join(AppConf.APP_ROOT_OUT_DIR, AppConf.APP_WEBAPP_OUT_DIR),
    distVendor: join(AppConf.APP_ROOT_OUT_DIR, AppConf.APP_VENDOR_OUT_DIR)
};

if (_isDebug_) {
    console.log('[webview/index.ts] resourcePath:')
    console.table([
        { var: 'resourcePath.srcWebapp', value: relativePaths.srcWebapp },
        { var: 'resourcePath.distWebapp', value: relativePaths.distWebapp },
        { var: 'resourcePath.distVendor', value: relativePaths.distVendor }
    ])
}


class ThreeJsWebviewPanel {

    private static getNonce() {
        return crypto.randomBytes(16).toString('hex');
    }

    public static currentPanel: ThreeJsWebviewPanel | undefined;

    public static readonly viewType = 'webviewPanel3';

    public static readonly subscriptions: Record<string, (context: vscode.ExtensionContext) => vscode.Disposable> = {
        start: (context: vscode.ExtensionContext) => vscode.commands.registerCommand(
            'x10shine-webviewPanel3', () => {
                ThreeJsWebviewPanel.createOrShow(context.extensionUri);
            })
    };

    public static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
        return {
            // Enable javascript in the webview
            enableScripts: true,

            // localResourceRoots: [
            //     vscode.Uri.joinPath(extensionUri, relativePaths.srcWebapp),
            //     vscode.Uri.joinPath(extensionUri, relativePaths.distWebapp),
            //     vscode.Uri.joinPath(extensionUri, relativePaths.distVendor),
            // ],
        };
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (ThreeJsWebviewPanel.currentPanel) {
            ThreeJsWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            ThreeJsWebviewPanel.viewType, // type
            ThreeJsWebviewPanel.viewType, // title
            {
                viewColumn: column || vscode.ViewColumn.One,
                preserveFocus: true
            },
            ThreeJsWebviewPanel.getWebviewOptions(extensionUri),
        );

        ThreeJsWebviewPanel.revive(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        ThreeJsWebviewPanel.currentPanel = new ThreeJsWebviewPanel(panel, extensionUri);
    }


    private readonly _panel: vscode.WebviewPanel;

    private readonly _extensionUri: vscode.Uri;

    private _disposables: vscode.Disposable[] = [];


    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            event => {
                console.log(`Webview panel changed state to ${event.webviewPanel.visible ? 'visible' : 'hidden'}`);
                console.log(`    WebviewPanel Event:\n`, event);
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

    }

    public dispose() {
        ThreeJsWebviewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        console.log('Updating webview content');

        const webview = this._panel.webview;

        // Vary the webview's content based on where it is located in the editor.
        switch (this._panel.viewColumn) {
            case vscode.ViewColumn.Two:
                this._updateForImg(webview);
                return;

            case vscode.ViewColumn.Three:
                this._updateForImg(webview);
                return;

            case vscode.ViewColumn.One:
            default:
                this._updateForImg(webview);
                return;
        }
    }

    private _updateForImg(webview: vscode.Webview) {
        this._panel.title = ThreeJsWebviewPanel.viewType
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {

        // TODO: should the 'dist' bpart rather be configured in webpack?
        const webappPathOnDisk = vscode.Uri.joinPath(this._extensionUri, relativePaths.distWebapp);
        const vendorPathOnDisk = vscode.Uri.joinPath(this._extensionUri, relativePaths.distVendor);

        // temp hack
        const pathToSrcCss = vscode.Uri.joinPath(this._extensionUri, relativePaths.srcWebapp);

        const threeJsScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            vendorPathOnDisk, 'three/build/three.cjs'));
        const OrbitControlsScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            vendorPathOnDisk, 'three/examples/jsm/controls/OrbitControls.js'));

        const mainJsScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(webappPathOnDisk, 'index.js'));

        // const mainCssUri = webview.asWebviewUri(vscode.Uri.joinPath(webappPathOnDisk, 'main.css'));
        const mainCssUri = webview.asWebviewUri(vscode.Uri.joinPath(pathToSrcCss, 'main.css'));

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
            imgSrc: `img-src ${webview.cspSource} https:;`,
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

function threejsWebviewActivate(context: vscode.ExtensionContext) {
    context.subscriptions.push(ThreeJsWebviewPanel.subscriptions.start(context));

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(ThreeJsWebviewPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = ThreeJsWebviewPanel.getWebviewOptions(context.extensionUri);
                ThreeJsWebviewPanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}


export { threejsWebviewActivate };