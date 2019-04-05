import * as vscode from 'vscode';
import { exampleBalloon, runOnActiveDocument } from './commands';

function registerCommand(context: vscode.ExtensionContext, name: string, callback: (...args: any[]) => any) {
	context.subscriptions.push(vscode.commands.registerCommand(name, callback));
}

export function activate(context: vscode.ExtensionContext) {
	registerCommand(context, 'retina.helloWorld', exampleBalloon);
	registerCommand(context, 'retina.runOnActiveDocument', runOnActiveDocument);
}

export function deactivate() { }
