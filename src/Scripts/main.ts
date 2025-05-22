//
// Extension entry point
//

import { createDebug } from './utils'
import { XmlLanguageServer } from './xml-language-server'

import { formatCommand } from './commands/format-command'
import { renameCommand } from './commands/rename-command'
import { restartCommand } from './commands/restart-command'

const debug = createDebug('main')

export function activate() {
  debug('#activate')

  const langServer = new XmlLanguageServer()
  nova.subscriptions.add(langServer)

  nova.workspace.onDidAddTextEditor((editor) => {
    editor.onWillSave(async () => {
      if (editor.document.syntax !== 'xml') return

      if (nova.config.get('robb-j.xml.formatOnSave', 'boolean') ?? false) {
        await nova.commands.invoke('robb-j.xml.format', editor)
      }
    })
  })
  nova.commands.register('robb-j.xml.format', (editor) =>
    formatCommand(editor, langServer),
  )
  nova.commands.register('robb-j.xml.rename', (editor) =>
    renameCommand(editor, langServer),
  )
  nova.commands.register('robb-j.xml.restart', () => restartCommand(langServer))
}

export function deactivate() {
  debug('#deactivate')
}
