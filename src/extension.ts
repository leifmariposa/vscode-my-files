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

function getFileName(file: string): string {
    var forwardSlash = file.lastIndexOf("/");
    var backSlash = file.lastIndexOf("\\");
    if (forwardSlash === -1 && backSlash === -1) {
        return file;
    }

    return file.substring((forwardSlash > backSlash) ? forwardSlash + 1 : backSlash + 1);
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

        var displayFiles = files.map(file => {
            return { description: file.path, label: file.label, filePath: file.path }
        });

        vscode.window.showQuickPick(displayFiles ).then(displayFile => {
            vscode.workspace.openTextDocument(displayFile.filePath).then(document=> {
                vscode.window.showTextDocument(document);
            });
        });
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {

        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('specialOpenFile');
        const folders: string[] = config.get('folders', '').split('|');
        //const ff = config.get('folders', '');

        showFileList("c:\\dropbox\\info");
        //folders.forEach(folder => {
        //}


        // Display a message box to the user
        //vscode.window.showInformationMessage(ff);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}