import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class SessionsSchema {
  @prop({ type: String, required: true, unique: true })
  public sessionId!: string

  @prop({ type: String })
  public session?: string

  @prop({ type: String })
  public aboutText?: string

  @prop({ type: String })
  public gptSystem?: string
}

export type TSessionModel = SessionsSchema & Document

export const sessionSchema = getModelForClass(SessionsSchema)
