import * as vscode from 'vscode';

export function exampleBalloon() {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    window.showInformationMessage(editor ? editor.document.getText() : 'Computer says "no".');
}
