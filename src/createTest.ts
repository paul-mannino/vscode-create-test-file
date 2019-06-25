import * as vscode from 'vscode';
import * as path from 'path';

export function createTest(srcUri: vscode.Uri): Thenable<vscode.Uri> {
    return getExtensionSettings(srcUri).then((settings: ExtensionConfiguration) => {
        const nameTemplate = settings.get('nameTemplate');
        let pathMapper = (srcPath: string): string => srcPath.replace('/app', '/spec');
        let uri = srcUri.with({ path: testPath(srcUri.path, nameTemplate, pathMapper) });
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

type PathMapper = (srcPath: string) => string;

export function testPath(srcPath: string, 
                         nameTemplate: string, 
                         pathMapper?: PathMapper): string {
    let ext = path.extname(srcPath);
    let file = path.basename(srcPath, ext);
    let dir = path.dirname(srcPath);
    if (typeof pathMapper !== 'undefined') {
        dir = pathMapper(dir);
    }
    let testBasename = nameTemplate.replace('{filename}', file) + ext;
    return path.posix.join(dir, testBasename);
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

class ExtensionConfiguration {
    languageConfiguration: any;
    generalConfiguration: vscode.WorkspaceConfiguration;

    constructor(languageConfiguration: any, generalConfiguration: vscode.WorkspaceConfiguration) {
        this.languageConfiguration = languageConfiguration;
        this.generalConfiguration = generalConfiguration;
    }

    get(key: string, defaultValue?: any): any {
        let value = this.languageConfiguration[`createTestFile.${key}`];
        if (value !== undefined) {
            return value;
        }
        return this.generalConfiguration.get(key, defaultValue);
    }
}