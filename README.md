# Blue CLI
Blue CLI is used to sync your schema.blue schema, with your local development environment.
It uses websockets, which means it can respond to changes immediately!

You make a change to you schema. that change shows up in your project.

And it's not just for syncing the schema. The Blue CLI provides hooks so we can generate classes, migrations, models etc the moment we make changes!

You can explore the [Modular Quasar Template](https://github.com/quasar-army/modular-quasar-template) to see how Blue CLI can be used for rapid, robust development.

## Install
locally:
```sh
pnpm install @quasar-army/blue-cli
```

globally (The blue standard uses npm for global dependencies)
```sh
npm install -g @quasar-army/blue-cli
```

We can now listen for changes with `blue listen`. We'll likely want to add this to our package.json
```json
{
  "scripts": {
    "blue:listen": "blue listen"
  }
}
```

Now let's see how we can react to changes in our schema...

## Configuration

Blue provides hooks that allow us to **immediately** react to changes in the schema!
```ts
import { config as configureEnv } from 'dotenv'

configureEnv()

export default {
  schema: {
    projectId: process.env.BLUE_SCHEMA_PROJECT_ID, // Your schema.blue project ID
    token: process.env.BLUE_SCHEMA_TOKEN, // Your schema.blue token
    listen: {
      events: {
        'schema.changed' (payload: any) {
          // Here, you might run a generator on the changed schema
          console.log(payload)
        },
        'schema.deleted' (payload: any) {
          // Here, you could delete all files related to this schema
          console.log(payload)
        },
      },
      onStart: async (payload: any) => {
        console.log(payload) // "payload" contains ALL schemas for this project
      },
    },
  },
}

```

## A quick note on architecture
Files that are built with Blue CLI are constantly changing and therefore **should not be edited**.

For that reason, we suggest **extending** those files if you want to add custom functionality.

For example, if using models, you may choose to have two folders:
- `base-models/`
- `models/`

Models within `base-models/` would never be touched. Models within `models/` can change.
Here's an example using PiniaORM:

`BaseUser.ts`
```ts
import { Model } from 'pinia-orm'
import { Attr, Uid } from 'pinia-orm/dist/decorators'

export class BaseUser extends Model {
  static entity = 'users'
  static primaryKey = 'id'

  // fields
  @Uid() declare id: string
  @Attr() declare name: string | null
  @Attr() declare age: number | null
  @Attr() declare is_active: boolean | null
  @Attr() declare date_of_birth_date_time_tz: string | null
}
```

`User.ts`
```ts
import { BaseUser } from '../base-models/BaseUser'

export class User extends BaseUser {
  sayHello() {
    console.log('hello')
  }
}
```

Now throughout the project, we would only import `User.ts`, never `BaseUser.ts`. Changes to BaseUser can happen freely and `User.ts` will still have the `sayHello` function.

### Is this necessary?
To be clear, we have never had to do this pattern in the Quasar Army. We generated models directly. However if we start running into edge cases, we'll start following this pattern to allow for more flexibility.
