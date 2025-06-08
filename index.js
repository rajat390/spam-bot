import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

const TOKEN = "BOT_TOKEN"
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const ADMIN_ID = "" // set admin id like "1234567890" or leave blank

app.post("/", async (req, res) => {
  const update = req.body
  if (!update.message) return res.send("ok")

  const message = update.message
  const chat_id = message.chat.id
  const user_id = message.from.id
  const text = message.text || ""
  const reply_to = message.message_id

  const isAdmin = !ADMIN_ID || user_id.toString() === ADMIN_ID

  if (text.startsWith("/start") && isAdmin) {
    await sendMessage(chat_id, "👋 Welcome to the bot! Use /spam <message> <number> to repeat messages.", reply_to)
  }

  if (text.startsWith("/help") && isAdmin) {
    await sendMessage(chat_id, "🛠 Commands:\n/start - Welcome Message\n/spam <message> <number> - Repeat message\n/help - Command Help", reply_to)
  }

  if (text.startsWith("/spam") && isAdmin) {
    const parts = text.trim().split(" ")
    if (parts.length < 3) return res.send("ok")
    const number = parseInt(parts[parts.length - 1])
    if (isNaN(number) || number < 1 || number > 10) return res.send("ok")
    const messageText = parts.slice(1, -1).join(" ")

    if (message.reply_to_message && message.reply_to_message.from) {
      const targetUser = message.reply_to_message.from
      const mention = `<a href="tg://user?id=${targetUser.id}">${targetUser.first_name}</a> ${messageText}`
      for (let i = 0; i < number; i++) {
        await sendMessage(chat_id, mention, reply_to, "HTML")
      }
    } else {
      for (let i = 0; i < number; i++) {
        await sendMessage(chat_id, messageText, reply_to)
      }
    }
  }

  res.send("ok")
})

async function sendMessage(chat_id, text, reply_to, mode = "Markdown") {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: mode,
      reply_to_message_id: reply_to
    })
  })
}

app.listen(3000, () => console.log("Bot running"))
