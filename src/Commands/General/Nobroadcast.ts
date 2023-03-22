import { BaseCommand, Command, Message } from '../../Structures'

@Command('nobroadcast', {
  description: 'Menonaktifkan pemberitahuan bot',
  category: 'utils',
  usage: '!nobroadcast',
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    await this.client.DB.updateContactBroadcast(M.from, false)

    return void M.reply('Berhasil')
  }
}
