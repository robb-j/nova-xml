//
// Utility files to help out and make code more readable
//

import type { Range as LspRange } from 'vscode-languageserver-protocol'

export type ProcessParams = ConstructorParameters<typeof Process>
export type ProcessOutput = { stdout: string; stderr: string; status: number }

export const console: Console = (globalThis as any).console

/**
 * Run a non-interactive process and get the stdout, stderr & status in one go
 * @param {ProcessParams[0]} path The path to the binary to run
 * @param {ProcessParams[1]} options How to run the process
 * @returns A promise of a ProcessOutput
 */
export function execute(
  path: ProcessParams[0],
  options: ProcessParams[1]
): Promise<ProcessOutput> {
  return new Promise<ProcessOutput>((resolve) => {
    const process = new Process(path, options)

    // Copy all stdout into an array of lines
    const stdout: string[] = []
    process.onStdout((line) => stdout.push(line))

    // Copy all stderr into an array of lines
    const stderr: string[] = []
    process.onStderr((line) => stderr.push(line))

    // Resolve the promise once the process has exited,
    // with the stdout and stderr as single strings and the status code number
    process.onDidExit((status) =>
      resolve({
        status,
        stderr: stderr.join('\n'),
        stdout: stdout.join('\n'),
      })
    )

    // Start the process
    process.start()
  })
}

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
// export interface LspRange {
//   start: { line: number; character: number }
//   end: { line: number; character: number }
// }
// export interface LspEdit {
//   range: LspRange
//   newText: string
// }
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
