import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionConfiguration } from './extensionConfiguration';

export function createTestFile(srcUri: vscode.Uri): Thenable<vscode.Uri> {
    return inferTestUri(srcUri).then(uri => {
        const we = new vscode.WorkspaceEdit();
        we.createFile(uri, { overwrite: false });
        return vscode.workspace.applyEdit(we).then((success) => {
            if (success) {
                const relPath = vscode.workspace.asRelativePath(uri);
                vscode.window.showInformationMessage(`Created ${relPath}`);
            }
            return uri;
        });
    });
}

export function findTest(srcUri: vscode.Uri): Thenable<vscode.TextDocument> {
    return inferTestUri(srcUri).then(uri => {
        return vscode.workspace.openTextDocument(uri);
    });
}

export function testPath(srcPath: string,
                         nameTemplate: string,
                         pathMap?: PathMap): string {
    const ext = path.extname(srcPath);
    const file = path.basename(srcPath, ext);
    let dir = path.dirname(srcPath);
    if (typeof pathMap !== 'undefined') {
        dir = destPath(dir, pathMap);
    }
    const testBasename = nameTemplate.replace('{filename}', file).replace('{extension}', ext);
    return path.posix.join(dir, testBasename);
}

function inferTestUri(srcUri: vscode.Uri): Thenable<vscode.Uri> {
    return getExtensionSettings(srcUri).then((settings: ExtensionConfiguration) => {
        const nameTemplate = settings.get('nameTemplate');
        const pathMapper = matchingPathMap(srcUri, settings);
        return srcUri.with({ path: testPath(srcUri.path, nameTemplate, pathMapper) });
    });
}

interface PathMap {
    pathPattern: string;
    testFilePath: string;
}

function destPath(srcPath: string, pathMap: PathMap): string {
    const matcher = new RegExp(pathMap.pathPattern);
    const match = srcPath.match(matcher);
    if (!match) {
        throw new Error('pathMap does not match provided path');
    }

    const pathSegments = srcPath.split(match[0]);

    let destPattern = pathMap.testFilePath;
    for (let i = 1; i < match.length; i++) {
        let replaceText = match[i];
        if (typeof replaceText === 'undefined') {
            replaceText = "";
        }
        destPattern = destPattern.replace(`$${1}`, replaceText);
    }

    pathSegments.splice(1, 0, destPattern);
    return pathSegments.join('');
}

function matchingPathMap(srcUri: vscode.Uri, settings: ExtensionConfiguration): PathMap | undefined {
    const relativePath = vscode.workspace.asRelativePath(srcUri);
    const pathMaps = settings.get('pathMaps') as PathMap[];
    for (const pathMap of pathMaps) {
        const matcher = new RegExp(pathMap.pathPattern);
        if (relativePath.match(matcher)) {
            return pathMap;
        }
    }
    return undefined;
}

function getExtensionSettings(srcUri: vscode.Uri): Thenable<ExtensionConfiguration> {
    return vscode.workspace.openTextDocument(srcUri).then((doc: vscode.TextDocument) => {
        const docLang = doc.languageId;
        const langSettings =  vscode.workspace.getConfiguration('createTestFile.languages');
        const langMatcher = new RegExp(`\\[${docLang}\\]`);
        const docLangKey = Object.keys(langSettings).find((key: string) => key.match(langMatcher));
        let langConfig = {};
        if (docLangKey) {
            langConfig = langSettings[docLangKey];
        }
        const generalConfig = vscode.workspace.getConfiguration('createTestFile');
        return new ExtensionConfiguration(langConfig, generalConfig);
    });
}
