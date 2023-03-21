import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { SpeechClient, v1 as v1sst } from '@google-cloud/speech'
import {
  TextToSpeechClient,
  v1 as v1tts
} from '@google-cloud/text-to-speech'
import { ImageAnnotatorClient, v1 as v1v } from '@google-cloud/vision'
import ffmpeg from 'fluent-ffmpeg'
import { Transform } from 'form-data'
import { readFile, unlink, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { v4 } from 'uuid'

ffmpeg.setFfmpegPath(ffmpegPath.path)

export class GoogleAPI {
  sttClient: v1sst.SpeechClient
  ttsClient: v1tts.TextToSpeechClient
  viClient: v1v.ImageAnnotatorClient
  constructor() {
    this.sttClient = new SpeechClient()
    this.ttsClient = new TextToSpeechClient()
    this.viClient = new ImageAnnotatorClient()
  }

  public async voiceToText(
    audioBuffer: Buffer | Transform,
    mimetype?: string | null
  ): Promise<string> {
    try {
      const tempdir = os.tmpdir()
      const audioOogPath = path.join(
        tempdir,
        v4() + `.${mimetype || '.ogg'}`
      )

      await writeFile(audioOogPath, audioBuffer)

      const audioWavPath = path.join(tempdir, v4() + '.wav')

      await this.oggToWav(audioOogPath, audioWavPath)

      await unlink(audioOogPath).catch((err) =>
        console.log(err.message)
      )

      const storageUri = await readFile(audioWavPath)

      const audio = storageUri.toString('base64')

      const [response] = await this.sttClient.recognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 48000,
          languageCode: 'id-ID',
          speechContexts: [{ phrases: ['$TIME'] }]
        },
        audio: {
          content: audio
        }
      })

      if (response.results.length < 1) return ''
      let transcript = response.results[0].alternatives[0].transcript
      await unlink(audioWavPath).catch((err) =>
        console.log(err.message)
      )
      return transcript
    } catch (error) {
      console.log(error.message)
      return 'error'
    }
  }

  public async textToVoice(text: string): Promise<string> {
    try {
      const [response] = await this.ttsClient.synthesizeSpeech({
        input: { text },
        voice: { languageCode: 'id-ID', ssmlGender: 'FEMALE' },
        audioConfig: {
          audioEncoding: 'OGG_OPUS',
          effectsProfileId: ['telephony-class-application']
        }
      })

      const tempdir = os.tmpdir()
      const audioOutput = path.join(tempdir, v4() + '.ogg')

      await writeFile(audioOutput, response.audioContent, 'binary')

      return audioOutput
    } catch (error) {
      console.log(error.message)
      return 'error'
    }
  }

  public async imageToText(imgBuffer: Buffer): Promise<string> {
    try {
      const [result] = await this.viClient.textDetection(imgBuffer)
      return result.fullTextAnnotation.text
    } catch (error) {
      return (
        'Error saat membaca text dari gambar\n\n*Reason *' +
        error.message
      )
    }
  }

  private async oggToWav(
    oggPath: string,
    wavPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(oggPath)
        .toFormat('wav')
        .outputOptions('-acodec pcm_s16le')
        .output(wavPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })
  }
}
