import express, { Request, Response } from 'express'
import { join } from 'path'
import { Client } from '.'

export class Server {
  constructor(private clients: Client[]) {
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

    this.app.all('*', (req: Request, res: Response) =>
      res.sendStatus(404)
    )

    this.app.listen(5000, () =>
      console.log(`Server started on PORT : ${5000}`)
    )
  }

  private path = join(__dirname, '..', '..', 'public')

  private app = express()
}
