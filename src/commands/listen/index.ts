import { Command, Flags } from '@oclif/core'
import { cosmiconfig } from 'cosmiconfig'
import Pusher from 'pusher-js'
import wretch from 'wretch'
import { BlueCliConfig } from '../../types/BlueCliConfig'
import chalk from 'chalk'
import readline from 'readline'

function makeTimeString () {
  const date = new Date()
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

export default class Listen extends Command {
  static description = 'Listen for schema changes'
  public pusher: Pusher | undefined

  static flags = {
    projectId: Flags.string({ description: 'Project ID', required: false }),
    token: Flags.string({ description: 'API Token', required: false }),
  }

  private gracefulShutdown () {
    this.log('Shutting down gracefully')
    this.pusher?.disconnect() // Example: disconnect the Pusher client
    process.exit(0)
  }

  async run (): Promise<void> {
    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))

    const configExplorer = cosmiconfig('blue')
    const configResult = await configExplorer.search()
    const userConfig: BlueCliConfig = configResult?.config

    const { flags } = await this.parse(Listen)

    const config = { ...userConfig.schema, ...flags }

    const apiUrl = config.apiUrl ?? 'https://api.schema.blue'
    const appUrl = config.appUrl ?? 'https://schema.blue'
    const socketUrl = config.socketUrl ?? 'https://socket.schema.blue'
    if (config.listen?.onStart) {
      const schemas = (await wretch(apiUrl).auth(`Bearer ${config.token}`)
        .get(`/api/schemas?project_id=${config.projectId}`)
        .json()) as any

      await config.listen?.onStart(schemas)
    }

    const project = (await wretch(apiUrl).auth(`Bearer ${config.token}`)
      .get(`/api/projects/${config.projectId}`)
      .json()) as any

    const projectSlug = project?.data?.slug

    const projectUrl = projectSlug ? `${appUrl}/projects/${projectSlug}` : `${appUrl}/projects`

    function clearConsole () {
      const blank = '\n'.repeat(process.stdout.rows)
      console.log(blank)
      readline.cursorTo(process.stdout, 0, 0)
      readline.clearScreenDown(process.stdout)
      console.log(chalk.bgBlue(`Listening - [${projectUrl}]`))
    }

    this.pusher = new Pusher('schema-changes', {
      auth: {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      },
      authEndpoint: `${apiUrl}/api/broadcasting/auth`,
      cluster: 'default',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      forceTLS: false,
      wsHost: 'socket.schema.blue',
      wsPort: 2053,
      wssPort: 2053,
    })

    this.pusher.connection.bind('initialized', () => this.log(chalk.bgBlue('initialized')))
    this.pusher.connection.bind('connecting', () => this.log(chalk.bgBlue('connecting')))
    this.pusher.connection.bind('connected', () => this.log(chalk.bgBlue('connected')))
    this.pusher.connection.bind('unavailable', () => this.log(chalk.bgYellow('unavailable')))
    this.pusher.connection.bind('failed', () => this.log(chalk.bgRed('failed')))
    this.pusher.connection.bind('disconnected', () => this.log(chalk.bgGray('disconnected')))

    const channel = this.pusher.subscribe(`private-projects.${config.projectId}.schema`)

    channel.bind('pusher:subscription_error', (error: any) => this.error(error))
    channel.bind('pusher:subscription_succeeded', () => this.log(chalk.bgBlue('subscribed')))

    for (const entry of Object.entries(config.listen?.events ?? [])) {
      const [eventName, eventCallback] = entry
      channel.bind(eventName, (payload: any) => {
        clearConsole()
        this.log(chalk.blue(`event[${makeTimeString()}]: `) + eventName)
        eventCallback(payload)
      })
    }

    clearConsole()
  }
}
