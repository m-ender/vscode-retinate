import * as vscode from 'vscode';
import { runFileOnActiveDocument, runFileOnSelection } from './commands';

function registerCommand(context: vscode.ExtensionContext, name: string, callback: (...args: any[]) => any) {
	context.subscriptions.push(vscode.commands.registerCommand(name, callback));
}

export function activate(context: vscode.ExtensionContext) {
	const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('Retina');
	
	registerCommand(context, 'retinate.runFileOnActiveDocument', () => runFileOnActiveDocument(outputChannel));
	registerCommand(context, 'retinate.runFileOnSelection', () => runFileOnSelection(outputChannel));	
}

export function deactivate() { }
