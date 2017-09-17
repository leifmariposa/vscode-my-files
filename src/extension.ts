import * as vscode from 'vscode';
import * as promise from 'promise';
import * as fs from 'fs';
import * as path from 'path';

export interface FileData {
    label: string;
    name: string;
    path: string;
    isFile: boolean;
    isDirectory: boolean;
}

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const labelA = a.label.toUpperCase();
    const labelB = b.label.toUpperCase();

    let comparison = 0;
    if (labelA > labelB) {
      comparison = 1;
    } else if (labelA < labelB) {
      comparison = -1;
    }
    return comparison;
}

function readdirAsync(path) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.map(file => {
                    return { desc: path, name: file };
                }));
            }
        });
    });
}

function readDirs(dirs) {
    var promises = [];

    dirs.forEach(function(dir) {
        console.log(dir);
        promises.push(readdirAsync(dir));
    });
    return Promise.all(promises);
}

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {

        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('specialOpenFile');
        const folders: string[] = config.get('folders', '').split('|');

        var promises = [];

        folders.forEach(function(dir) {
            console.log(dir);
            promises.push(readdirAsync(dir));
        });

        Promise.all(promises).then(results => {
            var arr = [];
            results.forEach(result => {
                result.forEach(file => {
                    //console.log(file.name);
                    try {
                        const fullPath: string = path.join(file.desc, file.name);
                        const stats: fs.Stats = fs.lstatSync(fullPath);
                        const isFile = stats.isFile();
                        const isDirectory = stats.isDirectory();

                        if (isFile || isDirectory) {
                            arr.push({
                                label: file.name,
                                name: file.name,
                                path: fullPath,
                                isFile,
                                isDirectory,
                            });
                        }
                    } catch (err) { }

                });
            });
            var displayFiles = arr.map(file => {
                return { description: file.path, label: file.label, filePath: file.path }
            });

            displayFiles.sort(compare);

            vscode.window.showQuickPick(displayFiles).then(displayFile => {
                vscode.workspace.openTextDocument(displayFile.filePath).then(document=> {
                    vscode.window.showTextDocument(document);
                });
            });
        });

        /*readDirs(folders).then(function(results) {
            // files are in the results array here

            results.forEach(result => {
                console.log(result.file);
            });
            // Build a lookup table
            const files: FileData[] = results.reduce((arr, file) => {
                try {
                    const fullPath: string = path.join(dir, file);
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

        }).catch(function(err) {
            // error here
        });*/
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

/*'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as path from 'path';
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require('fs'));

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

export function getFileList(dir?: string): FileData[] {
    try {
        const stats: fs.Stats = fs.lstatSync(dir);

        if (!stats.isDirectory()) { return; }
    } catch (err) {
        checkError(err);

        return;
    }

    fs.readdir(dir, (err, results) => {
        if (checkError(err)) { return; }

        // Build a lookup table
        const files: FileData[] = results.reduce((arr, file) => {
            try {
                const fullPath: string = path.join(dir, file);
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

        return files;
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {

        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('specialOpenFile');
        const folders: string[] = config.get('folders', '').split('|');
        //const ff = config.get('folders', '');

        var files = getFileList("c:\\dropbox\\info");

        var displayFiles = files.map(file => {
            return { description: file.path, label: file.label, filePath: file.path }
        });

        vscode.window.showQuickPick(displayFiles ).then(displayFile => {
            vscode.workspace.openTextDocument(displayFile.filePath).then(document=> {
                vscode.window.showTextDocument(document);
            });
        });

        //folders.forEach(folder => {
        //}


        // Display a message box to the user
        //vscode.window.showInformationMessage(ff);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}*/