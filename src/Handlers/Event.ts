import { delay } from '@adiwajshing/baileys'
import chalk from 'chalk'
import { Client } from '../Structures'
import { IEvent } from '../Types'

export class EventHandler {
  constructor(private client: Client) {}

  public handleEvents = async (event: IEvent): Promise<void> => {
    let group: { subject: string; description: string } = {
      subject: '',
      description: ''
    }
    await delay(1500)
    await this.client
      .groupMetadata(event.jid)
      .then((res) => {
        group.subject = res.subject
        group.description = res.desc || 'No Description'
      })
      .catch(() => {
        group.subject = '__'
        group.description = ''
      })
    await this.client.chatModify({ mute: +1 }, event.jid)
    this.client.log(
      `${chalk.blueBright('EVENT')} ${chalk.green(
        `${this.client.utils.capitalize(event.action)}[${
          event.participants.length
        }]`
      )} in ${chalk.cyanBright(`$`)}`
    )
    const { events } = await this.client.DB.getGroup(event.jid)
    if (
      !events ||
      (event.action === 'remove' &&
        event.participants.includes(
          `${
            (this.client.user?.id || '').split('@')[0].split(':')[0]
          }@s.whatsapp.net`
        ))
    )
      return void null
    const text =
      event.action === 'add'
        ? `- ${group.subject} -\n\n💈 *Deskripsi grup:*\n${
            group.description
          }\n\nTolong patuhi peraturan group ini!\n\n*‣ ${event.participants
            .map((jid) => `@${jid.split('@')[0]}`)
            .join(' ')}*`
        : event.action === 'remove'
        ? `Selamat tinggal *${event.participants
            .map((jid) => `@${jid.split('@')[0]}`)
            .join(', ')}* 👋🏻`
        : event.action === 'demote'
        ? `Ara Ara, looks like *@${
            event.participants[0].split('@')[0]
          }* got Demoted`
        : `Selamat *@${
            event.participants[0].split('@')[0]
          }*, kamu sekarang adalah admin`
    if (event.action === 'add') {
      let imageUrl: string | undefined
      try {
        imageUrl = await this.client.profilePictureUrl(event.jid)
      } catch (error) {
        imageUrl = undefined
      }
      const image = imageUrl
        ? await this.client.utils.getBuffer(imageUrl)
        : (this.client.assets.get('404') as Buffer)
      return void (await this.client.sendMessage(event.jid, {
        image: image,
        mentions: event.participants,
        caption: text
      }))
    }
    return void (await this.client.sendMessage(event.jid, {
      text,
      mentions: event.participants
    }))
  }

  public sendMessageOnJoiningGroup = async (group: {
    subject: string
    jid: string
  }): Promise<void> => {
    this.client.log(
      `${chalk.blueBright('JOINED')} ${chalk.cyanBright(
        group.subject
      )}`
    )
    return void (await this.client.sendMessage(group.jid, {
      text: `Terimakasih telah menambahkan saya. Gunakan perintah *${this.client.config.prefix}help* untuk memulai.`
    }))
  }
}
