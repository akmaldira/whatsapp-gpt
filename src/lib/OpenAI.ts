import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateImageRequestSizeEnum,
  OpenAIApi
} from 'openai'
import { Conversation } from '../Structures/Conversation'

export interface IChatGPTOption {
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  model: string
}

export interface IConversation {
  id: string
  data: ChatCompletionRequestMessage[]
}

export class OpenAI extends OpenAIApi {
  private option: IChatGPTOption

  constructor(
    openAIAPIKey: string,
    organization: string,
    option: IChatGPTOption,
    gptSystem: string
  ) {
    super(
      new Configuration({
        organization,
        apiKey: openAIAPIKey
      })
    )
    this.option = option
    this.conversationS = new Conversation(gptSystem)
  }

  public async ask(
    id: string,
    content: string,
    name: string = 'user',
    model: string = 'gpt-3.5-turbo'
  ): Promise<string> {
    const updateData = []

    const conversation = await this.conversationS.getConversation({
      id,
      data: [{ role: 'user', content, name }]
    })

    updateData.push(...conversation.data)

    try {
      const messages = this.serializableConv(conversation)
      const completition = await this.createChatCompletion({
        model: model,
        ...this.option,
        messages
      })

      updateData.push({
        role: completition.data.choices[0].message.role,
        content: completition.data.choices[0].message.content
      })

      return (
        completition.data.choices[0].message?.content ||
        'Kesalahan pada sistem! please contact adminastor\n\n*Reason* Unknown response from OpenAI'
      )
    } catch (error) {
      if (
        error.response.data.error.message &&
        error.response.data.error.message.includes(
          'Please reduce the length of the messages or completion.'
        )
      ) {
        await this.conversationS.deleteConversation(conversation.id)
        this.ask(id, content, name, model)
      }
      return (
        'Kesalahan pada sistem! please contact adminastor\n\n*Reason* ' +
          error.response.data.error.message || 'Internal Server Error'
      )
    } finally {
      this.conversationS.updateConversation({
        id: conversation.id,
        data: updateData
      })
    }
  }

  public async generateImg(
    prompt: string,
    n: number = 1,
    size: CreateImageRequestSizeEnum = '1024x1024'
  ): Promise<string | string[]> {
    try {
      const imgUrl = await this.createImage({
        prompt,
        n,
        size
      })
      return imgUrl.data.data.map((url) => url.url)
    } catch (error) {
      return 'Error saat generate gambar\n\n*Reason*' + error.message
    }
  }

  private serializableConv(
    conv: IConversation
  ): ChatCompletionRequestMessage[] {
    return conv.data.map(({ role, content, name }) => ({
      role,
      content,
      name
    }))
  }

  private conversationS: Conversation
}
