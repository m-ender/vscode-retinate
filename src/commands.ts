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
            if (!uri) {
                return;
            }
            const path = uri[0].fsPath;

            let process = child_process.exec(
                `retina "${path}"`,
                (_error, stdout, _stderr) => {
                    editor.edit((editBuilder: vscode.TextEditorEdit) => {
                        let invalidRange = new vscode.Range(
                            0, 0, 
                            editor.document.lineCount /*intentionally missing the '-1' */, 0);
                        let fullRange = editor.document.validateRange(invalidRange);
                        editBuilder.replace(fullRange, stdout);
                    }).then(success => {
                        if (!success)
                        {
                            window.showErrorMessage('It borken');
                        }
                    });
                }
            );

            process.stdin.write(editor.document.getText());
            process.stdin.end();
        });
    } else {
        window.showWarningMessage('No active document.');
    }
}