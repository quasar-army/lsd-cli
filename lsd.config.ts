import { config as configureEnv } from 'dotenv'
import { outputFileSync } from 'fs-extra/esm'
import { defineConfig } from './dist/types/LsdCliConfig.js'

configureEnv()

export default defineConfig({
  sot: {
    watch: {
      events: {
        'schema.changed' (payload: any) {
          outputFileSync(
            `./schemas/${payload.schema.$id}.schema.json`,
            JSON.stringify(payload.schema, null, 2),
          )
        },
      },
      onStart: async (schemas: any) => {
        schemas.forEach(schema => {
          outputFileSync(
            `./schemas/${schema.$id}.schema.json`,
            JSON.stringify(schema, null, 2),
          )
        })
      },
    },
    projectId: process.env.SOT_PROJECT_ID,
    token: process.env.SOT_TOKEN,
  },
})
