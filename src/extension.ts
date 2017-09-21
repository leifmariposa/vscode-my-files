import * as vscode from 'vscode';
import * as fs from 'fs';

function compare(a, b) {
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

var walk = function(dir) {
    console.log(dir);
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        var path = dir + '/' + file;
        var stat = fs.statSync(path);
        if (stat && stat.isDirectory())
            results = results.concat(walk(path));
        else
            results.push({ label: file, description: path });
    })
    return results
}

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.myFiles', () => {

        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('myFiles');
        const folders: string[] = config.get('folders', '').split('|');

        var files = [];
        folders.forEach(function(dir) {
            files = files.concat(walk(dir));
        });

        files.sort(compare);

        vscode.window.showQuickPick(files).then(file => {
            if (file) {
                vscode.workspace.openTextDocument(file.description).then(document=> {
                    vscode.window.showTextDocument(document);
                });
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}
