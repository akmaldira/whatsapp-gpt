import { BaseCommand, Command, Message } from '../../Structures'

@Command('ban', {
  description: 'Membanned pengguna',
  category: 'moderation',
  cooldown: 5,
  usage: 'ban [tag/quote users]'
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    const users = M.mentioned
    if (M.quoted && !users.includes(M.quoted.sender.jid))
      users.push(M.quoted.sender.jid)
    if (users.length < 1)
      return void M.reply('Tag atau reply user yang akan diban')
    let text = 'Status banned\n\n'
    for (const user of users) {
      const info = await this.client.DB.getUser(user)
      if (this.client.config.mods.includes(user) || info.banned) {
        text += `*@${user.split('@')[0]}* (Gagal karena ${
          this.client.config.mods.includes(user)
            ? 'seorang moderator'
            : 'sudah dibanned'
        })\n`
        continue
      }
      text += `\n*@${user.split('@')[0]}* (Berhasil)`
      await this.client.DB.updateBanStatus(user, 'ban')
    }
    return void (await M.reply(
      text,
      'text',
      undefined,
      undefined,
      undefined,
      users
    ))
  }
}
