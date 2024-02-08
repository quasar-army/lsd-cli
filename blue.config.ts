import { config as configureEnv } from 'dotenv'
import { outputFileSync, removeSync } from 'fs-extra/esm'

configureEnv()

export default {
  schema: {
    listen: {
      events: {
        'schema.changed' (payload: any) {
          outputFileSync(
            `./schemas/${payload.schema.$id}.schema.json`,
            JSON.stringify(payload.schema, null, 2),
          )
        },
        'schema.deleted' (payload: any) {
          removeSync(`./schemas/${payload.schema.$id}.schema.json`)
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
    projectId: process.env.BLUE_SCHEMA_PROJECT_ID,
    token: process.env.BLUE_SCHEMA_TOKEN,
  },
}
