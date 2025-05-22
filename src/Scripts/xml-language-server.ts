import { createDebug, logError } from './utils'

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2]

const debug = createDebug('xml-language-server')

export class XmlLanguageServer {
  languageClient: LanguageClient | null = null

  constructor() {
    debug('#new')

    this.start()
  }

  async start() {
    if (this.languageClient) {
      this.languageClient.stop()
      this.languageClient = null
    }

    try {
      debug('#start')

      const packageDir = nova.inDevMode()
        ? nova.extension.path
        : nova.extension.globalStoragePath

      const catalogs = nova.workspace.config.get('xml.catalogs', 'array') ?? []
      catalogs.push(nova.path.join(packageDir, 'Schemas/catalog.xml'))

      for (let i = 0; i < catalogs.length; i++) {
        if (catalogs[i].startsWith('/')) continue
        catalogs[i] = nova.path.join(nova.workspace.path!, catalogs[i])
      }

      const serverOptions = {
        type: 'stdio' as const,
        path: nova.path.join(packageDir, 'bin/lemminx-osx-x86_64'),
      }

      const clientOptions = {
        syntaxes: ['xml'],
        initializationOptions: {
          settings: {
            xml: { catalogs },
          },
        },
        // debug: true,
      }

      await this.prepareBinary(serverOptions.path)

      debug('serverOptions', serverOptions)
      debug('clientOptions', clientOptions)

      const client = new LanguageClient(
        'robb-j.xml',
        'XML LanguageClient',
        serverOptions,
        clientOptions,
      )

      client.start()

      this.languageClient = client

      this.setupLanguageServer(client)
    } catch (error) {
      logError('LanguageServer Failed', error)
    }
  }

  dispose() {
    debug('#dispose')
    this.stop()
  }

  async stop() {
    debug('#stop')
    if (this.languageClient) {
      this.languageClient.stop()
      this.languageClient = null
    }
  }

  // Make sure the LSP server binary is executable
  prepareBinary(path: string) {
    // Ensure the binary has execute permissions
    return new Promise<void>((resolve, reject) => {
      const process = new Process('/usr/bin/env', {
        args: ['chmod', 'u+x', path],
      })
      process.onDidExit((status) => (status === 0 ? resolve() : reject()))
      process.start()
    })
  }

  setupLanguageServer(client: LanguageClient) {
    client.onDidStop((err) => {
      debug('Language Server Stopped', err?.message)
    })
  }
}
