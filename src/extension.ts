'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
//import * as commands from './commands';

export interface FileData {
    label: string;
    name: string;
    path: string;
    isFile: boolean;
    isDirectory: boolean;
}

let cwd: string = '';

export function checkError(err: NodeJS.ErrnoException): boolean {
    if (err) {
        vscode.window.showErrorMessage(err.message);
    }

    return !!err;
}

export function showFileList(dir?: string): void {
    dir = dir || cwd;

    if (!dir) { return; }

    try {
        const stats: fs.Stats = fs.lstatSync(dir);

        if (!stats.isDirectory()) { return; }
    } catch (err) {
        checkError(err);

        return;
    }

    cwd = dir;

    fs.readdir(cwd, (err, results) => {
        if (checkError(err)) { return; }

        // Build a lookup table
        const files: FileData[] = results.reduce((arr, file) => {
            try {
                const fullPath: string = path.join(cwd, file);
                const stats: fs.Stats = fs.lstatSync(fullPath);
                const isFile = stats.isFile();
                const isDirectory = stats.isDirectory();

                if (isFile || isDirectory) {
                    arr.push({
                        label: file,
                        name: file,
                        path: fullPath,
                        isFile,
                        isDirectory,
                    });
                }
            } catch (err) { }

            return arr;
        }, []);

        //const cmdData = { cwd, files };
        //const options: string[] = commands.getList('top', cmdData).concat(
        //    files.map(file => file.label),
        //    commands.getList('bottom', cmdData)
        //);

        const options: string[] = files.map(file => file.label);

        vscode.window.showQuickPick(options).then(label => {
            if (!label) { return; }

            const file: FileData = files.find(file => file.label === label);

            // If a command is being run then don't show the default list of files and folders
            //if (commands.handle(label, cmdData)) { return; }

            if (file.isDirectory) {
                showFileList(file.path);
            } else if (file.isFile) {
                vscode.workspace.openTextDocument(file.path).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "special-open-file" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('specialOpenFile');
        const folders: string[] = config.get('folders', '').split('|');
        const ff = config.get('folders', '');

        showFileList("c:\\dropbox\\info");

        // Display a message box to the user
        //vscode.window.showInformationMessage(ff);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}