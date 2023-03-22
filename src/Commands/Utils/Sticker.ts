import { proto } from '@adiwajshing/baileys'
import { Categories, Sticker } from 'wa-sticker-formatter'
import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('sticker', {
  description: 'Konversi Gambar/Video/Gif menjadi sticker',
  category: 'utils',
  cooldown: 10,
  usage:
    'sticker [caption/reply pesan yang mengandung media] [options] | <pack> | <author>',
  aliases: ['s', 'stiker'],
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { flags, context }: IArgs
  ): Promise<void> => {
    if (
      !M.hasSupportedMediaMessage &&
      !M.quoted?.hasSupportedMediaMessage
    )
      return void M.reply('Media tidak ditemukan')
    let buffer!: Buffer
    if (M.hasSupportedMediaMessage)
      buffer = await M.downloadMediaMessage(
        M.message.message as proto.IMessage
      )
    else if (M.quoted && M.quoted.hasSupportedMediaMessage)
      buffer = await M.downloadMediaMessage(M.quoted.message)
    flags.forEach((flag) => (context = context.replace(flag, '')))
    const numbersFlag = this.client.utils
      .extractNumbers(flags.join(' ').replace(/\--/g, ''))
      .filter((number) => number > 0 && number <= 100)
    const quality =
      numbersFlag[0] ||
      this.getQualityFromType(
        flags.filter((flag) => this.qualityTypes.includes(flag))
      ) ||
      50
    const categories = this.getStickerEmojisFromCategories(flags)
    const pack = context.split('|')
    const sticker = new Sticker(buffer, {
      categories,
      pack: pack[1] ? pack[1].trim() : '🤍 Made for u',
      author: pack[2]
        ? pack[2].trim()
        : `${this.client.config.name} 🖤`,
      quality,
      type:
        flags.includes('--c') ||
        flags.includes('--crop') ||
        flags.includes('--cropped')
          ? 'crop'
          : flags.includes('--s') ||
            flags.includes('--stretch') ||
            flags.includes('--stretched')
          ? 'default'
          : flags.includes('--circle') ||
            flags.includes('--r') ||
            flags.includes('--round') ||
            flags.includes('--rounded')
          ? 'circle'
          : 'full'
    })
    return void (await M.reply(await sticker.build(), 'sticker'))
  }

  private qualityTypes = ['--low', '--broke', '--medium', '--high']

  private getQualityFromType = (
    types: string[]
  ): number | undefined => {
    if (!types[0]) return
    for (const type of types) {
      switch (type) {
        case '--broke':
          return 1
        case '--low':
          return 10
        case '--medium':
          return 50
        case '--high':
          return 100
      }
    }
  }

  private getStickerEmojisFromCategories = (
    flags: string[]
  ): Categories[] => {
    const categories: Categories[] = []
    for (const flag of flags) {
      if (categories.length >= 3) return categories
      switch (flag) {
        case '--angry':
          categories.push('💢')
          break
        case '--happy':
          categories.push('😄')
          break
        case '--sad':
          categories.push('😭')
          break
        case '--love':
          categories.push('❤️')
          break
        case '--celebrate':
          categories.push('🎉')
          break
        case '--greet':
          categories.push('👋')
          break
      }
    }
    if (categories.length < 1) categories.push('✨', '💗')
    return categories
  }
}
