import Baileys, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  ParticipantAction,
  proto
} from '@adiwajshing/baileys'
import { google } from '@google-cloud/text-to-speech/build/protos/protos'
import { Boom } from '@hapi/boom'
import chalk from 'chalk'
import { config as Config } from 'dotenv'
import EventEmitter from 'events'
import { connect, set } from 'mongoose'
import P from 'pino'
import qr from 'qr-image'
import TypedEventEmitter from 'typed-emitter'
import {
  AuthenticationFromDatabase,
  Contact,
  Database,
  Message
} from '.'
import { Utils } from '../lib'
import { client, ICall, IConfig, IEvent } from '../Types'

export class Client extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  private client!: client
  constructor(session: string) {
    super()
    Config()
    this.config = {
      name: process.env.BOT_NAME || 'Bot',
      session: session,
      prefix: process.env.PREFIX || ':',
      chatBotUrl: process.env.CHAT_BOT_URL || '',
      mods: (process.env.MODS || '')
        .split(', ')
        .map((user) => `${user}@s.whatsapp.net`),
      isDevelopment:
        process.env.NODE_ENV === 'development' ? true : false,
      openAIAPIKey: process.env.OPENAI_KEY || '',
      organization: process.env.ORGANIZATION || '',
      chatGPTOption: {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        model: 'gpt-3.5-turbo'
      },
      googleApiEnable: process.env.USE_GOOGLE_API === 'true', // dont change this!!!
      googleApiOption: {
        voiceLanguage: process.env.GOOGLE_VOICE_LANGUAGE || 'en-EN',
        voiceGender:
          google.cloud.texttospeech.v1.SsmlVoiceGender[
            process.env.GOOGLE_VOICE_SSML_GENDER
          ] || google.cloud.texttospeech.v1.SsmlVoiceGender['FEMALE']
      }
    }
  }

  public start = async (): Promise<client> => {
    if (!process.env.MONGO_URI) {
      throw new Error('No MongoDB URI provided')
    }
    set('strictQuery', false)
    await connect(process.env.MONGO_URI)
    this.log('Connected to the Database')
    const { useDatabaseAuth } = new AuthenticationFromDatabase(
      this.config.session
    )
    const { saveState, state, clearState } = await useDatabaseAuth()
    const { version } = await fetchLatestBaileysVersion()
    this.client = Baileys({
      version,
      auth: state,
      logger: P({ level: 'fatal' }),
      browser: Browsers.macOS('Safari'),
      getMessage: async (key) => {
        return {
          conversation: ''
        }
      },
      msgRetryCounterMap: {},
      markOnlineOnConnect: false
    })

    for (const method of Object.keys(this.client))
      this[method as keyof Client] =
        this.client[method as keyof client]
    this.ws.on('CB:call', (call: ICall) =>
      this.emit('new_call', {
        from: call.content[0].attrs['call-creator']
      })
    )
    this.ev.on(
      'contacts.update',
      async (contacts) => await this.contact.saveContacts(contacts)
    )
    this.ev.on('messages.upsert', async ({ messages }) => {
      const M = new Message(messages[0], this)
      if (
        M.type === 'protocolMessage' ||
        M.type === 'senderKeyDistributionMessage'
      )
        return void null
      if (M.stubType && M.stubParameters) {
        const emitParticipantsUpdate = (
          action: ParticipantAction
        ): boolean =>
          this.emit('participants_update', {
            jid: M.from,
            participants: M.stubParameters as string[],
            action
          })
        switch (M.stubType) {
          case proto.WebMessageInfo.StubType.GROUP_CREATE:
            return void this.emit('new_group_joined', {
              jid: M.from,
              subject: M.stubParameters[0]
            })
          case proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ADD:
          case proto.WebMessageInfo.StubType
            .GROUP_PARTICIPANT_ADD_REQUEST_JOIN:
          case proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_INVITE:
            return void emitParticipantsUpdate('add')
          case proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_LEAVE:
          case proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_REMOVE:
            return void emitParticipantsUpdate('remove')
          case proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_DEMOTE:
            return void emitParticipantsUpdate('demote')
          case proto.WebMessageInfo.StubType
            .GROUP_PARTICIPANT_PROMOTE:
            return void emitParticipantsUpdate('promote')
        }
      }
      return void this.emit('new_message', await M.simplify())
    })
    this.ev.on('connection.update', async (update) => {
      if (update.qr) {
        this.log(`QR code generated. Scan it to continue`)
        this.QR = qr.imageSync(update.qr)
      }
      const { connection, lastDisconnect } = update
      if (connection === 'close') {
        if (
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut
        ) {
          this.log('Reconnecting...')
          setTimeout(() => this.start(), 3000)
        } else {
          this.log('Disconnected.', true)
          this.log('Deleting session and restarting')
          clearState()
          this.log('Session deleted')
          this.log('Starting...')
          setTimeout(() => this.start(), 3000)
        }
      }
      if (connection === 'connecting') {
        this.condition = 'connecting'
        this.log('Connecting to WhatsApp...')
      }
      if (connection === 'open') {
        await this.client.updateProfileStatus(
          this.config.isDevelopment ? 'maintenance' : 'call = block'
        )
        this.condition = 'connected'
        this.log('Connected to WhatsApp')
      }
    })
    this.ev.on('creds.update', saveState)

    return this.client
  }

  public utils = new Utils()

  public DB = new Database()

  public config: IConfig

  public contact = new Contact(this)

  public conversations: any = {}

  public correctJid = (jid: string): string =>
    `${jid.split('@')[0].split(':')[0]}@s.whatsapp.net`

  public assets = new Map<string, Buffer>()

  public log = (text: string, error: boolean = false): void =>
    console.log(
      chalk[error ? 'red' : 'blue'](
        `[${this.config.session.toUpperCase()}]`
      ),
      chalk[error ? 'redBright' : 'greenBright'](text)
    )

  public QR!: Buffer

  public condition!: 'connected' | 'connecting' | 'logged_out'
  public end!: client['end']
  public ev!: client['ev']
  public fetchBlocklist!: client['fetchBlocklist']
  public fetchPrivacySettings!: client['fetchPrivacySettings']
  public fetchStatus!: client['fetchStatus']
  public generateMessageTag!: client['generateMessageTag']
  public getBusinessProfile!: client['getBusinessProfile']
  public getCatalog!: client['getCatalog']
  public getCollections!: client['getCollections']
  public getOrderDetails!: client['getOrderDetails']
  public groupAcceptInvite!: client['groupAcceptInvite']
  public groupAcceptInviteV4!: client['groupAcceptInviteV4']
  public groupInviteCode!: client['groupInviteCode']
  public groupLeave!: client['groupLeave']
  public groupMetadata!: client['groupMetadata']
  public groupCreate!: client['groupCreate']
  public groupFetchAllParticipating!: client['groupFetchAllParticipating']
  public groupGetInviteInfo!: client['groupGetInviteInfo']
  public groupRevokeInvite!: client['groupRevokeInvite']
  public groupSettingUpdate!: client['groupSettingUpdate']
  public groupToggleEphemeral!: client['groupToggleEphemeral']
  public groupUpdateDescription!: client['groupUpdateDescription']
  public groupUpdateSubject!: client['groupUpdateSubject']
  public groupParticipantsUpdate!: client['groupParticipantsUpdate']
  public logout!: client['logout']
  public presenceSubscribe!: client['presenceSubscribe']
  public productDelete!: client['productDelete']
  public productCreate!: client['productCreate']
  public productUpdate!: client['productUpdate']
  public profilePictureUrl!: client['profilePictureUrl']
  public updateMediaMessage!: client['updateMediaMessage']
  public query!: client['query']
  public readMessages!: client['readMessages']
  public refreshMediaConn!: client['refreshMediaConn']
  public relayMessage!: client['relayMessage']
  public resyncAppState!: client['resyncAppState']
  public resyncMainAppState!: client['resyncMainAppState']
  public sendMessageAck!: client['sendMessageAck']
  public sendNode!: client['sendNode']
  public sendRawMessage!: client['sendRawMessage']
  public sendRetryRequest!: client['sendRetryRequest']
  public sendMessage!: client['sendMessage']
  public sendPresenceUpdate!: client['sendPresenceUpdate']
  public sendReceipt!: client['sendReceipt']
  public type!: client['type']
  public updateBlockStatus!: client['updateBlockStatus']
  public onUnexpectedError!: client['onUnexpectedError']
  public onWhatsApp!: client['onWhatsApp']
  public uploadPreKeys!: client['uploadPreKeys']
  public updateProfilePicture!: client['updateProfilePicture']
  public user!: client['user']
  public ws!: client['ws']
  public waitForMessage!: client['waitForMessage']
  public waitForSocketOpen!: client['waitForSocketOpen']
  public waitForConnectionUpdate!: client['waitForConnectionUpdate']
  public waUploadToServer!: client['waUploadToServer']
  public getPrivacyTokens!: client['getPrivacyTokens']
  public assertSessions!: client['assertSessions']
  public processingMutex!: client['processingMutex']
  public appPatch!: client['appPatch']
  public authState!: client['authState']
  public upsertMessage!: client['upsertMessage']
  public updateProfileStatus!: client['updateProfileStatus']
  public chatModify!: client['chatModify']
}

type Events = {
  new_call: (call: { from: string }) => void
  new_message: (M: Message) => void
  participants_update: (event: IEvent) => void
  new_group_joined: (group: { jid: string; subject: string }) => void
}
