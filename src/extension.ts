import * as vscode from 'vscode';
import { createTest } from './createTest';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createTestFile', (uri) => {
        if (typeof uri === 'undefined') {
            if (vscode.window.activeTextEditor) {
                uri = vscode.window.activeTextEditor.document.uri;
            }
        }
        if (!uri) {
            vscode.window.showErrorMessage('Cannot create spec file. File must be open in editor.');
        }

        createTest(uri).then((testUri) => {
            vscode.window.showTextDocument(testUri);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
