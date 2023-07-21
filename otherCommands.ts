import { Notice, requireApiVersion } from "obsidian";

export class otherCommands {
	async runCommand (commandID: string) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return; // no file open

		// File Deletion
		if (commandID === "smarter-delete-current-file") {
			const runCommand = (str: string) => this.app.commands.executeCommandById(str);

			const deletionPromptEnabled = this.app.vault.getConfig("promptDelete");
			if (deletionPromptEnabled) {
				new Notice ("This command requires that the core Obsidian setting \"Confirm file deletion\" is *disabled*.");
				return; // the quite simple method below only works the prompt is disabled.
			}

			runCommand("app:delete-file");
			runCommand("app:go-back");
			runCommand("app:go-back");
			new Notice ("\"" + activeFile.name + "\" deleted.");

		// Copy Path
		} else if (commandID === "smarter-copy-path") {
			let noticeText;
			const relativePath = activeFile.path;
			// @ts-ignore, basePath not part of API
			const absolutePath = this.app.vault.adapter.basePath + "/" + relativePath;
			let parentFolder;
			if (relativePath.includes("/")) parentFolder = relativePath.replace(/(.*)\/.*/, "$1");
			else parentFolder = "/"; // root

			const currentClipboardText = await navigator.clipboard.readText();

			if (currentClipboardText === relativePath) {
				await navigator.clipboard.writeText(absolutePath);
				noticeText = "Absolute path copied: \n" + absolutePath;
			} else if (currentClipboardText === absolutePath) {
				await navigator.clipboard.writeText(parentFolder);
				noticeText = "Parent Folder copied: \n" + parentFolder;
			} else {
				await navigator.clipboard.writeText(relativePath);
				noticeText = "Relative path copied: \n" + relativePath;
			}

			// slightly longer Notice so a longer path can be read
			new Notice(noticeText, 7000); // eslint-disable-line no-magic-numbers

		// Copy File Name
		} else if (commandID === "smarter-copy-file-name") {
			const currentClipboardText = await navigator.clipboard.readText();
			let fileName = activeFile.basename;

			if (currentClipboardText === fileName) fileName += "." + activeFile.extension;
			await navigator.clipboard.writeText(fileName);

			new Notice("File Name copied: \n" + fileName);

		// Toggle Line Numbers
		} else if (commandID === "toggle-line-numbers") {
			const optionEnabled = this.app.vault.getConfig("showLineNumber");
			this.app.vault.setConfig("showLineNumber", !optionEnabled);

		// Toggle Readable Line Length
		} else if (commandID === "toggle-readable-line-length") {
			const optionEnabled = this.app.vault.getConfig("readableLineLength");
			this.app.vault.setConfig("readableLineLength", !optionEnabled);

		// Hide Notice
		} else if (commandID === "hide-notice") {
			const isVersionFifteen = requireApiVersion("0.15.0");
			if (isVersionFifteen) {
				// @ts-ignore
				for (const el of activeDocument.body.getElementsByClassName("notice")) el.hide();
			} else {
				// @ts-ignore
				for (const el of document.body.getElementsByClassName("notice"))el.hide();
			}
		}

	}
};
