import { google } from '@google-cloud/text-to-speech/build/protos/protos.js'
import { IChatGPTOption } from '../lib/OpenAI.js'

export interface IGoogleOption {
  voiceLanguage: string
  voiceGender: google.cloud.texttospeech.v1.SsmlVoiceGender
}

export interface IConfig {
  /**name of your bot */
  name: string
  /**prefix of your bot */
  prefix: string
  /**session of the bot */
  session: string
  /**api from brainshop for chat bot */
  chatBotUrl: string
  /**number of the users who's the bot admins of the bot */
  mods: string[]
  /**port number where the server will be started */
  PORT: number
  /**development mode */
  isDevelopment: boolean
  /**openai key */
  openAIAPIKey: string
  /**organization */
  organization: string
  /**chatgpt option */
  chatGPTOption: IChatGPTOption
  /**use google api */
  googleApiEnable: boolean
  /**google api option */
  googleApiOption: IGoogleOption
}
