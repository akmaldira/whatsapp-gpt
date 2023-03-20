import { BaseCommand, Command, Message } from '../../Structures'

@Command('react', {
  category: 'utils',
  description: 'Reacts pesan dengan emoji',
  usage: 'react [emoji] || react [emoji] [quote a message]',
  cooldown: 5
})
export default class extends BaseCommand {
  public override execute = async ({
    react,
    reply,
    quoted,
    emojis,
    message
  }: Message): Promise<void> => {
    if (!emojis.length)
      return void reply('Masukkan emoji untuk react')
    const key = quoted ? quoted.key : message.key
    return void (await react(emojis[0], key))
  }
}
