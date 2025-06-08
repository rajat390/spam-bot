import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

const TOKEN = "7797281430:AAEmrvxBnx5y1irjRsZj2P9ymLL-nR6Sc3c"
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

app.post("/", async (req, res) => {
  const update = req.body

  if (!update.message) return res.send("ok")
  const message = update.message
  const chat_id = message.chat.id
  const text = message.text || ""
  const reply_to = message.message_id

  if (text.startsWith("/start")) {
    await sendMessage(chat_id, "👋 Welcome to the bot! Use /text <message> <number> to repeat messages.", reply_to)
  } else if (text.startsWith("/help")) {
    await sendMessage(chat_id, "🛠 Commands:\n/start - Welcome Message\n/text <message> <number> - Repeat message\n/help - Command Help", reply_to)
  } else if (text.startsWith("/text")) {
    const parts = text.split(" ")
    if (parts.length < 3) {
      await sendMessage(chat_id, "❌ Invalid format. Use: /text <message> <number>", reply_to)
      return res.send("ok")
    }
    const number = parseInt(parts[parts.length - 1])
    if (isNaN(number) || number < 1 || number > 10) {
      await sendMessage(chat_id, "⚠️ Please enter a number between 1 and 10 at the end.", reply_to)
      return res.send("ok")
    }
    const messageText = parts.slice(1, -1).join(" ")
    for (let i = 0; i < number; i++) {
      await sendMessage(chat_id, messageText, reply_to)
    }
  }

  res.send("ok")
})

async function sendMessage(chat_id, text, reply_to) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      reply_to_message_id: reply_to
    })
  })
}

app.listen(3000, () => console.log("Bot running"))
