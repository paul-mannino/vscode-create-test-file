import * as vscode from 'vscode';
import { findTestCommand, createTestCommand } from './commands';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(createTestCommand());
    context.subscriptions.push(findTestCommand());
}

export function deactivate() {}
