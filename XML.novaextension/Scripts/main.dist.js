"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/Scripts/main.ts
var main_exports = {};
__export(main_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(main_exports);

// src/Scripts/utils.ts
function createDebug(namespace) {
  return (...args) => {
    if (!nova.inDevMode()) return;
    const humanArgs = args.map(
      (arg) => typeof arg === "object" ? JSON.stringify(arg) : arg
    );
    console.info(`${namespace}:`, ...humanArgs);
  };
}
function getEditorRange(document, range) {
  const fullContents = document.getTextInRange(new Range(0, document.length));
  let rangeStart = 0;
  let rangeEnd = 0;
  let chars = 0;
  const lines = fullContents.split(document.eol);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length + document.eol.length;
    if (range.start.line === lineIndex) {
      rangeStart = chars + range.start.character;
    }
    if (range.end.line === lineIndex) {
      rangeEnd = chars + range.end.character;
      break;
    }
    chars += lineLength;
  }
  return new Range(rangeStart, rangeEnd);
}
function getLspRange(document, range) {
  const fullContents = document.getTextInRange(new Range(0, document.length));
  let chars = 0;
  let startLspRange;
  const lines = fullContents.split(document.eol);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length + document.eol.length;
    if (!startLspRange && chars + lineLength >= range.start) {
      const character = range.start - chars;
      startLspRange = { line: lineIndex, character };
    }
    if (startLspRange && chars + lineLength >= range.end) {
      const character = range.end - chars;
      return { start: startLspRange, end: { line: lineIndex, character } };
    }
    chars += lineLength;
  }
  return null;
}
function logError(message, error) {
  console.error(message);
  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error("An non-error was thrown");
    console.error(error);
  }
}

// src/Scripts/xml-language-server.ts
var debug = createDebug("xml-language-server");
var XmlLanguageServer = class {
  constructor() {
    this.languageClient = null;
    debug("#new");
    this.start();
  }
  start() {
    return __async(this, null, function* () {
      var _a;
      if (this.languageClient) {
        this.languageClient.stop();
        this.languageClient = null;
      }
      try {
        debug("#start");
        const packageDir = nova.inDevMode() ? nova.extension.path : nova.extension.globalStoragePath;
        const catalogs = (_a = nova.workspace.config.get("xml.catalogs", "array")) != null ? _a : [];
        catalogs.push(nova.path.join(packageDir, "Schemas/catalog.xml"));
        for (let i = 0; i < catalogs.length; i++) {
          if (catalogs[i].startsWith("/")) continue;
          catalogs[i] = nova.path.join(nova.workspace.path, catalogs[i]);
        }
        const serverOptions = {
          type: "stdio",
          path: nova.path.join(packageDir, "bin/lemminx-osx-x86_64")
        };
        const clientOptions = {
          syntaxes: ["xml"],
          initializationOptions: {
            settings: {
              xml: { catalogs }
            }
          }
          // debug: true,
        };
        yield this.prepareBinary(serverOptions.path);
        debug("serverOptions", serverOptions);
        debug("clientOptions", clientOptions);
        const client = new LanguageClient(
          "robb-j.xml",
          "XML LanguageClient",
          serverOptions,
          clientOptions
        );
        client.start();
        this.languageClient = client;
        this.setupLanguageServer(client);
      } catch (error) {
        logError("LanguageServer Failed", error);
      }
    });
  }
  dispose() {
    debug("#dispose");
    this.stop();
  }
  stop() {
    return __async(this, null, function* () {
      debug("#stop");
      if (this.languageClient) {
        this.languageClient.stop();
        this.languageClient = null;
      }
    });
  }
  // Make sure the LSP server binary is executable
  prepareBinary(path) {
    return new Promise((resolve, reject) => {
      const process = new Process("/usr/bin/env", {
        args: ["chmod", "u+x", path]
      });
      process.onDidExit((status) => status === 0 ? resolve() : reject());
      process.start();
    });
  }
  setupLanguageServer(client) {
    client.onDidStop((err) => {
      debug("Language Server Stopped", err == null ? void 0 : err.message);
    });
  }
};

// src/Scripts/commands/format-command.ts
var debug2 = createDebug("format");
function formatCommand(_0, _1) {
  return __async(this, arguments, function* (editor, { languageClient }) {
    if (!languageClient) {
      debug2("LanguageServer not running");
      return;
    }
    const params = {
      textDocument: {
        uri: editor.document.uri
      },
      options: {
        tabSize: editor.tabLength,
        insertSpaces: Boolean(editor.softTabs)
      }
    };
    debug2("format", params);
    const result = yield languageClient.sendRequest(
      "textDocument/formatting",
      params
    );
    if (!result) return;
    editor.edit((edit) => {
      for (const change of result.reverse()) {
        edit.replace(
          getEditorRange(editor.document, change.range),
          change.newText
        );
      }
    });
  });
}

// src/Scripts/commands/rename-command.ts
var debug3 = createDebug("format");
function renameCommand(_0, _1) {
  return __async(this, arguments, function* (editor, { languageClient }) {
    var _a;
    debug3("format", editor.document.uri);
    if (!languageClient) {
      debug3("LanguageServer not running");
      return;
    }
    editor.selectWordsContainingCursors();
    const selectedPosition = (_a = getLspRange(
      editor.document,
      editor.selectedRange
    )) == null ? void 0 : _a.start;
    if (!selectedPosition) return debug3("Nothing selected");
    const newName = yield new Promise((resolve) => {
      nova.workspace.showInputPalette(
        "New name for symbol",
        { placeholder: editor.selectedText, value: editor.selectedText },
        resolve
      );
    });
    if (!newName || newName == editor.selectedText) {
      return;
    }
    debug3("newName", newName);
    const params = {
      textDocument: { uri: editor.document.uri },
      position: selectedPosition,
      newName
    };
    const result = yield languageClient.sendRequest(
      "textDocument/rename",
      params
    );
    debug3("result", result);
    if (!result) return;
    for (const uri in result.changes) {
      const editor2 = yield nova.workspace.openFile(uri);
      if (!editor2) {
        debug3("Failed to open", uri);
        continue;
      }
      const changes = result.changes[uri];
      if (!changes) {
        debug3("TODO: add support for documentChanges", uri);
        continue;
      }
      editor2.edit((edit) => {
        for (const change of changes.reverse()) {
          edit.replace(
            getEditorRange(editor2.document, change.range),
            change.newText
          );
        }
      });
    }
  });
}

// src/Scripts/commands/restart-command.ts
var debug4 = createDebug("restart");
function restartCommand(langServer) {
  return __async(this, null, function* () {
    debug4("Restarting");
    langServer.stop();
    langServer.start();
  });
}

// src/Scripts/main.ts
var debug5 = createDebug("main");
function activate() {
  debug5("#activate");
  const langServer = new XmlLanguageServer();
  nova.subscriptions.add(langServer);
  nova.workspace.onDidAddTextEditor((editor) => {
    editor.onWillSave(() => __async(null, null, function* () {
      var _a;
      if (editor.document.syntax !== "xml") return;
      if ((_a = nova.config.get("robb-j.xml.formatOnSave", "boolean")) != null ? _a : false) {
        yield nova.commands.invoke("robb-j.xml.format", editor);
      }
    }));
  });
  nova.commands.register(
    "robb-j.xml.format",
    (editor) => formatCommand(editor, langServer)
  );
  nova.commands.register(
    "robb-j.xml.rename",
    (editor) => renameCommand(editor, langServer)
  );
  nova.commands.register("robb-j.xml.restart", () => restartCommand(langServer));
}
function deactivate() {
  debug5("#deactivate");
}
