import { downloadMediaMessage, proto } from '@adiwajshing/baileys'
import { unlink } from 'fs/promises'
import { IChatGPTOption, OpenAI } from '../lib/OpenAI'
import { SpeechText } from '../lib/SpeechText'
import { Message } from '../Structures'

export default class AudioMessage {
  private M: Message

  private audio: proto.Message.IAudioMessage

  private openAIAPIKey: string

  private organization: string

  private chatGPTOption: IChatGPTOption

  constructor(
    M: Message,
    openAIAPIKey: string,
    organization: string,
    chatGPTOption: IChatGPTOption
  ) {
    this.M = M
    this.audio = M.message.message.audioMessage || null
    this.openAIAPIKey = openAIAPIKey
    this.organization = organization
    this.chatGPTOption = chatGPTOption
  }

  public execute = async () => {
    if (this.M.chat === 'group') return
    if (!this.audio) return
    if (this.audio.seconds > 10) {
      this.M.reply(
        'Batas maksimum penggunaan Speech to Text adalah 10 detik'
      )
    }

    this.M.reply('*Processing!!!*')
    const start = Date.now()

    const buffer = await downloadMediaMessage(
      this.M.message,
      'buffer',
      {}
    )

    const speech = new SpeechText()
    const question = await speech.voiceToText(
      buffer,
      this.audio.mimetype.split('/')[1].split(';')[0] || '.ogg'
    )

    if (question === 'error') {
      return void this.M.reply(
        'Kesalahan saan mentranscribe audio ke text'
      )
    }

    const openai = new OpenAI(
      this.openAIAPIKey,
      this.organization,
      this.chatGPTOption
    )
    const answer = await openai.ask(this.M.from, question)

    const answerVoicePath = await speech.textToVoice(answer)

    if (answerVoicePath === 'error') {
      return void this.M.reply(
        'Kesalahan saan mentranscribe respon text ke audio'
      )
    } else {
      await this.M.reply(
        answerVoicePath,
        'audio',
        false,
        'audio/mp4',
        undefined,
        undefined
      )

      await unlink(answerVoicePath).catch((err) =>
        console.log(err.message)
      )
    }
    const end = Date.now() - start
    return void this.M.reply(
      `*voice*: ${question}\n\n*chatgpt*: ${answer}\n\n*Waktu memproses: ${
        end / 1000
      }s*`
    )
  }
}
