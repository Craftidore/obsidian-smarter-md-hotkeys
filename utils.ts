import * as constant from "const"
import { Editor, EditorPosition } from "obsidian"
// Utility Functions TODO: export these to an `utils.ts`
//-------------------------------------------------------------------
export const startOffset = (editor: Editor) => editor.posToOffset(editor.getCursor("from"));
export const endOffset = (editor: Editor) => editor.posToOffset(editor.getCursor("to"));
export const noteLength = (editor: Editor) => editor.getValue().length;
export const offToPos = (editor: Editor, offset: number) => {
	// prevent error when at the start or beginning of document
	if (offset < 0) offset = 0;
	if (offset > noteLength(editor)) offset = noteLength(editor);
	return editor.offsetToPos(offset);
};
export function isOutsideSel (editor: Editor, bef:string, aft:string) {
	const so = startOffset(editor);
	const eo = endOffset(editor);

	if (so - bef.length < 0) return false; // beginning of the document
	if (eo - aft.length > noteLength(editor)) return false; // end of the document

	const charsBefore = editor.getRange(offToPos(editor, so - bef.length), offToPos(editor, so));
	const charsAfter = editor.getRange(offToPos(editor, eo), offToPos(editor, eo + aft.length));
	return charsBefore === bef && charsAfter === aft;
}

export const isMultiLineMarkup = (frontMarkup: string) => ["`", "%%", "<!--", "$"].includes(frontMarkup);
export const markupOutsideSel = (editor: Editor, frontMarkup: string, endMarkup: string) => isOutsideSel (editor, frontMarkup, endMarkup);
export function markupOutsideMultiline (editor: Editor, frontMarkup: string, endMarkup: string, anchor: EditorPosition, head: EditorPosition) {
	if (anchor.line === 0) return false;
	if (head.line === editor.lastLine()) return false;

	const prevLineContent = editor.getLine(anchor.line - 1);
	const followLineContent = editor.getLine(head.line + 1);
	return prevLineContent.startsWith(frontMarkup) && followLineContent.startsWith(endMarkup);
}

export const noSel = (editor: Editor) => !editor.somethingSelected();
export const multiLineSel = (editor: Editor) => editor.getSelection().includes("\n");


export function deleteLine (editor: Editor, lineNo: number) {
	// there is no 'next line' when cursor is on the last line
	if (lineNo < editor.lastLine()) {
		const lineStart = { line: lineNo, ch: 0 };
		const nextLineStart = { line: lineNo + 1, ch: 0 };
		editor.replaceRange("", lineStart, nextLineStart);
	} else {
		const previousLineEnd = { line: lineNo - 1, ch: editor.getLine(lineNo).length };
		const lineEnd = { line: lineNo, ch: editor.getLine(lineNo).length };
		editor.replaceRange("", previousLineEnd, lineEnd);
	}
}

export function log (editor: Editor, msg: string, appendSelection?: boolean) {
	if (!constant.DEBUGGING) return;
	let appended = "";
	if (appendSelection) appended = ": \"" + editor.getSelection() + "\"";
	if (!msg.startsWith("\n")) msg = "- " + msg;
	console.log(msg + appended);
}

