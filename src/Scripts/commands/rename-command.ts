import type {
  RenameParams,
  WorkspaceEdit,
} from 'vscode-languageserver-protocol'
import { createDebug, getEditorRange, getLspRange } from '../utils'

const debug = createDebug('format')

// Shamelessly stolen from
// https://github.com/apexskier/nova-typescript/blob/main/src/commands/rename.ts

//
// TODO:
// As of nova 7.2 this consistently crashes Nova
//

export async function renameCommand(
  editor: TextEditor,
  client: LanguageClient
) {
  debug('format', editor.document.uri)

  // Select the whole of a word
  editor.selectWordsContainingCursors()

  const range = editor.selectedRange
  const selectedPosition = getLspRange(editor.document, range)?.start
  if (!selectedPosition) return debug('Nothing selected')

  const newName = await new Promise<string | null>((resolve) => {
    nova.workspace.showInputPalette(
      'New name for symbol',
      { placeholder: editor.selectedText, value: editor.selectedText },
      resolve
    )
  })
  if (!newName || newName == editor.selectedText) {
    return
  }

  debug('newName', newName)

  const params: RenameParams = {
    textDocument: { uri: editor.document.uri },
    position: selectedPosition,
    newName,
  }

  const result = (await client.sendRequest(
    'textDocument/rename',
    params
  )) as WorkspaceEdit | null

  debug('result', result)
  if (!result) return

  for (const uri in result.changes) {
    const editor = await nova.workspace.openFile(uri)
    if (!editor) {
      debug('Failed to open', uri)
      continue
    }
    const changes = result.changes[uri]
    if (!changes) {
      debug('TODO: add support for documentChanges', uri)
      continue
    }

    editor.edit((edit) => {
      for (const change of changes.reverse()) {
        edit.replace(
          getEditorRange(editor.document, change.range),
          change.newText
        )
      }
    })
  }
}
