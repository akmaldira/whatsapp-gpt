import { BaseCommand, Command, Message } from '../../Structures'
import { GroupFeatures, IArgs } from '../../Types'

@Command('set', {
  description: 'Aktifkan dan mematikan fitur grup',
  usage:
    'set --[feature]=[option]\nsee all feature !set\nexample : !set --badword=enable',
  cooldown: 5,
  category: 'moderation',
  aliases: ['feature']
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { flags }: IArgs
  ): Promise<void> => {
    const features = Object.keys(
      GroupFeatures
    ) as (keyof typeof GroupFeatures)[]
    if (!flags.length) {
      let text = '🍁 *Fitur yang tersedia*'
      for (const feature of features) {
        text += `\n\n*Fitur:* ${feature} \n*Deskripsi:* ${GroupFeatures[feature]}`
      }
      return void M.reply(text)
    } else {
      const options = flags[0].trim().toLowerCase().split('=')
      const feature = options[0]
        .toLowerCase()
        .replace('--', '') as keyof typeof GroupFeatures
      const actions = ['enable', 'disable']

      if (!features.includes(feature))
        return void M.reply(
          `Fitur tidak tersedia, untuk melihat fitur yang tersedia, ketik !set, contoh penggunaan !set voicegpt=enable`
        )
      const action = options[1]
      if (!action || !actions.includes(action))
        return void M.reply(
          `${
            action
              ? `Opsi yang dipilih harus salah satu dari: *${actions
                  .map(this.client.utils.capitalize)
                  .join(', ')}*.`
              : `Masukkan opsi yang akan dipilih.`
          } Contoh: *${
            this.client.config.prefix
          }set --${feature}=enable*`
        )
      const data = await this.client.DB.getGroup(M.from)
      if (
        (action === 'enable' && data[feature]) ||
        (action === 'disable' && !data[feature])
      )
        return void M.reply(
          `🟨 *${this.client.utils.capitalize(feature)} sudah ${
            action === 'enable' ? 'Enabled' : 'Disabled'
          }*`
        )
      await this.client.DB.updateGroup(
        M.from,
        feature,
        action === 'enable'
      )
      return void M.reply(
        `${
          action === 'enable' ? '🟩' : '🟥'
        } *${this.client.utils.capitalize(feature)} sekarang sudah ${
          action === 'enable' ? 'Enabled' : 'Disabled'
        }*`
      )
    }
  }
}
