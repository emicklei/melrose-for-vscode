// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// https://www.npmjs.com/package/axios
// https://github.com/axios/axios
import {
	AxiosResponse,
	AxiosError
} from 'axios';
const axios = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "melrose-for-vscode" is now active!');

	const executeOkDecorationType = vscode.window.createTextEditorDecorationType({
		dark: {
			backgroundColor: { id: 'melrose.executedBackground' }
		}
	});
	const executeFailDecorationType = vscode.window.createTextEditorDecorationType({
		dark: {
			backgroundColor: { id: 'melrose.executeFailBackground' }
		}
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('melrose-for-vscode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			// not in editor
			return;
		}
		// if text is selection then use that
		// else use the line at which the cursor is at
		let text = '';
		let rangeExecuted: vscode.DecorationOptions[] = [];
		let selection = activeEditor.selection;
		if (selection.isEmpty) {
			// no selection, take current line content
			text = activeEditor.document.lineAt(selection.active.line).text;
			const position = activeEditor.selection.active;
			const startPos = position.with(position.line, 0);
			const endPos = position.with(position.line, text.length);
			rangeExecuted.push({ range: new vscode.Range(startPos, endPos) });
		} else {
			text = activeEditor.document.getText(selection);
		}
		if (text.length === 0) {
			// nothing to post
			return;
		}
		var success = true;
		axios({
			method: 'post',
			url: 'http://localhost:8118/v1/statements',  // ?trace=true
			data: text,
			headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
		}).then((response: AxiosResponse<any>) => {
			if (response.data !== null) {
				console.log(response.data);
			}
		}).catch((err: AxiosError<any>) => {
			success = false;
			if (err.response !== undefined) {
				console.error(err.response.data.message);
				console.error(err.response.data);
			} else {
				vscode.window.showInformationMessage("No response from Melrose; did you start it?");
				console.error(err);
			}
		});
		// finally
		if (success) {
			activeEditor.setDecorations(executeOkDecorationType, rangeExecuted);
		} else {
			console.log('set fail deco');
			activeEditor.setDecorations(executeFailDecorationType, rangeExecuted);
		}
		// clean up a bit later
		setTimeout(() => {
			let activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				// not in editor
			} else {
				activeEditor.setDecorations(executeOkDecorationType, []);
				activeEditor.setDecorations(executeFailDecorationType, []);
			}
		}, 1000);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
