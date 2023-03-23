import { OpenAI } from '../../lib/OpenAI'
import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'
let conversations: any = {}

@Command('gpt', {
  description: 'Menggunakan Chat GPT',
  category: 'ai',
  usage: 'gpt [text]',
  aliases: ['ai'],
  cooldown: 20,
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { context }: IArgs
  ): Promise<void> => {
    if (!context)
      return void M.reply('Masukkan text untuk menggunakan Chat GPT!')
    const question = context.trim()

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
