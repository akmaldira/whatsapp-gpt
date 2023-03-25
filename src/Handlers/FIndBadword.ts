import Constanta from '../lib/Constanta'
import { Database, Message } from '../Structures'

export default class FindBadword {
  private badword: string[]

  private database: Database

  private maxBadWord: number = 3

  constructor(database: Database) {
    this.badword = Constanta.badword
    this.database = database
  }

  public execute = async (M: Message): Promise<void> => {
    const user = await this.database.getUser(M.sender.jid)

    if (user) {
      let badwordUser = user.badwordCount
      const messages =
        M.message.message?.conversation ||
        M.message.message?.extendedTextMessage?.text

      let containBadword = false
      for (const msg of messages.split(' ')) {
        if (this.badword.indexOf(msg.toLowerCase()) > -1) {
          containBadword = true
        }
      }

      if (containBadword && badwordUser !== this.maxBadWord) {
        badwordUser += 1
        await this.database.updateUser(
          M.sender.jid,
          'badwordCount',
          'set',
          badwordUser
        )

        if (badwordUser === this.maxBadWord) {
          await this.database.updateBanStatus(M.sender.jid, 'ban')
          return void M.reply(
            'Anda telah terbanned karena telah mengirim kata kasar 3x\n\njika ingin diunban, harap meminta maaf kepada tuhan dan kontak wa.me/+6289699060906 untuk di unban'
          )
        } else {
          return void M.reply(
            `Pesan anda mengandung kata kasar, jika ${
              this.maxBadWord - badwordUser
            }x lagi mengirim kata kasar, anda akan terbanned`
          )
        }
      }
    }
  }
}
