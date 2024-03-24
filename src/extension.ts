// file: /src/extension.ts

import * as vscode from 'vscode';

import { Logger } from './utils/Log';
import { getContextName } from './utils/Meta';

const EXT_AUTH: Readonly<string> = `carljdp`;
const EXT_NAME: Readonly<string> = `makit-work`;

class ExtensionItem extends vscode.TreeItem {
    constructor(public readonly extension: vscode.Extension<any>) {
        super(extension.packageJSON.displayName || extension.id);
    }
}

class ExtensionViewProvider implements vscode.TreeDataProvider<ExtensionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ExtensionItem | undefined> = new vscode.EventEmitter<ExtensionItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ExtensionItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: ExtensionItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ExtensionItem): Thenable<ExtensionItem[]> {
        if (element) {
            // If there is an element, return its children (if it has children).
            return Promise.resolve([]);
        } else {
            // Return the list of non-builtin extensions as top-level tree items.
            const extensions = vscode.extensions.all
                .filter(ext => !ext.packageJSON.isBuiltin)
                .map(ext => new ExtensionItem(ext));
            return Promise.resolve(extensions);
        }
    }

    // Refresh the tree view
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}


// pseudo 'init'
export function activate(context: vscode.ExtensionContext) {
	const log = new Logger({scopeLabel: getContextName()});
	log.debug('start ..');
	log.indent();

	const extensionViewProvider = new ExtensionViewProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('makit-work.extensionView', extensionViewProvider));

	// In the activate function
	context.subscriptions.push(vscode.commands.registerCommand(
		'makit-work.enableExtension',
		(item: ExtensionItem) => {
			// Implementation for enabling an extension
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		'makit-work.disableExtension',
		(item: ExtensionItem) => {
			// Implementation for disabling an extension
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		'makit-work.helloWorld',
		() => {
			vscode.window.showInformationMessage('Hello World from Makit Work!');
		}
	));

	log.debug('.. end.');
}

// pseudo 'deinit'
export function deactivate() {
	const log = new Logger({scopeLabel: getContextName()});
	log.debug('start ..');
	log.indent();

	log.debug('.. end.');
}
