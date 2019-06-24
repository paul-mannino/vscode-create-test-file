import * as vscode from 'vscode';
import * as path from 'path';

export function createTest(srcUri: vscode.Uri): Thenable<vscode.Uri> {
    const nameTemplate = '{filename}_spec';
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
