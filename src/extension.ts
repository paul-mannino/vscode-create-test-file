import * as vscode from 'vscode';
import { findTestFileCommand, createTestFileCommand } from './commands';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(createTestFileCommand());
    context.subscriptions.push(findTestFileCommand());
}
