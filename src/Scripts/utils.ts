//
// Utility files to help out and make code more readable
//

import type { Range as LspRange } from 'vscode-languageserver-protocol'

export const console: Console = (globalThis as any).console

/**
 * Generate a method for namespaced debug-only logging,
 * inspired by https://github.com/visionmedia/debug.
 *
 * - prints messages under a namespace
 * - only outputs logs when nova.inDevMode()
 * - converts object arguments to json
 */
export function createDebug(namespace: string) {
  return (...args: any[]) => {
    if (!nova.inDevMode()) return

    const humanArgs = args.map((arg) =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    )
    console.info(`${namespace}:`, ...humanArgs)
  }
}

//
//
//

/** Wrap Nova's weird Workspace/TextEditor command parameters */
export function getEditor<T>(block: (editor: TextEditor) => T) {
  return (
    editorOrWorkspace: TextEditor | Workspace,
    maybeEditor: TextEditor | null
  ) => {
    return block(maybeEditor ?? (editorOrWorkspace as TextEditor))
  }
}

//
//
//

/**
 * Shamelessly stolen from
 * https://github.com/apexskier/nova-typescript/blob/2d4c1d8e61ca4afba6ee9ad1977a765e8cd0f037/src/lspNovaConversions.ts#L29
 */
export function getEditorRange(document: TextDocument, range: LspRange): Range {
  const fullContents = document.getTextInRange(new Range(0, document.length))
  let rangeStart = 0
  let rangeEnd = 0
  let chars = 0
  const lines = fullContents.split(document.eol)
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length + document.eol.length
    if (range.start.line === lineIndex) {
      rangeStart = chars + range.start.character
    }
    if (range.end.line === lineIndex) {
      rangeEnd = chars + range.end.character
      break
    }
    chars += lineLength
  }
  return new Range(rangeStart, rangeEnd)
}

export function getLspRange(
  document: TextDocument,
  range: Range
): LspRange | null {
  const fullContents = document.getTextInRange(new Range(0, document.length))
  let chars = 0
  let startLspRange: LspRange['start'] | undefined
  const lines = fullContents.split(document.eol)
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length + document.eol.length
    if (!startLspRange && chars + lineLength >= range.start) {
      const character = range.start - chars
      startLspRange = { line: lineIndex, character }
    }
    if (startLspRange && chars + lineLength >= range.end) {
      const character = range.end - chars
      return { start: startLspRange, end: { line: lineIndex, character } }
    }
    chars += lineLength
  }
  return null
}
