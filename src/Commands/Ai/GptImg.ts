import { OpenAI } from '../../lib/OpenAI'
import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'
let conversations: any = {}

@Command('gptimg', {
  description: 'Generate gambar dari Chat GPT',
  category: 'ai',
  usage: 'gptimg [text]',
  aliases: ['aiimg'],
  cooldown: 20,
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { context }: IArgs
  ): Promise<void> => {
    if (!context)
      return void M.reply(
        'Masukkan gambar seperti apa yang akan digenerate!'
      )
    const prompt = context.trim()

    const openai = new OpenAI(
      this.client.config.openAIAPIKey,
      this.client.config.organization,
      this.client.config.chatGPTOption,
      this.client.config.chatGPTSystem
    )

    await M.reply('*Processing!!!*')

    const imgUrl = await openai.generateImg(prompt)

    if (imgUrl.length > 1) {
      for (const url of imgUrl) {
        await M.reply(url, 'image')
      }
    } else {
      return void M.reply(
        imgUrl[0],
        'image',
        undefined,
        undefined,
        '*Result*',
        [M.sender.jid]
      )
    }
  }
}
