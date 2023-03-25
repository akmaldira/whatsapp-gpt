import { BaseCommand, Command, Message } from '../../Structures'

@Command('kick', {
  description: 'Kick pengguna dari grup',
  category: 'moderation',
  cooldown: 5,
  usage: 'kick [tag/quote users]'
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    const users = M.mentioned
    if (M.quoted && !users.includes(M.quoted.sender.jid))
      users.push(M.quoted.sender.jid)
    if (users.length < 1)
      return void M.reply('Tag atau reply user yang akan dikick')

    const bot = this.client.correctJid(this.client.user?.id || '')
    const isAdmin = M.groupMetadata?.admins?.includes(bot)

    if (isAdmin) {
      await this.client.groupParticipantsUpdate(
        M.from,
        users,
        'remove'
      )

      return void (await M.reply('Berhasil'))
    }
    return void M.reply(
      'Saya tidak memiliki akses untuk mengeluarkan orang, tolong jadikan saya admin'
    )
  }
}
