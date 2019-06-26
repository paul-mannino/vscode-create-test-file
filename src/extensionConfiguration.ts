import * as vscode from 'vscode';

interface IConfig {
    [key: string]: any;
}

const DEFAULT_CONFIG: IConfig = {
    nameTemplate: '{filename}_spec',
    locationMaps: []
}

export class ExtensionConfiguration {
    languageConfiguration: any;
    generalConfiguration: vscode.WorkspaceConfiguration;

    constructor(languageConfiguration: any, generalConfiguration: vscode.WorkspaceConfiguration) {
        this.languageConfiguration = languageConfiguration;
        this.generalConfiguration = generalConfiguration;
    }

    get(key: string): any {
        let value = this.languageConfiguration[`createTestFile.${key}`];
        if (value !== undefined) {
            return value;
        }
        let defaultValue = DEFAULT_CONFIG[key];

        return this.generalConfiguration.get(key, defaultValue);
    }
}