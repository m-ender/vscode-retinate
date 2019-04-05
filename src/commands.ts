import * as vscode from 'vscode';
import * as child_process from 'child_process';


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
            filters: {
                'Retina scripts': ['ret'],
                'All File Types': ['*']
            }
        }).then(uri => {
            if (uri) {
                const path = uri[0].fsPath;
                window.showInformationMessage(path);
            }

            // TODO: use selected file
            let process = child_process.exec(
                `retina "D:/Development/Repositories/retina/Examples/matrix-conversion.ret"`,
                (_error, stdout, _stderr) => {
                    const window = vscode.window;
                    window.showInformationMessage(stdout);
                }
            );
            process.stdin.write(editor.document.getText());
            process.stdin.end();
        });
    } else {
        window.showWarningMessage('No active document.');
    }
}