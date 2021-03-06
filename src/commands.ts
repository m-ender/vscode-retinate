import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';

export async function runFileOnActiveDocument(outputChannel: vscode.OutputChannel) {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        const scriptPath = await openRetinaFileDialog();

        if (!scriptPath) {
            return;
        }

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

export async function runFileOnSelection(outputChannel: vscode.OutputChannel) {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        const scriptPath = await openRetinaFileDialog();

        if (!scriptPath) {
            return;
        }

        const retinateResults: { selection: vscode.Selection, result: string }[] = [];

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
                const from = `${selection.start.line + 1}:${selection.start.character + 1}`;
                const to = `${selection.end.line + 1}:${selection.end.character + 1}`;
                outputChannel.appendLine(`Failed to process selection from line ${from} to line ${to}:`);
                outputChannel.appendLine(`${selectedText}\n`);
                outputChannel.appendLine(log);
                return;
            }
        }

        let success;
        try {
            success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
                for (const { selection, result } of retinateResults) {
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

export async function runOnVisibleEditor(outputChannel: vscode.OutputChannel) {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        const targetEditor = await openEditorQuickPick();

        if (!targetEditor) {
            return;
        }

        let result: string;
        try {
            result = await retinateFromString(
                editor.document.getText(),
                targetEditor.document.getText());
        } catch ({ message, log }) {
            window.showErrorMessage(message);
            outputChannel.appendLine(log);
            return;
        }

        let success;
        try {
            success = await targetEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                const invalidRange = new vscode.Range(
                    0, 0,
                    targetEditor.document.lineCount /*intentionally missing the '-1' */, 0);
                const fullRange = targetEditor.document.validateRange(invalidRange);
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

export async function runOnSelectionInVisibleEditor(outputChannel: vscode.OutputChannel) {
    const window = vscode.window;
    const editor = window.activeTextEditor;
    if (editor) {
        const targetEditor = await openEditorQuickPick();

        if (!targetEditor) {
            return;
        }

        const scriptSource = editor.document.getText();

        const retinateResults: { selection: vscode.Selection, result: string }[] = [];

        for (const selection of targetEditor.selections) {
            const selectedText = targetEditor.document.getText(selection);

            try {
                const result = await retinateFromString(scriptSource, selectedText);
                retinateResults.push({
                    "selection": selection,
                    "result": result
                });
            } catch ({ message, log }) {
                window.showErrorMessage(message);
                const from = `${selection.start.line + 1}:${selection.start.character + 1}`;
                const to = `${selection.end.line + 1}:${selection.end.character + 1}`;
                outputChannel.appendLine(`Failed to process selection from line ${from} to line ${to}:`);
                outputChannel.appendLine(`${selectedText}\n`);
                outputChannel.appendLine(log);
                return;
            }
        }

        let success;
        try {
            success = await targetEditor.edit((editBuilder: vscode.TextEditorEdit) => {
                for (const { selection, result } of retinateResults) {
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

async function openRetinaFileDialog(): Promise<string | null> {
    const uri = await vscode.window.showOpenDialog({
        openLabel: 'Select Retina Script',
        canSelectMany: false,
        filters: {
            'Retina scripts': ['ret'],
            'All File Types': ['*']
        }
    });

    if (!uri) {
        return null;
    }

    return uri[0].fsPath;
}

async function openEditorQuickPick(): Promise<vscode.TextEditor | null> {
    interface EditorQuickPick extends vscode.QuickPickItem {
        editor: vscode.TextEditor;
    }

    const window = vscode.window;
    const otherTextEditors = window.visibleTextEditors.filter(
        (editor) => editor.viewColumn !== undefined
            && editor !== window.activeTextEditor);

    if (otherTextEditors.length === 0) {
        return null;
    }

    const pickedItem = await window.showQuickPick<EditorQuickPick>(
        otherTextEditors.map((editor) => ({
            "editor": editor,
            "label": path.basename(editor.document.fileName),
            "detail": editor.document.fileName
        })),
        {
            "matchOnDetail": true,
            "placeHolder": "Choose an open file to process"
        }
    );

    if (!pickedItem) {
        return null;
    }

    return pickedItem.editor;
}

export function retinateFromString(script: string, input: string): Thenable<string> {
    const fsWrite = promisify(fs.write);
    const fsClose = promisify(fs.close);
    const promise: Thenable<string> = new Promise((resolve, reject) => {
        tmp.file({
            "postfix": ".ret"
        },
            (err, path, fd, removeCallback) => {
                if (err) {
                    const msg = 'Unable to create temporary file.';
                    reject({
                        "message": msg,
                        "log": `${msg}\n${err.message}`
                    });
                    return;
                }

                fsWrite(fd, script)
                    .then(() => fsClose(fd))
                    .then(() => retinate(path, input))
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        if ('message' in err && 'log' in err) {
                            reject(err);
                        } else {
                            const msg = 'Unable to write to temporary file.';
                            reject({
                                "message": msg,
                                "log": `${msg}\n${err.message}`
                            });
                        }
                    })
                    .finally(removeCallback);
            });
    });

    return promise;
}

export function retinate(scriptPath: string, input: string): Thenable<string> {
    const config = vscode.workspace.getConfiguration('retinate');
    const timeout = config.get('timeout', 3);
    const maxBufferSize = config.get('maxOutputSize', 200 * 1024);
    const retinaPath = config.get('retinaPath', 'Retina');

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
                        // @ts-ignore
                    } else if (error.code === 'ENOENT') {
                        reject({
                            'message': 'Retina executable not found.',
                            'log': 'Retina executable not found. Make sure to set the correct path in the Retinate settings.'
                        });
                    } else {
                        reject({
                            'message': `Retina failed to run with error code [${error.code}]. See output window for details.`,
                            'log': error.message
                        });
                    }
                } else {
                    resolve(stdout);
                }
            }
        );

        if (retinaProcess.pid) {
            retinaProcess.stdin.write(input);
            retinaProcess.stdin.end();
        }
    });

    return promise;
}
