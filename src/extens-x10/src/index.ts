

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as jsoncParser from 'jsonc-parser';
import * as path from 'path';

import { Logger, LogSeverity } from './utils/Log';

import { getContextName } from './utils/Meta';

import { XVS } from './system/vscodeEnvFacade';


import { FileHandler } from './utils/FileHandler';


import { storageService } from './services';


import { threejsWebviewActivate } from './webviewPanel';



const EXT_AUTH: Readonly<string> = `carljdp`;
const EXT_NAME: Readonly<string> = `x10shine`;


/** The top level file handler for the application. */
const filehandler = FileHandler.initOnce({
    lockFileOptions: {
        // my arbitrary options '¯\_(ツ)_/¯'
        retries: 5,
        retryWait: 100
    }
});

const root = new Logger({
    scopeLabel: "", // or "ROOT" 
    initialRelativeSeverity: LogSeverity.Debug
});
root.debug('--start--');


/**
 * Read and parse a JSONC file.
 * @param extensionsJsonPath e.g. '.vscode/extensions.json'
 * @param encoding e.g. 'utf8'
 * @returns The parsed JSON object or null if there were parsing errors.
 * @throws NONE - Errors are logged and returned as null.
 */
async function readAndParseJSONC<T extends object>(extensionsJsonPath: fs.PathLike, encoding: BufferEncoding = 'utf8'): Promise<T | null> {
    try {

        //  check if the file exists
        if (!fs.existsSync(extensionsJsonPath)) {
            console.info('File does not exist:', extensionsJsonPath);
            return null;
        }

        const existingFileSize = await storageService.fileSize(extensionsJsonPath as string, '');
        const utf8Buffer: Buffer = Buffer.alloc(existingFileSize);

        if (! await storageService.readFile(extensionsJsonPath as string, '', utf8Buffer, encoding)) {
            console.error('Error reading the JSONC file:', extensionsJsonPath);
            return null;
        }
        const jsoncFileContent = new TextDecoder().decode(utf8Buffer);

        const jsoncParseErrors: jsoncParser.ParseError[] = [];
        const json = jsoncParser.parse(jsoncFileContent, jsoncParseErrors, {
            disallowComments: false,
            allowTrailingComma: true,
            allowEmptyContent: true,
        });

        // Check if there were any errors during parsing
        if (jsoncParseErrors.length === 0) {
            return json as T;
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

class ExtensionItem extends vscode.TreeItem {
    constructor(public readonly extension: vscode.Extension<any>, public readonly tag: string) {
        super(extension.id);

        if (tag.includes('recommended')) {
            this.iconPath = new vscode.ThemeIcon('check');
        }
        else if (tag.includes('unwanted')) {
            this.iconPath = new vscode.ThemeIcon('error');
        }
        else {
            //
        }

        this.tooltip = `${extension.packageJSON.displayName}`;
    }
}

class ExtensionViewProvider implements vscode.TreeDataProvider<ExtensionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ExtensionItem | undefined> = new vscode.EventEmitter<ExtensionItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ExtensionItem | undefined> = this._onDidChangeTreeData.event;

    private log: Logger;

    filter: string;

    // default constructor
    constructor(fliter: string) {
        this.filter = fliter;

        this.log = root.subScope({
            scopeLabel: getContextName().replace(/new /, '').concat(`(${this.filter})`),
            initialRelativeSeverity: LogSeverity.Debug
        });

    }


    getTreeItem(element: ExtensionItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ExtensionItem): Promise<ExtensionItem[]> {
        if (element) {
            return [];
        } else {
            const local = this.log.subScope({});
            local.debug('--start--');

            // example usage, not used yet
            const vscodeUserDataGlobalStateJsonPath = await XVS.UserData.globalStateJson.resolved;


            const workspaceFolderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || './';
            const extensionsJsonPath = path.join(workspaceFolderPath, '.vscode', 'extensions.json');

            local.log('extensionsJsonPath:\n    ', extensionsJsonPath);

            type ExtensionsJson = {
                recommendations?: string[];
                unwantedRecommendations?: string[];
            };

            const vscodeFolderExtensions = await readAndParseJSONC<ExtensionsJson>(extensionsJsonPath);

            const recommendations = vscodeFolderExtensions?.recommendations || [];

            const unwantedRecommendations = vscodeFolderExtensions?.unwantedRecommendations || [];

            const allKnownExtensions = vscode.extensions.all;

            let extensionItems: ExtensionItem[] = [];

            if (this.filter === 'wanted') {
                local.debug('wanted');

                extensionItems = allKnownExtensions
                    .filter(ext => recommendations.includes(ext.id))
                    .map((ext) => {
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

                extensionItems = allKnownExtensions
                    .filter(ext => unwantedRecommendations.includes(ext.id))
                    .map((ext) => {
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

                extensionItems = allKnownExtensions
                    .filter(ext => !recommendations.includes(ext.id) && !unwantedRecommendations.includes(ext.id))
                    .filter(ext => !ext.packageJSON.isBuiltin)
                    .map((ext) => {
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

let currentPanel: vscode.WebviewPanel | undefined = undefined;

// pseudo 'init'
export function activate(context: vscode.ExtensionContext) {
    const log = root.subScope({ scopeLabel: getContextName() });
    log.debug('--start--');
    log.indent();

    context.subscriptions.push(vscode.window.registerTreeDataProvider(
        `${EXT_NAME}.extMan.view.wanted`, new ExtensionViewProvider('wanted')));

    context.subscriptions.push(vscode.window.registerTreeDataProvider(
        `${EXT_NAME}.extMan.view.unwanted`, new ExtensionViewProvider('unwanted')));

    context.subscriptions.push(vscode.window.registerTreeDataProvider(
        `${EXT_NAME}.extMan.view.dontCare`, new ExtensionViewProvider('dontCare')));

    // In the activate function
    context.subscriptions.push(vscode.commands.registerCommand(
        `${EXT_NAME}.extMan.navigateToExtension`,
        (item: ExtensionItem) => {
            const _log = log.subScope({ scopeLabel: `${EXT_NAME}.extMan.navigateToExtension` });
            _log.debug('--start--');

            // fornow: view the extension info in the extension view
            vscode.commands.executeCommand('workbench.extensions.action.showExtension', item.extension.id);




            _log.debug('---end---');
        }
    ));

    // In the activate function
    context.subscriptions.push(vscode.commands.registerCommand(
        `${EXT_NAME}.enableExtension`,
        (item: ExtensionItem) => {
            const _log = log.subScope({ scopeLabel: 'enableExtension' });
            _log.debug('--start--');

            // TODO: Enable the extension
            _log.info('Enabling extension:', item.extension.id);

            _log.debug('---end---');
        }
    ));

    context.subscriptions.push(vscode.commands.registerCommand(
        `${EXT_NAME}.disableExtension`,
        (item: ExtensionItem) => {
            const _log = log.subScope({ scopeLabel: 'disableExtension' });
            _log.debug('--start--');

            // TODO: Disable the extension
            _log.info('Enabling extension:', item.extension.id);

            _log.debug('---end---');
        }
    ));

    // can export a public API here, available to other extensions
    let publicApi = {
        sum(a: number, b: number): number {
            return a + b;
        },
        mul(a: number, b: number): number {
            return a * b;
        }
    };


    // ------------------------------------------------------------------------

    context.subscriptions.push(vscode.commands.registerCommand('x10shine-webviewPanel1', () => {
        if (currentPanel) {
            // If we already have a panel, show it.
            currentPanel.reveal(vscode.ViewColumn.One);
        } else {
            // Otherwise, create a new panel.
            currentPanel = vscode.window.createWebviewPanel(
                'customWebView',
                'Custom Webview',
                {
                    viewColumn: vscode.ViewColumn.One,
                    preserveFocus: true
                },
                {
                    enableScripts: true
                }
            );

            currentPanel.webview.html = getWebviewContent();

            currentPanel.onDidDispose(
                () => {
                    // When the panel is closed, set the currentPanel to undefined
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    }));

    // If your webview should open on workspace load, you can call the command directly here
    // vscode.commands.executeCommand('x10shine-webviewPanel1');

    // ------------------------------------------------------------------------


    threejsWebviewActivate(context);


    // ------------------------------------------------------------------------

    log.unindent();
    log.debug('---end---');

    // 'export' public api-surface
    return publicApi;
}

// pseudo 'deinit'
export function deactivate() {
    const log = root.subScope({ scopeLabel: getContextName() });
    log.debug('--start--');
    log.indent();

    log.unindent();
    log.debug('---end---');
}


root.debug('---end---');