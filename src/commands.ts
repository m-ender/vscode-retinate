import * as vscode from 'vscode';

export function exampleBalloon() {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    window.showInformationMessage(editor ? editor.document.getText() : 'Computer says "no".');
}

export function runOnActiveDocument() {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        window.showOpenDialog({
            openLabel: 'Select Retina Script',
            canSelectMany: false,
        }).then(uri => {
            // TODO: execute Retina...
            window.showInformationMessage('' + uri);
        });
    } else {
        window.showWarningMessage('No active document.');
    }
}