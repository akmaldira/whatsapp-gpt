import {
  AssetHandler,
  CallHandler,
  EventHandler,
  MessageHandler
} from './Handlers'
import { Client, Server } from './Structures'
require('dotenv').config()
;(async (): Promise<void> => {
  const sessions = (process.env.SESSION || '').split(', ')

  if (sessions && sessions.length > 0) {
    const clientRun = []
    for await (const session of sessions) {
      const client = new Client(session)
      clientRun.push(client)

      await client.start()

      new AssetHandler(client).loadAssets()

      const { handleMessage, loadCommands } = new MessageHandler(
        client
      )

      const { handleEvents, sendMessageOnJoiningGroup } =
        new EventHandler(client)

      const { handleCall } = new CallHandler(client)

      loadCommands()

      client.on('new_message', async (M) => await handleMessage(M))

      client.on(
        'participants_update',
        async (event) => await handleEvents(event)
      )

      client.on(
        'new_group_joined',
        async (group) => await sendMessageOnJoiningGroup(group)
      )

      client.on('new_call', async (call) => await handleCall(call))
    }
    new Server(clientRun)
  }
})()
