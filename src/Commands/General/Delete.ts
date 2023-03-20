import { BaseCommand, Command, Message } from '../../Structures'

@Command('delete', {
  description: 'Menghapus pesan yang di reply',
  category: 'general',
  usage: 'delete [quote_message]',
  cooldown: 15
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    if (!M.quoted)
      return void M.reply('Reply pesan yang ingin dihapus!')
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
