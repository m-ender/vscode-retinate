import * as vscode from 'vscode';
import { runOnActiveDocument, runOnSelection } from './commands';

function registerCommand(context: vscode.ExtensionContext, name: string, callback: (...args: any[]) => any) {
	context.subscriptions.push(vscode.commands.registerCommand(name, callback));
}

export function activate(context: vscode.ExtensionContext) {
	const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('Retina');
	
	registerCommand(context, 'retinate.runOnActiveDocument', () => runOnActiveDocument(outputChannel));
	registerCommand(context, 'retinate.runOnSelection', () => runOnSelection(outputChannel));	
}

export function deactivate() { }
