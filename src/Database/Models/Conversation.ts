import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum
} from 'openai'

export class ConversationSchema {
  @prop({ type: String, required: true, unique: true })
  public id: string

  @prop({ type: () => ConversationData, required: true, default: [] })
  public data!: ConversationData[]
}

class ConversationData implements ChatCompletionRequestMessage {
  @prop({ type: String, required: true })
  public role!: ChatCompletionRequestMessageRoleEnum

  @prop({ type: String, require: true })
  public content!: string

  @prop({ type: String })
  public name?: string
}

export type TConversationModel = ConversationSchema & Document

export const conversationSchema = getModelForClass(ConversationSchema)
