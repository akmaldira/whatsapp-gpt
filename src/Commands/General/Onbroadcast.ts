import { BaseCommand, Command, Message } from '../../Structures'

@Command('onbroadcast', {
  description: 'Mengaktifkan pemberitahuan bot',
  category: 'utils',
  usage: '!onbroadcast',
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    await this.client.DB.updateContactBroadcast(M.from, true)

    return void M.reply('Berhasil')
  }
}
