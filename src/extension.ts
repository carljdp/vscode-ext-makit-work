// file: /src/extension.ts

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as jsoncParser from 'jsonc-parser';
import * as path from 'path';

import { Logger, LogSeverity } from './utils/Log';
import { getContextName } from './utils/Meta';

const EXT_AUTH: Readonly<string> = `carljdp`;
const EXT_NAME: Readonly<string> = `makit-work`;


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
async function readAndParseJSONC(extensionsJsonPath: fs.PathLike, encoding: BufferEncoding = 'utf8'): Promise<any | null> {
    try {

        //  check if the file exists
        if (!fs.existsSync(extensionsJsonPath)) {
            console.info('File does not exist:', extensionsJsonPath);
            return null;
        }


        const content = await fs.promises.readFile(extensionsJsonPath, encoding);

        // error listener
        let errors: jsoncParser.ParseError[] = [];

        const json = jsoncParser.parse(content, errors, { 
            disallowComments: false,
            allowTrailingComma: true,
            allowEmptyContent: true,
        });

        // Check if there were any errors during parsing
        if (errors.length === 0) {
            return json;
        } else {
            // Handle or log parsing errors
            console.error('JSONC parsing errors:', errors);
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


            const workspaceFolderPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || './';
            const extensionsJsonPath = path.join(workspaceFolderPath, '.vscode', 'extensions.json');

            local.log('extensionsJsonPath:\n    ', extensionsJsonPath);
            const vscodeFolderExtensions = await readAndParseJSONC(extensionsJsonPath);

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


// pseudo 'init'
export function activate(context: vscode.ExtensionContext) {
    const log = root.subScope({ scopeLabel: getContextName() });
    log.debug('--start--');
    log.indent();

    context.subscriptions.push(vscode.window.registerTreeDataProvider(
        'makit-work.extMan.view.wanted', new ExtensionViewProvider('wanted')));

    context.subscriptions.push(vscode.window.registerTreeDataProvider(
        'makit-work.extMan.view.unwanted', new ExtensionViewProvider('unwanted')));

    context.subscriptions.push(vscode.window.registerTreeDataProvider(
        'makit-work.extMan.view.dontCare', new ExtensionViewProvider('dontCare')));

    // In the activate function
    context.subscriptions.push(vscode.commands.registerCommand(
        'makit-work.extMan.navigateToExtension',
        (item: ExtensionItem) => {
            const _log = log.subScope({ scopeLabel: 'makit-work.extMan.navigateToExtension' });
            _log.debug('--start--');

            // fornow: view the extension info in the extension view
            vscode.commands.executeCommand('workbench.extensions.action.showExtension', item.extension.id);




            _log.debug('---end---');
        }
    ));

    // In the activate function
    context.subscriptions.push(vscode.commands.registerCommand(
        'makit-work.enableExtension',
        (item: ExtensionItem) => {
            const _log = log.subScope({ scopeLabel: 'enableExtension' });
            _log.debug('--start--');

            // TODO: Enable the extension

            _log.debug('---end---');
        }
    ));

    context.subscriptions.push(vscode.commands.registerCommand(
        'makit-work.disableExtension',
        (item: ExtensionItem) => {
            const _log = log.subScope({ scopeLabel: 'disableExtension' });
            _log.debug('--start--');

            // TODO: Disable the extension

            _log.debug('---end---');
        }
    ));

    log.unindent();
    log.debug('---end---');
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