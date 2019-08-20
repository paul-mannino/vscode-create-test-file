import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionConfiguration } from './extensionConfiguration';

export function createTest(srcUri: vscode.Uri): Thenable<vscode.Uri> {
    return inferTestUri(srcUri).then(uri => {
        let we = new vscode.WorkspaceEdit();
        we.createFile(uri, { overwrite: false });
        return vscode.workspace.applyEdit(we).then((success) => {
            if (success) {
                let relPath = vscode.workspace.asRelativePath(uri);
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
    let ext = path.extname(srcPath);
    let file = path.basename(srcPath, ext);
    let dir = path.dirname(srcPath);
    if (typeof pathMap !== 'undefined') {
        dir = destPath(dir, pathMap);
    }
    let testBasename = nameTemplate.replace('{filename}', file) + ext;
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
    let matcher = new RegExp(pathMap.pathPattern);
    let match = srcPath.match(matcher);
    if (!match) {
        throw new Error('pathMap does not match provided path');
    }

    let pathSegments = srcPath.split(match[0]);

    let destPattern = pathMap.testFilePath;
    for (let i = 1; i < match.length; i++) {
        let replaceText = match[i];
        if (typeof replaceText === 'undefined') {
            replaceText = "";
        }
        destPattern = destPattern.replace(`\$${1}`, replaceText);
    }

    pathSegments.splice(1, 0, destPattern);
    return pathSegments.join('');
}

function matchingPathMap(srcUri: vscode.Uri, settings: ExtensionConfiguration): PathMap | undefined {
    let relativePath = vscode.workspace.asRelativePath(srcUri);
    let pathMaps = settings.get('pathMaps') as Array<PathMap>;
    for (let pathMap of pathMaps) {
        let matcher = new RegExp(pathMap.pathPattern);
        if (relativePath.match(matcher)) {
            return pathMap;
        }
    }
    return undefined;
}

function getExtensionSettings(srcUri: vscode.Uri): Thenable<ExtensionConfiguration> {
    return vscode.workspace.openTextDocument(srcUri).then((doc: vscode.TextDocument) => {
        let docLang = doc.languageId;
        let langSettings =  vscode.workspace.getConfiguration('createTestFile.languages');
        let langMatcher = new RegExp(`\\[${docLang}\\]`);
        let docLangKey = Object.keys(langSettings).find((key: string) => key.match(langMatcher));
        let langConfig = {};
        if (docLangKey) {
            langConfig = langSettings[docLangKey];
        }
        let generalConfig = vscode.workspace.getConfiguration('createTestFile');
        return new ExtensionConfiguration(langConfig, generalConfig);
    });
}
