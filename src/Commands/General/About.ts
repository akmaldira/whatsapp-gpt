import { BaseCommand, Command, Message } from '../../Structures'

@Command('about', {
  description: 'Menampilkan tentang bot ini',
  usage: 'about',
  category: 'general',
  cooldown: 20,
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (M: Message): Promise<void> => {
    let text =
      '*WhatsApp GPT*\n\nBot ini dibuat agar dapat membantu pengguna untuk menggunakan Chat GPT dengan berbagai fitur'
    text +=
      '\n\n*-* Jika terdapat masalah ataupun ingin meminta fitur baru, anda bisa grup whatsapp saya yang tertera dibawah, lalu bisa tag saya (@Akmal)'

    text +=
      '\n\n*-* Jika anda ingin ingin membangun whatsapp bot sendiri menggunakan script ini, anda bisa mengakses source code di'

    text += '\nhttps://github.com/akmaldira/whatsapp-gpt'

    text +=
      '\n\nAtau anda juga bisa join grup whatsapp saya untuk bertanya'

    text += '\nhttps://chat.whatsapp.com/DamD6Evs5vS5z32vxUkE3p'

    return void (await M.reply(text))
  }
}
