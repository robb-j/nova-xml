import type {
  DocumentFormattingParams,
  TextEdit,
} from 'vscode-languageserver-protocol'

import { createDebug, getEditorRange } from '../utils'
import { XmlLanguageServer } from '../xml-language-server'

const debug = createDebug('format')

export async function formatCommand(
  editor: TextEditor,
  { languageClient }: XmlLanguageServer,
) {
  if (!languageClient) {
    debug('LanguageServer not running')
    return
  }

  const params: DocumentFormattingParams = {
    textDocument: {
      uri: editor.document.uri,
    },
    options: {
      tabSize: editor.tabLength,
      insertSpaces: Boolean(editor.softTabs),
    },
  }

  debug('format', params)

  const result = (await languageClient.sendRequest(
    'textDocument/formatting',
    params,
  )) as TextEdit[] | null

  if (!result) return

  editor.edit((edit) => {
    for (const change of result.reverse()) {
      edit.replace(
        getEditorRange(editor.document, change.range),
        change.newText,
      )
    }
  })
}
