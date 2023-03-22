import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('report', {
  description: 'Melaporkan bug bot',
  category: 'general',
  usage: '!report [message] optional [image]',
  cooldown: 15
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { context }: IArgs
  ): Promise<void> => {
    if (!context) {
      return void M.reply('Pesan tidak boleh kosong')
    }
    const bot = this.client.correctJid(this.client.user?.id || '')
    const isAdmin = M.groupMetadata?.admins?.includes(bot)
    if (M.quoted.sender.jid !== bot && !isAdmin)
      return void M.reply(
        'Saya tidak memiliki akses untuk menghapus pesan, tolong jadikan saya admin'
      )
    return void (await this.client.sendMessage(M.from, {
      delete: M.quoted.key
    }))
  }
}
