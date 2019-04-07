# Retinate

[![Build Status](https://dev.azure.com/m-ender/Retinate/_apis/build/status/m-ender.vscode-retinate?branchName=master)](https://dev.azure.com/m-ender/Retinate/_build/latest?definitionId=1&branchName=master)
[![Release](https://img.shields.io/github/release/m-ender/vscode-retinate.svg)](https://github.com/m-ender/vscode-retinate/releases)

Retinate lets you transform text documents with the [Retina](https://github.com/m-ender/retina) programming language. It is intended for situations where VS Code's built-in *Search and Replace* is not powerful enough.

## Getting Started

1. Get [Retina](https://github.com/m-ender/retina), which requires [.NET Core 2.2](https://dotnet.microsoft.com/download/dotnet-core).
2. Install Retinate.
3. Change the `retinate.retinaPath` setting to point to the Retina executable. Alternatively, add Retina to your PATH.
4. Start using Retinate!

## Commands

Retinate adds a few commands to VS Code, which can be accessed via the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>; or <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Mac).

- **Run File on Active Document**: Asks you to pick a Retina script in your file system and runs that script on the currently opened document.
- **Run File on Selection**: Asks you to pick a Retina script in your file system and runs the script on each selection in the currently opened document. If this fails for any selection, none of them will be replaced.
- **Run on Visible Editor**: If your view is split into multiple editors, this lets you run the currently active document as a Retina script on one of the other visible documents.
- **Run on Selection in Visible Editor**: If your view is split into multiple editors, this lets you run the currently active document as a Retina script on each selection in one of the other visible documents. If this fails for any selection, none of them will be replaced.

As an example, the intended workflow of the last command goes something like this:

- Select the parts of the documents that you want to process with Retina.
- Each open a new split or switch the focus to an already opened split.
- Create a new file there.
- Write the Retina script to process your selections.
- Trigger the *Run on Selection in Visible Editor* command.
- Discard the Retina script (unless you want to reuse, in which case you can save it to disk or just leave it open).

## Settings

Retinate comes with a few settings:

| Settings key           | Description                                                                         | Default  | type   |
|------------------------|-------------------------------------------------------------------------------------|----------|--------|
| retinate.retinaPath    | Path to your Retina executable. Leave as `Retina` if Retina is on your system PATH. | "Retina" | string |
| retinate.timeout       | Time before Retinate kills any Retina process, in seconds.                          | 3        | number |
| retinate.maxOutputSize | Maximum number of bytes that any one invocation of Retina is allowed to return      | 204800   | number |
