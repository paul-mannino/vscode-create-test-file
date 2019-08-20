import * as vscode from 'vscode';
import { createTest, findTest } from './createTest';

const NO_URI_ERROR = (action: string): string => {
    return `Cannot ${action} spec file. File must be open in editor or selected in file explorer.`
}

export function createTestCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('extension.createTestFile', (uri) => {
        let srcUri = ensureUri(uri);

        if (!srcUri) {
            vscode.window.showErrorMessage(NO_URI_ERROR('create'));
        }

        createTest(srcUri).then((testUri) => {
            vscode.window.showTextDocument(testUri);
        });
    });
}

export function findTestCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('extension.findTestFile', (uri) => {
        let srcUri = ensureUri(uri);

        if (srcUri) {
            findTest(srcUri).then(
                testDocument => vscode.window.showTextDocument(testDocument),
                _ex => vscode.window.showErrorMessage(`Unable to find test file matching ${srcUri.path}.`)
            );
        } else {
            vscode.window.showErrorMessage(NO_URI_ERROR('find'));
        }
    });
}

function ensureUri(uri: any): any {
    if (typeof uri === 'undefined') {
        if (vscode.window.activeTextEditor) {
            uri = vscode.window.activeTextEditor.document.uri;
        }
    }
    return uri;
}
