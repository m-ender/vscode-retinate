import * as vscode from 'vscode';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('retina.helloWorld', () => {
		child_process.exec(
			`retina D:/Development/Repositories/retina/Examples/hello-world.ret`,
			(_error, stdout, _stderr) => {
				const window = vscode.window;
				window.showInformationMessage(stdout);
			}
		);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
