import { BaseCommand, Command, Message } from '../../Structures'

@Command('resetgpt', {
  description: 'Mereset data chat user',
  category: 'dev',
  cooldown: 5,
  usage: 'resetgpt [tag/quote users]'
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    await this.client.DB.resetConversation()
    return void (await M.reply('Berhasil'))
  }
}
