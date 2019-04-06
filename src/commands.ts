import * as vscode from 'vscode';
import * as child_process from 'child_process';

export async function runOnActiveDocument(outputChannel: vscode.OutputChannel) {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        const uri = await window.showOpenDialog({
            openLabel: 'Select Retina Script',
            canSelectMany: false,
            filters: {
                'Retina scripts': ['ret'],
                'All File Types': ['*']
            }
        });
        
        if (!uri) {
            return;
        }
        const scriptPath = uri[0].fsPath;

        let result: string;
        try {
            result = await retinate(scriptPath, editor.document.getText());
        } catch ({ message, log }) {
            window.showErrorMessage(message);
            outputChannel.appendLine(log);
            return;
        }
        
        let success;
        try {
            success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                const invalidRange = new vscode.Range(
                    0, 0,
                    editor.document.lineCount /*intentionally missing the '-1' */, 0);
                const fullRange = editor.document.validateRange(invalidRange);
                editBuilder.replace(fullRange, result);
            });
        } catch (error) {
            window.showErrorMessage(error.message);
            return;
        }
           
        if (!success) {
            window.showErrorMessage('Changes could not be applied to document.');
        }
    } else {
        window.showWarningMessage('No active document.');
    }
}

export async function runOnSelection(outputChannel: vscode.OutputChannel) {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        const uri = await window.showOpenDialog({
            openLabel: 'Select Retina Script',
            canSelectMany: false,
            filters: {
                'Retina scripts': ['ret'],
                'All File Types': ['*']
            }
        });
        
        if (!uri) {
            return;
        }
        const scriptPath = uri[0].fsPath;

        const retinateResults: {selection: vscode.Selection, result: string}[] = [];

        for (const selection of editor.selections) {
            const selectedText = editor.document.getText(selection);
            
            try {
                const result = await retinate(scriptPath, selectedText);
                retinateResults.push({
                    "selection": selection,
                    "result": result
                });
            } catch ({ message, log }) {
                window.showErrorMessage(message);
                const from = `${selection.start.line+1}:${selection.start.character+1}`;
                const to = `${selection.end.line+1}:${selection.end.character+1}`;
                outputChannel.appendLine(`Failed to process selection from line ${from} to line ${to}:`);
                outputChannel.appendLine(`${selectedText}\n`);
                outputChannel.appendLine(log);
                return;
            }
        }
        
        let success;
        try {
            success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                for (const {selection, result} of retinateResults) {
                    editBuilder.replace(selection, result);
                }
            });
        } catch (error) {
            window.showErrorMessage(error.message);
            return;
        }
        
        if (!success) {
            window.showErrorMessage('Changes could not be applied to document.');
        }
    } else {
        window.showWarningMessage('No active document.');
    }
}

function retinate(scriptPath: string, input: string): Thenable<string> {
    const config = vscode.workspace.getConfiguration('retinate');
    const timeout = config.get('timeout', 3);
    const maxBufferSize = config.get('maxOutputSize', 200 * 1024);
    const retinaPath = config.get('retinaPath', 'retina');

    const promise = new Promise<string>((resolve, reject) => {
        const retinaProcess = child_process.execFile(
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