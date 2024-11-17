import * as vscode from 'vscode';
import { createTestFile, findTest } from './createTestFile';

const NO_URI_ERROR = (action: string): string => {
    return `Cannot ${action} spec file. File must be open in editor or selected in file explorer.`
}

export function createTestFileCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('extension.createTestFile', (uri) => {
        const srcUri = ensureUri(uri);

        if (!srcUri) {
            vscode.window.showErrorMessage(NO_URI_ERROR('create'));
        }

        createTestFile(srcUri).then((testUri) => {
            vscode.window.showTextDocument(testUri);
        });
    });
}

export function findTestFileCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('extension.findTestFile', (uri) => {
        const srcUri = ensureUri(uri);

        if (srcUri) {
            findTest(srcUri).then(
                testDocument => vscode.window.showTextDocument(testDocument),
                () => vscode.window.showErrorMessage(`Unable to find test file matching ${srcUri.path}.`)
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
