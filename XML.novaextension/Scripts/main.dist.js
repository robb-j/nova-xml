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
var console = globalThis.console;
function createDebug(namespace) {
  return (...args) => {
    if (!nova.inDevMode())
      return;
    const humanArgs = args.map(
      (arg) => typeof arg === "object" ? JSON.stringify(arg) : arg
    );
    console.info(`${namespace}:`, ...humanArgs);
  };
}
function getEditor(block) {
  return (editorOrWorkspace, maybeEditor) => {
    return block(maybeEditor != null ? maybeEditor : editorOrWorkspace);
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
var DEBUG_LOGS = nova.inDevMode() && false;
var XmlLanguageServer = class {
  constructor() {
    this.languageClient = null;
    debug("#new");
    this.start();
  }
  deactivate() {
    debug("#deactivate");
    this.stop();
  }
  start() {
    return __async(this, null, function* () {
      this.stop();
      try {
        this.stop();
        debug("#start");
        const packageDir = nova.inDevMode() ? nova.extension.path : nova.extension.globalStoragePath;
        const catalogPath = nova.path.join(packageDir, "Schemas/catalog.xml");
        const serverOptions = yield this.getServerOptions(
          packageDir,
          DEBUG_LOGS ? nova.workspace.path : null
        );
        const clientOptions = {
          syntaxes: ["xml"],
          initializationOptions: {
            settings: {
              xml: {
                catalogs: [catalogPath]
              }
            }
          }
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
        nova.subscriptions.add(client);
        this.languageClient = client;
        this.setupLanguageServer(client);
      } catch (error) {
        logError("LanguageServer Failed", error);
      }
    });
  }
  stop() {
    return __async(this, null, function* () {
      if (this.languageClient) {
        debug("#stop");
        this.languageClient.stop();
        nova.subscriptions.remove(this.languageClient);
        this.languageClient = null;
      } else {
        debug("#stop (not running)");
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
  getServerOptions(packageDir, debugPath) {
    return __async(this, null, function* () {
      const serverPath = nova.path.join(packageDir, "bin/lemminx-osx-x86_64");
      if (debugPath) {
        const stdinLog = nova.path.join(debugPath, "stdin.log");
        const stdoutLog = nova.path.join(debugPath, "stdout.log");
        return {
          type: "stdio",
          path: "/bin/sh",
          args: ["-c", `tee "${stdinLog}" | ${serverPath} | tee "${stdoutLog}"`]
        };
      }
      return {
        type: "stdio",
        path: serverPath,
        args: []
      };
    });
  }
};

// src/Scripts/commands/format-command.ts
var debug2 = createDebug("format");
function formatCommand(editor, client) {
  return __async(this, null, function* () {
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
    const result = yield client.sendRequest(
      "textDocument/formatting",
      params
    );
    if (!result)
      return;
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
function renameCommand(editor, client) {
  return __async(this, null, function* () {
    var _a;
    debug3("format", editor.document.uri);
    editor.selectWordsContainingCursors();
    const range = editor.selectedRange;
    const selectedPosition = (_a = getLspRange(editor.document, range)) == null ? void 0 : _a.start;
    if (!selectedPosition)
      return debug3("Nothing selected");
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
    const result = yield client.sendRequest(
      "textDocument/rename",
      params
    );
    debug3("result", result);
    if (!result)
      return;
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

// src/Scripts/main.ts
var debug4 = createDebug("main");
var langServer = null;
function errorHandler(error) {
  logError("A command failed", error);
}
function activate() {
  debug4("#activate");
  langServer = new XmlLanguageServer();
  nova.workspace.onDidAddTextEditor((editor) => {
    editor.onWillSave(() => __async(this, null, function* () {
      var _a;
      if (editor.document.syntax !== "xml")
        return;
      if ((_a = nova.config.get("robb-j.xml.formatOnSave", "boolean")) != null ? _a : false) {
        yield nova.commands.invoke("robb-j.xml.format", editor);
      }
    }));
  });
}
function deactivate() {
  debug4("#deactivate");
  if (langServer) {
    langServer.deactivate();
    langServer = null;
  }
}
nova.commands.register(
  "robb-j.xml.format",
  getEditor((editor) => __async(void 0, null, function* () {
    if (!(langServer == null ? void 0 : langServer.languageClient))
      return;
    yield formatCommand(editor, langServer.languageClient).catch(errorHandler);
  }))
);
nova.commands.register(
  "robb-j.xml.rename",
  getEditor((editor) => __async(void 0, null, function* () {
    if (!(langServer == null ? void 0 : langServer.languageClient))
      return;
    yield renameCommand(editor, langServer.languageClient).catch(errorHandler);
  }))
);
