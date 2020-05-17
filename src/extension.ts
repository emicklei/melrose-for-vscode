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
const playDecorationType = vscode.window.createTextEditorDecorationType({
	dark: {
		backgroundColor: { id: 'melrose.playBackground' }
	}
});
// https://code.visualstudio.com/api/references/vscode-api#window.createOutputChannel
const melroseOutput = vscode.window.createOutputChannel("Melrōse");

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "melrose-for-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('melrose-for-vscode.eval', () => {
		evalWithAction('');
	});
	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('melrose-for-vscode.evalAndPlay', () => {
		evalWithAction('play');
	});
	context.subscriptions.push(disposable2);

	let disposable3 = vscode.commands.registerCommand('melrose-for-vscode.evalAndEnd', () => {
		evalWithAction('end');
	});
	context.subscriptions.push(disposable3);

	let disposable4 = vscode.commands.registerCommand('melrose-for-vscode.evalAndBegin', () => {
		evalWithAction('begin');
	});
	context.subscriptions.push(disposable4);

	let disposable5 = vscode.commands.registerCommand('melrose-for-vscode.kill', () => {
		evalWithAction('kill');
	});
	context.subscriptions.push(disposable5);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function evalWithAction(action: string) {
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
		rangeExecuted.push({ range: new vscode.Range(selection.start, selection.end) });
	}
	if (text.length === 0) {
		// nothing to post
		return;
	}
	var success = true;
	var successResponseData: any = null;
	axios({
		method: 'post',
		url: 'http://localhost:8118/v1/statements?trace=false&action=' + action,
		data: text,
		headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
	}).then((response: AxiosResponse<any>) => {
		if (response.data !== null) {
			successResponseData = response.data;
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
	}).finally(() => {
		let isLoop = false;
		// TODO put this in separate func
		if (successResponseData !== null) {
			isLoop = successResponseData.type === '*melrose.Loop'; // TODO have better response			
			if (successResponseData.message !== undefined) {
				melroseOutput.appendLine(successResponseData.message);
				if (successResponseData.object !== undefined) {
					if (Object.keys(successResponseData.object).length > 0) {
						console.log(successResponseData.object);
					}
				} else {
					melroseOutput.appendLine('nil');
				}
			}
		}
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			// not in editor
			return;
		}
		if (success) {
			if (action === 'begin' || isLoop) {
				addBreakpointOnSelectionLine();
			}
			if (action === 'end') {
				removeBreakpointOnSelectionLine();
			}
			if (action === 'play' || action === 'begin') {
				activeEditor.setDecorations(playDecorationType, rangeExecuted);
			} else {
				activeEditor.setDecorations(executeOkDecorationType, rangeExecuted);
			}
		} else {
			activeEditor.setDecorations(executeFailDecorationType, rangeExecuted);
		}
		// clean up a bit later
		setTimeout(() => {
			let activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				// not in editor
				return;
			}
			activeEditor.setDecorations(executeOkDecorationType, []);
			activeEditor.setDecorations(playDecorationType, []);
			activeEditor.setDecorations(executeFailDecorationType, []);
		}, 200);
	});
}

function addBreakpointOnSelectionLine() {
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		// not in editor
		return;
	}
	let document = activeEditor.document;
	let selections = activeEditor.selections;
	const bps: vscode.Breakpoint[] = [];
	bps.push(new vscode.SourceBreakpoint(new vscode.Location(document.uri, new vscode.Position(selections[0].end.line, 0))));
	vscode.debug.addBreakpoints(bps);
}

function removeBreakpointOnSelectionLine() {
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		// not in editor
		return;
	}
	let selections = activeEditor.selections;
	for (let each of vscode.debug.breakpoints) {
		if ((each as vscode.SourceBreakpoint).location.range.start.line === selections[0].end.line) {
			const bps: vscode.Breakpoint[] = [];
			bps.push(each);
			vscode.debug.removeBreakpoints(bps);
			// could be more on the same line so do not break the loop
		}
	}
}