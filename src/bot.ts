import { connect, set } from 'mongoose'
import { Database, Server } from './Structures'
require('dotenv').config()
;(async (): Promise<void> => {
  set('strictQuery', false)
  await connect(process.env.MONGO_URI)
  const sessionsDB = new Database()
  const server = new Server(sessionsDB)
  server.run()
})()
