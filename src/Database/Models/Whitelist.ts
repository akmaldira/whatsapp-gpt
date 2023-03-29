import { getModelForClass, prop } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class Whitelist {
  @prop({ type: String, required: true, unique: true })
  public session!: string

  @prop({ type: () => String, required: true, default: [] })
  public data!: string[]
}

export type TWhitelistModel = Whitelist & Document

export const whitelistSchema = getModelForClass(Whitelist)
