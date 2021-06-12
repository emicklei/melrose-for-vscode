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

// const evalOutput = vscode.window.createOutputChannel("Melrōse");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "melrose-for-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('melrose-for-vscode.eval', () => {
		evalWithAction('eval');
	});
	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('melrose-for-vscode.evalAndPlay', () => {
		evalWithAction('play');
	});
	context.subscriptions.push(disposable2);

	let disposable3 = vscode.commands.registerCommand('melrose-for-vscode.evalAndStop', () => {
		evalWithAction('stop');
	});
	context.subscriptions.push(disposable3);

	let disposable5 = vscode.commands.registerCommand('melrose-for-vscode.kill', () => {
		evalWithAction('kill');
	});
	context.subscriptions.push(disposable5);

	let disposable6 = vscode.commands.registerCommand('melrose-for-vscode.evalAndInspect', () => {
		evalWithAction('inspect');
	});
	context.subscriptions.push(disposable6);

	let disposable8 = vscode.languages.registerHoverProvider(
		{ scheme: 'file', language: 'melrose' }, {
		provideHover: async (doc: vscode.TextDocument, pos: vscode.Position): Promise<vscode.Hover> => {
			//console.log("hover request");
			let range = doc.getWordRangeAtPosition(pos);			
			let token = doc.getText(range);
			// sometimes the range represents the full content; it will never match
			if (!range?.isSingleLine) {
				return new vscode.Hover('');
			}
			let response = await axios({
				method: 'post',
				url: 'http://localhost:8118/v1/inspect?debug=false',
				data: {
					token: token
				},
				headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
			});
			if (!response || !response.data || !response.data.MarkdownString) {
				console.error("hover fail", response);
				return new vscode.Hover('');
			}
			// console.log("hover data", response.data.MarkdownString);
			let ms = new vscode.MarkdownString(response.data.MarkdownString);
			ms.isTrusted = true;
			return new vscode.Hover(ms, range);
		}
	});
	context.subscriptions.push(disposable8);

	vscode.debug.onDidChangeBreakpoints(e => {
		//console.log(`Event: a: ${e.added.length} r: ${e.removed.length} c: ${e.changed.length}`);
		//if (e.added.length) { console.log('added: ', JSON.stringify(e.added)); }
		if (e.removed.length) {
			let activeEditor = vscode.window.activeTextEditor;
			if (!activeEditor) {
				// not in editor
				return;
			}
			for (let each of e.removed) {
				let srcpb = each as vscode.SourceBreakpoint;
				let text = activeEditor.document.lineAt(srcpb.location.range.start).text;
				//console.log('removed: ', JSON.stringify(e.removed));
				//console.log('ending: ', text);
				let rangeExecuted: vscode.DecorationOptions[] = [];
				rangeExecuted.push({ range: new vscode.Range(srcpb.location.range.start, srcpb.location.range.end) });
				sendActionWithText("stop", srcpb.location.range.start.line, text, rangeExecuted);
			}
		}
		//if (e.changed.length) { console.log('changed: ', JSON.stringify(e.changed)); }
		//console.log('breakpoints after event: ', JSON.stringify(vscode.debug.breakpoints));
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }

function evalWithAction(action: string) {
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		// not in editor
		return;
	}
	if (activeEditor.document.languageId !== "melrose") {
		// not a Melrose file
		console.log("not a Melrōse script");
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
	sendActionWithText(action, selection.end.line, text, rangeExecuted);
}

function sendActionWithText(action: string, line: number, text: string, rangeExecuted: vscode.DecorationOptions[]) {
	var success = true;
	var successResponseData: any = null;
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		// not in editor
		return;
	}
	axios({
		method: 'post',
		url: 'http://localhost:8118/v1/statements?debug=false&line=' + (line + 1) + '&action=' + action + '&file=' + activeEditor.document.fileName, // line is zero-based
		data: text,
		headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
	}).then((response: AxiosResponse<any>) => {
		if (response.data !== null) {
			successResponseData = response.data;
		}
	}).catch((err: AxiosError<any>) => {
		success = false;
		if (err.response !== undefined) {
			vscode.window.showWarningMessage(err.response.data.message);
			console.error(err.response.data);
		} else {
			vscode.window.showInformationMessage("No response from Melrōse; did you start it?");
			console.error(err);
		}
	}).finally(() => {
		let isStoppable = false;
		// TODO put this in separate func
		if (successResponseData !== null) {
			isStoppable = successResponseData.stoppable === true; // TODO have better response			
			if (successResponseData.message !== undefined) {
				// debug info				
				if (successResponseData.object !== undefined && successResponseData.object !== null) {
					if (Object.keys(successResponseData.object).length > 0) {
						console.log(successResponseData.object);
					}
				}
			}
		}
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			// not in editor
			return;
		}
		if (success) {
			if (action === 'inspect') {
				console.log(successResponseData);
				if (successResponseData.object !== undefined && successResponseData.object !== null) {
					if (Object.keys(successResponseData.object).length > 0) {
						console.log(successResponseData.object);
					}
				}

			}
			if (action === 'stop') {
				// TODO could come from breakpoint remove ; this cause duplicate send message
				removeBreakpointOnSelectionLine();
			}
			if (action === 'kill') {
				removeAllBreakpoints();
			}
			if (action === 'play') {
				activeEditor.setDecorations(playDecorationType, rangeExecuted);
				if (isStoppable) {
					addBreakpointOnSelectionLine();
				}
			}
			if (action === 'eval') {
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

function removeAllBreakpoints() {
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		// not in editor
		return;
	}
	for (let each of vscode.debug.breakpoints) {
		const bps: vscode.Breakpoint[] = [];
		bps.push(each);
		vscode.debug.removeBreakpoints(bps);
	}
}