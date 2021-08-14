import { console, createDebug } from './utils'

type ServerOptions = ConstructorParameters<typeof LanguageClient>[2]
type ClientOptions = ConstructorParameters<typeof LanguageClient>[3]

const debug = createDebug('xml-language-server')

const DEBUG_LOGS = false

export class XmlLanguageServer {
  languageClient: LanguageClient | null = null

  constructor() {
    debug('#new')

    this.start()
  }

  deactivate() {
    debug('#deactivate')

    this.stop()
  }

  async start() {
    this.stop()

    try {
      debug('#start')

      const packageDir = nova.inDevMode()
        ? nova.extension.path
        : nova.extension.globalStoragePath

      const catalogPath = nova.path.join(packageDir, 'Schemas/catalog.xml')

      const serverOptions = await this.getServerOptions(
        packageDir,
        DEBUG_LOGS ? nova.workspace.path : null
      )
      const clientOptions: ClientOptions = {
        syntaxes: ['xml'],
        initializationOptions: {
          settings: {
            xml: {
              catalogs: [catalogPath],
            },
          },
        },
      }

      await this.prepareBinary(serverOptions.path)

      debug('serverOptions', serverOptions)
      debug('clientOptions', clientOptions)

      const client = new LanguageClient(
        'robb-j.xml',
        nova.extension.name,
        serverOptions,
        clientOptions
      )

      client.start()

      nova.subscriptions.add(client as any)
      this.languageClient = client

      this.setupLanguageServer(client)
    } catch (error) {
      console.log(error.message)
      console.log(error.stack)
    }
  }

  async stop() {
    if (this.languageClient) {
      debug('#stop')
      this.languageClient.stop()
      nova.subscriptions.remove(this.languageClient as any)
      this.languageClient = null
    } else {
      debug('#stop (not running)')
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

  setupLanguageServer(client: LanguageClient) {}

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
