import * as vscode from 'vscode';
import { exampleBalloon } from './balloon';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		exampleBalloon();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
