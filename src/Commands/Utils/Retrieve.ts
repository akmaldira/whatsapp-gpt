import { BaseCommand, Command, Message } from '../../Structures'

@Command('view', {
  description: 'Menjadikan media pesan sekali lihat',
  category: 'utils',
  usage: 'view [reply pesan sekali lihat]',
  cooldown: 10,
  exp: 40
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    if (!M.quoted || M.quoted.type !== 'viewOnceMessageV2')
      return void M.reply(
        'Reply pesan sekali lihat untuk dijadikan media'
      )
    const buffer = await M.downloadMediaMessage(M.quoted.message)
    const type = Object.keys(
      M.quoted.message.viewOnceMessageV2?.message || {}
    )[0].replace('Message', '') as 'image' | 'video'
    return void (await M.reply(buffer, type))
  }
}
