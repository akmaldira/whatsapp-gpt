import { proto } from '@adiwajshing/baileys'
import { BaseCommand, Command, Message } from '../../Structures'
import { Color, IArgs } from '../../Types'
let conversations: any = {}

@Command('removebg', {
  description: 'Menghapus background gambar',
  category: 'utils',
  usage: 'removebg',
  cooldown: 20,
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { context }: IArgs
  ): Promise<void> => {
    if (
      !M.hasSupportedMediaMessage &&
      !M.quoted?.hasSupportedMediaMessage
    )
      return void M.reply('Media tidak ditemukan')

    if (
      M.message.message?.imageMessage ||
      M.quoted.message?.imageMessage
    ) {
      let buffer: Buffer
      if (M.hasSupportedMediaMessage)
        buffer = await M.downloadMediaMessage(
          M.message.message as proto.IMessage
        )
      else if (M.quoted && M.quoted.hasSupportedMediaMessage)
        buffer = await M.downloadMediaMessage(M.quoted.message)

      const colors = Object.keys(Color).filter((v) =>
        isNaN(Number(v))
      )

      const color = context as keyof typeof Color

      let undefinedColorText =
        'Warna tidak tersedia, silakan salah satu warna dari\n'

      if (context && !colors.includes(color)) {
        for (const x of colors) {
          undefinedColorText += `\n${x}`
        }
        return void M.reply(undefinedColorText)
      }

      const removeBg = await this.client.utils.removeBg(
        this.client.config.removeBgKey,
        buffer,
        color
      )
      if (typeof removeBg === 'string') return void M.reply(removeBg)

      return void M.reply(removeBg, 'image')
    }
  }
}
