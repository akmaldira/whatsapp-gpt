import { BaseCommand, Command, Message } from '../../Structures'

@Command('unban', {
  description: 'Unban pengguna',
  category: 'dev',
  cooldown: 5,
  usage: 'unban [tag/quote users]'
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    const users = M.mentioned
    if (M.quoted && !users.includes(M.quoted.sender.jid))
      users.push(M.quoted.sender.jid)
    if (users.length < 1) {
      return void M.reply('Tag atau reply user yang akan di unban')
    }
    let text = 'Status unban\n\n'
    for (const user of users) {
      const info = await this.client.DB.getUser(user)

      if (!info.banned) {
        text += `*@${
          user.split('@')[0]
        }* (Gagal karena tidak terbanned)`
        continue
      }
      text += `*@${user.split('@')[0]}* (Berhasil)`
      await this.client.DB.updateBanStatus(user, 'unban')
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
