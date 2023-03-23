import express, { Request, Response } from 'express'
import { join } from 'path'
import { Client, Database } from '.'
import { TSessionModel } from '../Database'
import {
  AssetHandler,
  CallHandler,
  EventHandler,
  MessageHandler
} from '../Handlers'
require('dotenv').config()

export class Server {
  private database: Database

  private path = join(__dirname, '..', '..', 'public')

  private app = express()

  private clients: Client[] = []

  private maxTryConnect = 2

  constructor(database: Database) {
    this.database = database

    this.app.use('/', express.static(this.path))

    this.app.get('/wa/qr', async (req, res) => {
      const { session } = req.query
      const sessionBySession = this.clients.find(
        (client) => client.config.session === session
      )

      if (!session || !sessionBySession)
        return void res
          .status(404)
          .setHeader('Content-Type', 'text/plain')
          .send('Invalid Session')
          .end()
      if (!sessionBySession || !sessionBySession.QR)
        return void res
          .status(404)
          .setHeader('Content-Type', 'text/plain')
          .send(
            sessionBySession.condition === 'connected'
              ? 'You are already connected to WhatsApp'
              : 'QR not generated'
          )
          .end()
      res
        .status(200)
        .contentType('image/png')
        .send(sessionBySession.QR)
    })

    this.app.get('/wa/register', async (req, res) => {
      const { session, password, gptSystem, aboutText } = req.query
      try {
        if (password !== process.env.APP_PASSWORD)
          throw new Error('Incorrect password')

        const createSession = await this.database.session.create({
          sessionId: session,
          gptSystem,
          aboutText
        })

        await this.execute(createSession)

        res
          .status(201)
          .contentType('application/json')
          .send({ status: 'success' })
      } catch (error) {
        res
          .status(400)
          .contentType('application/json')
          .send({ status: 'failed' })
      }
    })

    this.app.get('/wa/client', async (req, res) => {
      const clients = []
      for (const client of this.clients) {
        clients.push({
          session: client.config.session,
          status: client.condition
        })
      }
      res
        .status(201)
        .contentType('application/json')
        .send({ clients })
    })

    this.app.all('*', (req: Request, res: Response) =>
      res.sendStatus(404)
    )

    this.app.listen(process.env.PORT, () =>
      console.log(`Server started on PORT : ${process.env.PORT}`)
    )
  }

  public async run(): Promise<void> {
    const sessions = await this.database.getAllSession()
    for (const session of sessions) {
      await this.execute(session)
    }
  }

  private async execute(session: TSessionModel): Promise<void> {
    const client = new Client(session)

    await client.start()

    client.ev.on('connection.update', async (update) => {
      if (this.maxTryConnect < 1) {
        this.clients = this.clients.filter(
          (client) => client.config.session !== session.sessionId
        )
        client.log(`Delete Session ${session.sessionId}`, true)

        this.database.session.deleteOne({
          sessionId: session.sessionId
        })
        try {
          await client.ws.close(1000, new Error('reason'))
          await client.logout()
        } catch (error) {
          console.error(error)
        }
      }
      if (update.qr) this.maxTryConnect -= 1
    })

    new AssetHandler(client).loadAssets()

    const { handleMessage, loadCommands } = new MessageHandler(client)

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

    this.clients.push(client)
  }
}
