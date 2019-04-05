import * as vscode from 'vscode';
import { exampleBalloon } from './commands';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('retina.helloWorld', () => {
		exampleBalloon();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
