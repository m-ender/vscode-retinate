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

            retinate(scriptPath, editor.document.getText()).then(
                (result) => {
                    editor.edit((editBuilder: vscode.TextEditorEdit) => {
                        let invalidRange = new vscode.Range(
                            0, 0,
                            editor.document.lineCount /*intentionally missing the '-1' */, 0);
                        let fullRange = editor.document.validateRange(invalidRange);
                        editBuilder.replace(fullRange, result);
                    }).then(success => {
                        if (!success) {
                            window.showErrorMessage('It borken');
                        }
                    });
                },
                ({ message, log }) => {
                    window.showErrorMessage(message);
                    outputChannel.appendLine(log);
                }
            );
        });
    } else {
        window.showWarningMessage('No active document.');
    }
}

function retinate(scriptPath: string, input: string): Thenable<string> {
    const config = vscode.workspace.getConfiguration('retinate');
    const timeout = config.get('timeout', 3);
    const maxBufferSize = config.get('maxOutputSize', 200 * 1024);
    const retinaPath = config.get('retinaPath', 'retina');

    let promise = new Promise<string>((resolve, reject) => {
        let retinaProcess = child_process.execFile(
            retinaPath,
            [scriptPath],
            {
                "timeout": timeout * 1000,
                "maxBuffer": maxBufferSize,
                "killSignal": "SIGKILL"
            },
            (error: child_process.ExecException | null, stdout) => {
                if (error) {
                    if (!error.code && error.signal === 'SIGKILL') {
                        const msg = 'Retina aborted due to timeout.';
                        reject({
                            'message': msg,
                            'log': `${msg}\nRetina's output started with:\n${stdout.substr(0, 1024)}`
                        });
                        // @ts-ignore
                    } else if (error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
                        const msg = 'Retina aborted due to exceeding maximum output size.';
                        reject({
                            'message': msg,
                            'log': `${msg}\nRetina's output started with:\n${stdout.substr(0, 1024)}`
                        });
                    } else {
                        reject({
                            'message': `Retina failed to run with error code ${error.code}. See output window for details.`,
                            'log': error.message
                        });
                    }
                } else {
                    resolve(stdout);
                }
            }
        );

        retinaProcess.stdin.write(input);
        retinaProcess.stdin.end();
    });

    return promise;
}