import { BaseCommand, Command, Message } from '../../Structures'
import { IArgs } from '../../Types'

@Command('help', {
  description: 'Menampilkan perintah yang tersedia didalam bot',
  cooldown: 10,
  usage: 'help || help <command_name>',
  category: 'general',
  dm: true
})
export default class extends BaseCommand {
  public override execute = async (
    M: Message,
    { context }: IArgs
  ): Promise<void> => {
    if (!context) {
      let commands = Array.from(
        this.handler.commands,
        ([command, data]) => ({
          command,
          data
        })
      ).filter((command) => command.data.config.category !== 'dev')
      const { nsfw } = await this.client.DB.getGroup(M.from)
      if (!nsfw)
        commands = commands.filter(
          ({ data }) => data.config.category !== 'nsfw'
        )
      const buffer = this.client.assets.get('404') as Buffer
      let text = `Perintah yang tersedia di bot ini`
      const categories: string[] = []
      for (const command of commands) {
        if (categories.includes(command.data.config.category))
          continue
        categories.push(command.data.config.category)
      }
      for (const category of categories) {
        const categoryCommands: string[] = []
        const filteredCommands = commands.filter(
          (command) => command.data.config.category === category
        )
        text += `\n\n*${this.client.utils.capitalize(category)}*\n`
        filteredCommands.forEach((command) =>
          categoryCommands.push(command.data.name)
        )
        text += `❐ \`\`\`${categoryCommands.join(', ')}\`\`\``
      }
      text += `\n\n⚠️ *Note:* Gunakan ${this.client.config.prefix}help <command_name> untuk melihat cara penggunaan. Contoh: *${this.client.config.prefix}help gpt*`
      return void (await M.reply(
        buffer,
        'image',
        undefined,
        undefined,
        text,
        [M.sender.jid]
      ))
    } else {
      const cmd = context.trim().toLowerCase()
      const command =
        this.handler.commands.get(cmd) ||
        this.handler.aliases.get(cmd)
      if (!command)
        return void M.reply(
          `Perintah tidak ditemukan | *"${context.trim()}"*`
        )
      return void M.reply(
        `❗ *Perintah:* ${this.client.utils.capitalize(
          command.name
        )}\n🧩 *Kategori:* ${this.client.utils.capitalize(
          command.config.category
        )}\n⏰ *Timeout:* ${
          command.config.cooldown ?? 3
        }s\n🛠️ *Penggunaan:* ${command.config.usage
          .split('||')
          .map(
            (usage) => `${this.client.config.prefix}${usage.trim()}`
          )
          .join(' | ')}\n📚 *Deskripsi:* ${
          command.config.description
        }`
      )
    }
  }
}
