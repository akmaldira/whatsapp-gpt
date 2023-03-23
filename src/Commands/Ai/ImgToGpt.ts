import { proto } from '@adiwajshing/baileys'
import { GoogleAPI } from '../../lib/GoogleAPI'
import { OpenAI } from '../../lib/OpenAI'
import { BaseCommand, Command, Message } from '../../Structures'

@Command('imgtogpt', {
  description: 'Menggunakan Chat GPT dari gambar yang berisi text',
  category: 'ai',
  usage: 'imgtext [reply gambar atau kirim gambar]',
  aliases: ['textimg', 'imgtext'],
  cooldown: 20,
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    if (!this.client.config.googleApiEnable)
      return void M.reply('Fitur ini tidak diaktifkan')
    if (
      !M.hasSupportedMediaMessage &&
      !M.quoted?.hasSupportedMediaMessage
    )
      return void M.reply('Media tidak ditemukan')

    M.reply('*Processing!!!*')
    let buffer!: Buffer
    if (
      M.hasSupportedMediaMessage &&
      M.message.message.imageMessage
    ) {
      buffer = await M.downloadMediaMessage(
        M.message.message as proto.IMessage
      )
    } else if (
      M.quoted &&
      M.quoted.message.imageMessage &&
      M.quoted.hasSupportedMediaMessage
    ) {
      buffer = await M.downloadMediaMessage(M.quoted.message)
    } else {
      return void M.reply('Media tidak support!, hanya boleh gambar')
    }

    const googleApi = new GoogleAPI(
      this.client.config.googleApiOption
    )
    const question = await googleApi.imageToText(buffer)
    if (question.length < 1)
      return void M.reply('Text tidak ditemukan')
    const openai = new OpenAI(
      this.client.config.openAIAPIKey,
      this.client.config.organization,
      this.client.config.chatGPTOption,
      this.client.config.chatGPTSystem
    )

    const response = await openai.ask(M.from, question)
    return void M.reply(response)
  }
}
