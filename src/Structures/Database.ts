import { Contact } from '@adiwajshing/baileys'
import {
  contactSchema,
  disabledCommandsSchema,
  groupSchema,
  GroupSchema,
  sessionSchema,
  TCommandModel,
  TGroupModel,
  TSessionModel,
  TUserModel,
  userSchema,
  UserSchema
} from '../Database'
import {
  conversationSchema,
  TConversationModel
} from '../Database/Models/Conversation'
import { Utils } from '../lib'
import { IConversation } from '../lib/OpenAI'

export class Database {
  public getUser = async (jid: string): Promise<TUserModel> =>
    (await this.user.findOne({ jid })) ||
    (await new this.user({
      jid,
      tag: this.utils.generateRandomUniqueTag()
    }).save())

  public updateBanStatus = async (
    jid: string,
    action: 'ban' | 'unban' = 'ban'
  ): Promise<void> => {
    await this.updateUser(jid, 'banned', 'set', action === 'ban')
  }

  public updateUser = async (
    jid: string,
    field: keyof UserSchema,
    method: 'inc' | 'set',
    update: UserSchema[typeof field]
  ): Promise<void> => {
    await this.getUser(jid)
    await this.user.updateOne(
      { jid },
      { [`$${method}`]: { [field]: update } }
    )
  }

  public getGroup = async (jid: string): Promise<TGroupModel> =>
    (await this.group.findOne({ jid })) ||
    (await new this.group({ jid }).save())

  public updateGroup = async (
    jid: string,
    field: keyof GroupSchema,
    update: boolean
  ): Promise<void> => {
    await this.getGroup(jid)
    await this.group.updateOne({ jid }, { $set: { [field]: update } })
  }

  public getSession = async (
    sessionId: string
  ): Promise<TSessionModel | null> =>
    await this.session.findOne({ sessionId })

  public saveNewSession = async (
    sessionId: string
  ): Promise<void> => {
    await new this.session({ sessionId }).save()
  }

  public updateSession = async (
    sessionId: string,
    session: string
  ): Promise<void> => {
    await this.session.updateOne({ sessionId }, { $set: { session } })
  }

  public removeSession = async (sessionId: string): Promise<void> => {
    await this.session.deleteOne({ sessionId })
  }

  public getContacts = async (): Promise<Contact[]> => {
    let result = await this.contact.findOne({ ID: 'contacts' })
    if (!result)
      result = await new this.contact({ ID: 'contacts' }).save()
    return result.data
  }

  public getDisabledCommands = async (): Promise<
    TCommandModel['disabledCommands']
  > => {
    let result = await this.disabledCommands.findOne({
      title: 'commands'
    })
    if (!result)
      result = await new this.disabledCommands({
        title: 'commands'
      }).save()
    return result.disabledCommands
  }

  public updateDisabledCommands = async (
    update: TCommandModel['disabledCommands']
  ): Promise<void> => {
    await this.getDisabledCommands()
    await this.disabledCommands.updateOne(
      { title: 'commands' },
      { $set: { disabledCommands: update } }
    )
  }

  public createConversation = async (
    conversation: IConversation
  ): Promise<TConversationModel> => {
    return await this.conversation.create(conversation)
  }

  public getConversation = async (
    id: string
  ): Promise<TConversationModel | null> => {
    return await this.conversation.findOne({ id })
  }

  public resetConversation = async (): Promise<void> => {
    await this.conversation.deleteMany()
  }
  private utils = new Utils()

  public user = userSchema

  public group = groupSchema

  public contact = contactSchema

  public session = sessionSchema

  public disabledCommands = disabledCommandsSchema

  public conversation = conversationSchema
}

type valueof<T> = T[keyof T]
