type BlueEvent = 'schema.changed'

export interface BlueCliConfig {
  schema?: {
    appUrl?: string
    apiUrl?: string
    socketUrl?: string
    listen?: {
      events?: Record<
        BlueEvent,
        ((payload: any) => void)
      >
      onStart?: (allSchemas: any) => Promise<void>
    }
    projectId?: string
    token?: string
  }
}
