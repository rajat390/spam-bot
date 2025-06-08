import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

const TOKEN = "7797281430:AAEmrvxBnx5y1irjRsZj2P9ymLL-nR6Sc3c"
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const ADMIN_ID = "" // Set admin ID or leave blank for public usage

app.post("/", async (req, res) => {
  const update = req.body
  if (!update.message) return res.send("ok")

  const message = update.message
  const chat_id = message.chat.id
  const user_id = message.from.id
  const text = message.text || ""
  const isAdmin = !ADMIN_ID || user_id.toString() === ADMIN_ID

  if (text.startsWith("/start") && isAdmin) {
    await sendText(chat_id, "👋 Welcome to the bot! Use /text <message> <number> to repeat messages.", message.message_id)
  }

  if (text.startsWith("/help") && isAdmin) {
    await sendText(chat_id, "🛠 Commands:\n/start - Welcome Message\n/text <message> <number> - Repeat message\n/help - Command Help", message.message_id)
  }

  if (text.startsWith("/text") && isAdmin) {
    const parts = text.trim().split(" ")
    if (parts.length < 3) return res.send("ok")

    const number = parseInt(parts[parts.length - 1])
    if (isNaN(number) || number < 1 || number > 10) return res.send("ok")

    if (message.reply_to_message && message.reply_to_message.from) {
      const mention = `<a href="tg://user?id=${message.reply_to_message.from.id}">${message.reply_to_message.from.first_name}</a>`
      for (let i = 0; i < number; i++) {
        await sendText(chat_id, `${mention}`, message.message_id, "HTML")
        await copyMessage(chat_id, chat_id, message.reply_to_message.message_id)
      }
    } else {
      for (let i = 0; i < number; i++) {
        await copyMessage(chat_id, chat_id, message.message_id)
      }
    }
  }

  res.send("ok")
})

async function sendText(chat_id, text, reply_id, mode = "Markdown") {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: mode,
      reply_to_message_id: reply_id
    })
  })
}

async function copyMessage(chat_id, from_chat_id, message_id) {
  await fetch(`${TELEGRAM_API}/copyMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      from_chat_id,
      message_id
    })
  })
}

app.listen(3000, () => console.log("Bot running"))
