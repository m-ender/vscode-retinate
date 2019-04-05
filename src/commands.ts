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
            const scriptPath = uri[0].fsPath;

            const config = vscode.workspace.getConfiguration('searchAndRetina');
            const timeout = config.get('timeout', 3);
            const maxBufferSize = config.get('maxOutputSize', 200*1024);
            const retinaPath = config.get('retinaPath', 'retina');

            let process = child_process.exec(
                `${retinaPath} "${scriptPath}"`,
                {
                    "timeout": timeout * 1000,
                    "maxBuffer": maxBufferSize
                },
                (error, stdout, stderr) => {
                    if (error) {
                        if (!error.code && error.signal === 'SIGTERM') {
                            const msg = 'Retina aborted due to timeout.';
                            window.showErrorMessage(msg);
                            outputChannel.appendLine(msg);
                            outputChannel.appendLine("Retina's output started with:");
                            outputChannel.appendLine(stdout.substr(0, 1024));
                        // @ts-ignore
                        } else if (error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
                            const msg = 'Retina aborted due to exceeding maximum output size.';
                            window.showErrorMessage(msg);
                            outputChannel.appendLine(msg);
                            outputChannel.appendLine("Retina's output started with:");
                            outputChannel.appendLine(stdout.substr(0, 1024));
                        } else {
                            window.showErrorMessage(`Retina failed to run with error code ${error.code}. See output window for details.`);
                            outputChannel.appendLine(error.message);
                            outputChannel.appendLine(stderr);
                        }
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