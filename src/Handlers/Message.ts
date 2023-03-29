import chalk from 'chalk'
import { readdirSync } from 'fs-extra'
import { join } from 'path'
import { BaseCommand, Client, Message } from '../Structures'
import { IArgs, ICommand } from '../Types'
import AudioMessage from './AudioMessage'
import FindBadword from './FIndBadword'

export class MessageHandler {
  constructor(private client: Client) {}

  public handleMessage = async (M: Message): Promise<void> => {
    const { prefix } = this.client.config
    const args = M.content.split(' ')
    const title =
      M.chat === 'group' ? M.groupMetadata?.subject || 'Group' : 'DM'
    await this.moderate(M)

    if (args[0].startsWith(prefix)) {
      const { filterUser, owners } = await this.client.DB.getSession(
        this.client.config.session
      )

      if (filterUser) {
        if (
          owners.includes(M.from.split('@')[0]) &&
          args[0] === '!addwl'
        ) {
          if (!args[1])
            return void M.reply(
              'Masukkan nomor yang ingin didaftarkan\n\nHarus menggunakan kode negara\nExample: 62896xxxxxx'
            )

          const whitelist = await this.client.DB.getWhitelist(
            this.client.config.session
          )

          if (whitelist.includes(args[1]))
            return void M.reply('Nomor telah terdaftar')

          const updateWl = await this.client.DB.addWhitelist(
            this.client.config.session,
            args[1]
          )

          let text = `Berhasil menambah ${args[1]}\n\nList whitelist anda\n\n`

          updateWl.map((wl, i) => (text += `${i + 1}. ${wl}\n`))

          return void M.reply(text)
        } else if (
          owners.includes(M.from.split('@')[0]) &&
          args[0] === '!listwl'
        ) {
          const whitelist = await this.client.DB.getWhitelist(
            this.client.config.session
          )

          let text = 'List whitelist\n\n'

          whitelist.map((wl, i) => (text += `${i + 1}. ${wl}\n`))

          return void M.reply(text)
        } else if (
          owners.includes(M.from.split('@')[0]) &&
          args[0] === '!deletewl'
        ) {
          if (!args[1])
            return void M.reply('Masukkan nomor yang akan dihapus')

          const whitelist = await this.client.DB.getWhitelist(
            this.client.config.session
          )

          if (!whitelist.includes(args[1]))
            return void M.reply('Nomor sebelumnya tidak terdaftar')
          await this.client.DB.deleteWhitelist(
            this.client.config.session,
            args[1]
          )

          return void M.reply(`Berhasil menghapus ${args[1]}`)
        }

        const whitelist = await this.client.DB.getWhitelist(
          this.client.config.session
        )

        if (!whitelist.includes(M.from.split('@')[0]))
          return void M.reply('Hai, kamu mau ngapain?')
      }
    }

    if (!args[0] || !args[0].startsWith(prefix)) {
      const { voicegpt, badword } = await this.client.DB.getGroup(
        M.from
      )

      if (
        !M.message.key.fromMe &&
        M.message.message?.audioMessage &&
        this.client.config.googleApiEnable
      ) {
        let voiceGropuEnable = false
        if (M.chat === 'group') voiceGropuEnable = voicegpt
        if (M.chat === 'dm' || voiceGropuEnable) {
          const handler = new AudioMessage(
            M,
            this.client.config.openAIAPIKey,
            this.client.config.organization,
            this.client.config.chatGPTOption,
            this.client.config.googleApiOption,
            this.client.config.chatGPTSystem
          )
          handler.execute()
        }
      }

      if (
        badword &&
        !M.message.key.fromMe &&
        !M.sender.isMod &&
        !M.sender.isAdmin &&
        (M.message.message?.extendedTextMessage?.text ||
          M.message.message?.conversation)
      ) {
        const handler = new FindBadword(this.client.DB)
        handler.execute(M)
      }

      return
      //  void this.client.log(
      //   `${chalk.cyanBright('Message')} from ${chalk.yellowBright(
      //     M.sender.username
      //   )} in ${chalk.blueBright(title)}`
      // )
    }
    this.client.log(
      `${chalk.cyanBright(
        `Command ${args[0]}[${args.length - 1}]`
      )} from ${chalk.yellowBright(
        M.sender.username
      )} in ${chalk.blueBright(`${title}`)}`
    )
    const { banned, tag } = await this.client.DB.getUser(M.sender.jid)
    if (banned)
      return void M.reply(
        'Kamu telah diblokir untuk menggunakan perintah ini'
      )
    if (!tag)
      await this.client.DB.updateUser(
        M.sender.jid,
        'tag',
        'set',
        this.client.utils.generateRandomUniqueTag()
      )
    const cmd = args[0].toLowerCase().slice(prefix.length)
    const command = this.commands.get(cmd) || this.aliases.get(cmd)
    if (!command) return void M.reply('Perintah tidak ditemukan')
    const disabledCommands =
      await this.client.DB.getDisabledCommands()
    const index = disabledCommands.findIndex(
      (CMD) => CMD.command === command.name
    )
    if (index >= 0)
      return void M.reply(
        `*${this.client.utils.capitalize(
          cmd
        )}* Telah didisable oleh *${
          disabledCommands[index].disabledBy
        }* pada *${
          disabledCommands[index].time
        } (GMT)*. ❓ *Reason:* ${disabledCommands[index].reason}`
      )
    if (
      command.config.category === 'dev' &&
      !this.client.config.mods.includes(M.sender.jid)
    )
      return void M.reply(
        'Perintah ini hanya bisa digunakan oleh MODS'
      )
    if (
      this.client.config.isDevelopment &&
      !this.client.config.mods.includes(M.sender.jid)
    ) {
      return void M.reply(
        'Bot sedang dalam *maintenance*, harap bersabar'
      )
    }
    if (M.chat === 'dm' && !command.config.dm)
      return void M.reply(
        'Perintah ini hanya bisa digunakan didalam grup'
      )
    if (command.config.category === 'moderation' && !M.sender.isAdmin)
      return void M.reply(
        'Perintah ini hanya bisa digunakan oleh admin grup'
      )
    const { nsfw } = await this.client.DB.getGroup(M.from)
    if (command.config.category === 'nsfw' && !nsfw)
      return void M.reply('Perintah ini tidak diizinkan di grup ini')
    const cooldownAmount = (command.config.cooldown ?? 3) * 1000
    const time = cooldownAmount + Date.now()
    if (
      !M.sender.isMod &&
      this.cooldowns.has(`${M.sender.jid}${command.name}`)
    ) {
      const cd = this.cooldowns.get(`${M.sender.jid}${command.name}`)
      const remainingTime = this.client.utils.convertMs(
        (cd as number) - Date.now()
      )
      return void M.reply(
        `Tolong tunggu *${remainingTime}* ${
          remainingTime > 1 ? 'seconds' : 'second'
        } untuk menggunakan perintah lagi`
      )
    } else this.cooldowns.set(`${M.sender.jid}${command.name}`, time)
    setTimeout(
      () => this.cooldowns.delete(`${M.sender.jid}${command.name}`),
      cooldownAmount
    )
    try {
      await command.execute(M, this.formatArgs(args))
    } catch (error) {
      this.client.log((error as any).message, true)
    }
  }

  private moderate = async (M: Message): Promise<void> => {
    if (M.chat !== 'group') return void null
    const { mods } = await this.client.DB.getGroup(M.from)
    const isAdmin = M.groupMetadata?.admins?.includes(
      this.client.correctJid(this.client.user?.id || '')
    )
    if (!mods || M.sender.isAdmin || !isAdmin) return void null
    const urls = this.client.utils.extractUrls(M.content)
    if (urls.length > 0) {
      const groupinvites = urls.filter((url) =>
        url.includes('chat.whatsapp.com')
      )
      if (groupinvites.length > 0) {
        groupinvites.forEach(async (invite) => {
          const code = await this.client.groupInviteCode(M.from)
          const inviteSplit = invite.split('/')
          if (inviteSplit[inviteSplit.length - 1] !== code) {
            this.client.log(
              `${chalk.blueBright('MOD')} ${chalk.green(
                'Group Invite'
              )} by ${chalk.yellow(
                M.sender.username
              )} in ${chalk.cyanBright(
                M.groupMetadata?.subject || 'Group'
              )}`
            )
            return void (await this.client.groupParticipantsUpdate(
              M.from,
              [M.sender.jid],
              'remove'
            ))
          }
        })
      }
    }
  }

  private formatArgs = (args: string[]): IArgs => {
    args.splice(0, 1)
    return {
      args,
      context: args.join(' ').trim(),
      flags: args.filter((arg) => arg.startsWith('--'))
    }
  }

  public loadCommands = (): void => {
    this.client.log('Loading Commands...')
    const files = readdirSync(join(...this.path)).filter(
      (file) => !file.startsWith('_')
    )
    for (const file of files) {
      this.path.push(file)
      const Commands = readdirSync(join(...this.path))
      for (const Command of Commands) {
        this.path.push(Command)
        const command: BaseCommand = new (require(join(
          ...this.path
        )).default)()
        command.client = this.client
        command.handler = this
        this.commands.set(command.name, command)
        if (command.config.aliases)
          command.config.aliases.forEach((alias) =>
            this.aliases.set(alias, command)
          )
        this.client.log(
          `Loaded: ${chalk.yellowBright(
            command.name
          )} from ${chalk.cyanBright(command.config.category)}`
        )
        this.path.splice(this.path.indexOf(Command), 1)
      }
      this.path.splice(this.path.indexOf(file), 1)
    }
    return this.client.log(
      `Successfully loaded ${chalk.cyanBright(this.commands.size)} ${
        this.commands.size > 1 ? 'commands' : 'command'
      } with ${chalk.yellowBright(this.aliases.size)} ${
        this.aliases.size > 1 ? 'aliases' : 'alias'
      }`
    )
  }

  public commands = new Map<string, ICommand>()

  public aliases = new Map<string, ICommand>()

  private cooldowns = new Map<string, number>()

  private path = [__dirname, '..', 'Commands']
}
