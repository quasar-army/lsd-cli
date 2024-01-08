import { Command, Flags } from '@oclif/core'
import { cosmiconfig } from 'cosmiconfig'
import Pusher from 'pusher-js'
import wretch from 'wretch'
import { LsdCliConfig } from '../..'

// function sleep (ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

export default class Watch extends Command {
  static description = 'Say watch'

  static examples = [
    `$ oex watch friend --from oclif
watch friend from oclif! (./src/commands/watch/index.ts)
`,
  ]

  static flags = {
    projectId: Flags.string({ description: 'Project ID', required: false }),
    token: Flags.string({ description: 'API Token', required: false }),
  }

  async run (): Promise<void> {
    const configExplorer = cosmiconfig('lsd')
    const configResult = await configExplorer.search()
    const userConfig: LsdCliConfig = configResult?.config

    const { flags } = await this.parse(Watch)

    const config = { ...userConfig.sot, ...flags }

    const baseUrl = config.baseUrl ?? 'http://127.0.0.1'
    if (config.watch?.onStart) {
      const schemas = (await wretch(baseUrl).auth(`Bearer ${config.token}`)
        .get(`/api/schemas?project_id=${config.projectId}`)
        .json()) as any

      await config.watch?.onStart(schemas)
    }

    const pusher = new Pusher('app-key', {
      auth: {
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
      },
      authEndpoint: `${baseUrl}/api/broadcasting/auth`,
      cluster: 'default',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      forceTLS: false,
      wsHost: '127.0.0.1',
      wsPort: 6001,
      wssPort: 6001,
    })

    const channel = pusher.subscribe(`private-projects.${config.projectId}.schema`)
    for (const entry of Object.entries(config.watch?.events ?? [])) {
      const [eventName, eventCallback] = entry

      channel.bind(eventName, eventCallback)
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 900_000)
    })
  }
}
