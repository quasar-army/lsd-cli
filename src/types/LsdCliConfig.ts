type SotEvent = 'schema.changed'

export interface LsdCliConfig {
  sot?: {
    baseUrl?: string
    watch?: {
      events?: Record<
        SotEvent,
        ((payload: any) => void)
      >
      onStart?: (allSchemas: any) => Promise<void>
    }
    projectId?: string
    token?: string
  }
}

export const defineConfig = (config: LsdCliConfig) => config
