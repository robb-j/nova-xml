import { createDebug, logError } from './utils'

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2]
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3]

const debug = createDebug('xml-language-server')

const DEBUG_LOGS = nova.inDevMode() && false

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

      const catalogPath = nova.path.join(packageDir, 'Schemas/catalog.xml')
      let catalogList = [catalogPath]

      let localCatalogs = nova.workspace.config.get(
        'robb-j.xml.catalogFiles',
        'array'
      )

      if (localCatalogs !== null && localCatalogs.length > 0) {
        catalogList = catalogList.concat(localCatalogs)
      }

      const serverOptions = await this.getServerOptions(
        packageDir,
        DEBUG_LOGS ? nova.workspace.path : null
      )
      const clientOptions: ClientOptions = {
        syntaxes: ['xml'],
        initializationOptions: {
          settings: {
            xml: {
              catalogs: catalogList,
            },
          },
        },
      }

      await this.prepareBinary(serverOptions.path)

      debug('serverOptions', serverOptions)
      debug('clientOptions', clientOptions)

      const client = new LanguageClient(
        'robb-j.xml',
        'XML LanguageClient',
        serverOptions,
        clientOptions
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

  async getServerOptions(packageDir: string, debugPath: string | null) {
    const serverPath = nova.path.join(packageDir, 'bin/lemminx-osx-x86_64')

    if (debugPath) {
      const stdinLog = nova.path.join(debugPath, 'stdin.log')
      const stdoutLog = nova.path.join(debugPath, 'stdout.log')

      return {
        type: 'stdio',
        path: '/bin/sh',
        args: ['-c', `tee "${stdinLog}" | ${serverPath} | tee "${stdoutLog}"`],
      } as ServerOptions
    }

    return {
      type: 'stdio',
      path: serverPath,
      args: [],
    } as ServerOptions
  }
}
