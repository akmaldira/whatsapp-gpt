## **_Whatsapp-GPT_**

> This Script WhatsApp Bot Using Library Baileys and implement OpenAI, Speech To Text API (GCP) and Text To Speech API (GCP), Script is free for everyone, not for Sale!
> **_Note: it's a modified version of [WhatsApp-bot](https://github.com/LuckyYam/WhatsApp-bot)_**

---

### Preview Info

- Fully Modular Design </br>
- Written in [TypeScript](https://www.typescriptlang.org/)
- Built with [Baileys](https://github.com/adiwajshing/baileys) (A Lightweight full-featured WhatsApp Library)
- Powered by [ExpressJs](https://expressjs.com/) </br>
- Database handled via [MongoDB](https://www.mongodb.com/) </br>
- Self Auth restoration </br>

### Requirement

- node engines >=18.x
- Open AI Key
- Open AI Organization
- Google Credential for usage Google API (Speach To Text, Text To Speach, and more)

### Development

> Rename .env.example to .env & fill .env file

> Rename cred.example.json to cred.json & fill cred service account from google cloud

```bash
yarn install
```

```bash
yarn dev
```

### Deployment

> Rename .env.example to .env & fill .env file

> Rename cred.example.json to cred.json & fill cred service account from google cloud

```bash
yarn install
```

```bash
yarn build
```

```bash
yarn run pm2:start
```

### Contribution

- Feel free to open issues regarding any problems or if you have any feature requests

## Thanks To

- [`Shinei | Whatshell`](https://github.com/LuckyYam/)
- [`@adiwajshing/baileys`](https://github.com/adiwajshing/baileys)
