import * as vscode from 'vscode';
import * as child_process from 'child_process';

export function runOnActiveDocument(outputChannel: vscode.OutputChannel) {
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
                (error, stdout, stderr) => {
                    if (error) {
                        window.showErrorMessage(`Retina failed to run with error code ${error.code}. See output window for details.`);
                        outputChannel.appendLine(stderr);
                        return;
                    }

                    editor.edit((editBuilder: vscode.TextEditorEdit) => {
                        let invalidRange = new vscode.Range(
                            0, 0,
                            editor.document.lineCount /*intentionally missing the '-1' */, 0);
                        let fullRange = editor.document.validateRange(invalidRange);
                        editBuilder.replace(fullRange, stdout);
                    }).then(success => {
                        if (!success) {
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