import { TConversationModel } from '../Database/Models/Conversation'
import { IConversation } from '../lib/OpenAI'
import { Database } from './Database'

export class Conversation {
  constructor() {}

  public saveConversation = async (
    conversation: IConversation
  ): Promise<TConversationModel> => {
    let conv = await this.DB.getConversation(conversation.id)
    if (!conv) {
      conv = await this.getConversation(conversation)
    } else {
      conv = await this.DB.createConversation(conversation)
    }
    return conv
  }

  public getConversation = async (
    conversation: IConversation
  ): Promise<TConversationModel> => {
    let conv = await this.DB.getConversation(conversation.id)
    if (conv) {
      const updatedData = conv.data
      updatedData.push(...conversation.data)
      await this.updateConversation(conversation)
    } else {
      conversation.data.unshift({
        role: 'system',
        content:
          'Kamu adalah seorang Bot AI yang dikembangkan oleh Akmal Dira dengan menggunakan Open AI, kamu bisa bercanda dengan user dengan menjawab pertanyaan yang tidak tersedia dalam data seperti simi, jika terjadi masalah pada bot ini, harap hubungi WhatsApp Akmal Dira dengan nomor 089699060906'
      })
      conv = await this.DB.createConversation(conversation)
    }
    return conv
  }

  public updateConversation = async (
    conversation: IConversation
  ): Promise<void> => {
    let conv = await this.DB.getConversation(conversation.id)
    if (conv) {
      await this.DB.conversation.updateOne(
        { id: conversation.id },
        { $set: { data: conversation.data } }
      )
    } else {
      await this.saveConversation(conversation)
    }
  }

  public deleteConversation = async (id: string): Promise<void> => {
    let conv = await this.DB.getConversation(id)
    if (!conv) return
    let freshConv = {
      id: conv.id,
      data: Array.of(conv.data[0])
    }
    await this.updateConversation(freshConv)
  }

  private DB = new Database()
}
