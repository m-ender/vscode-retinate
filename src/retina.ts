import * as vscode from 'vscode';
import { runOnActiveDocument } from './commands';

function registerCommand(context: vscode.ExtensionContext, name: string, callback: (...args: any[]) => any) {
	context.subscriptions.push(vscode.commands.registerCommand(name, callback));
}

export function activate(context: vscode.ExtensionContext) {
	const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('Retina');
	
	registerCommand(context, 'retina.runOnActiveDocument', () => runOnActiveDocument(outputChannel));
}

export function deactivate() { }
