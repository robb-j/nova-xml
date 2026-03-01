import { XmlLanguageServer } from '../xml-language-server'
import { createDebug } from '../utils'

const debug = createDebug('restart')

export async function restartCommand(langServer: XmlLanguageServer) {
  debug('Restarting')

  langServer.stop()
  langServer.start()
}
