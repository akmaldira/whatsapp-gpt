import { proto } from '@adiwajshing/baileys'
import { GoogleAPI } from '../../lib/GoogleAPI'
import { OpenAI } from '../../lib/OpenAI'
import { BaseCommand, Command, Message } from '../../Structures'

@Command('imggpt', {
  description: 'Menggunakan Chat GPT dari gambar yang berisi text',
  category: 'ai',
  usage: 'imggpt [reply gambar atau kirim gambar]',
  aliases: ['gptimg'],
  cooldown: 20,
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    if (
      !M.hasSupportedMediaMessage &&
      !M.quoted?.hasSupportedMediaMessage
    )
      return void M.reply('Media tidak ditemukan')

    let buffer!: Buffer
    if (M.hasSupportedMediaMessage) {
      buffer = await M.downloadMediaMessage(
        M.message.message as proto.IMessage
      )
    } else if (M.quoted && M.quoted.hasSupportedMediaMessage) {
      buffer = await M.downloadMediaMessage(M.quoted.message)
    }

    const googleApi = new GoogleAPI()
    const question = await googleApi.imageToText(buffer)
    if (question.length < 1)
      return void M.reply('Text tidak ditemukan')
    const openai = new OpenAI(
      this.client.config.openAIAPIKey,
      this.client.config.organization,
      this.client.config.chatGPTOption
    )

    const response = await openai.ask(M.from, question)
    return void M.reply(response)
  }
}
