//
// Extension entry point
//

import { createDebug, getEditor, logError } from './utils'
import { XmlLanguageServer } from './xml-language-server'

import { formatCommand } from './commands/format-command'
import { renameCommand } from './commands/rename-command'

const debug = createDebug('main')
let langServer: XmlLanguageServer | null = null

function errorHandler(error: unknown) {
  logError('A command failed', error)
}

export function activate() {
  debug('#activate')

  langServer = new XmlLanguageServer()

  nova.workspace.onDidAddTextEditor((editor) => {
    editor.onWillSave(async () => {
      if (editor.document.syntax !== 'xml') return

      if (nova.config.get('robb-j.xml.formatOnSave', 'boolean') ?? false) {
        await nova.commands.invoke('robb-j.xml.format', editor)
      }
    })
  })
}

export function deactivate() {
  debug('#deactivate')

  if (langServer) {
    langServer.deactivate()
    langServer = null
  }
}

nova.commands.register(
  'robb-j.xml.format',
  getEditor(async (editor) => {
    if (!langServer?.languageClient) return

    await formatCommand(editor, langServer.languageClient).catch(errorHandler)
  })
)

nova.commands.register(
  'robb-j.xml.rename',
  getEditor(async (editor) => {
    if (!langServer?.languageClient) return

    await renameCommand(editor, langServer.languageClient).catch(errorHandler)
  })
)
