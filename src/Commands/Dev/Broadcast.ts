import { proto } from '@adiwajshing/baileys'
import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('broadcast', {
  description: 'Broadcast pesan ke semua kontak',
  category: 'dev',
  usage: '!broadcast [text]',
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { context }: IArgs
  ): Promise<void> => {
    if (!context)
      return void M.reply(
        'Masukkan text untuk yang akan di broadcast!'
      )

    let imgBuffer!: Buffer
    if (M.hasSupportedMediaMessage) {
      imgBuffer = await M.downloadMediaMessage(
        M.message.message as proto.IMessage
      )
    }

    const users = await this.client.DB.getContactsForBroadcast()

    for await (const user of users) {
      let text = `*Pemberitahuan*\n\nHallo *${user.notify}*\n\n${context}\n\nJika anda tidak ingin menerima pesan pemberitahuan seperti ini, gunakan !nobroadcast`
      await this.client.sendMessage(
        user.id,
        imgBuffer
          ? {
              image: imgBuffer,
              caption: text
            }
          : {
              text
            }
      )
    }

    return void M.reply('Berhasil')
  }
}
