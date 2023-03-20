import { BaseCommand, Command, Message } from '../../Structures'

@Command('profile', {
  description: "Displays user's profile",
  category: 'general',
  cooldown: 15,
  usage: 'profile [tag/quote users]'
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    const users = M.mentioned
    if (M.quoted && !users.includes(M.quoted.sender.jid))
      users.push(M.quoted.sender.jid)
    while (users.length < 1) users.push(M.sender.jid)
    const user = users[0]
    const username =
      user === M.sender.jid
        ? M.sender.username
        : this.client.contact.getContact(user).username
    let pfpUrl: string | undefined
    try {
      pfpUrl = await this.client.profilePictureUrl(user, 'image')
    } catch {
      pfpUrl = undefined
    }
    const pfp = pfpUrl
      ? await this.client.utils.getBuffer(pfpUrl)
      : (this.client.assets.get('404') as Buffer)
    let bio!: string
    try {
      bio = (await this.client.fetchStatus(user))?.status || ''
    } catch (error) {
      bio = ''
    }
    const { jid, banned, tag } = await this.client.DB.getUser(user)
    const admin = this.client.utils.capitalize(
      `${M.groupMetadata?.admins?.includes(user) || false}`
    )
    return void M.reply(
      pfp,
      'image',
      undefined,
      undefined,
      `*Username:* ${username}#${tag}\n\n*Bio:* ${bio}\n\n*Admin:* ${admin}\n\n*Banned:* ${this.client.utils.capitalize(
        `${banned || false}`
      )}`
    )
  }
}
