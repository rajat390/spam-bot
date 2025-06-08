import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

const TOKEN = "7797281430:AAEmrvxBnx5y1irjRsZj2P9ymLL-nR6Sc3c"
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const ADMIN_ID = "" // set to your Telegram user ID or leave blank to allow all

const activeUsers = {}

app.post("/", async (req, res) => {
  const update = req.body
  if (!update.message) return res.send("ok")

  const message = update.message
  const chat_id = message.chat.id
  const user_id = message.from.id
  const text = message.text || ""
  const reply_to = message.message_id

  const isAdmin = !ADMIN_ID || user_id.toString() === ADMIN_ID

  if (!isAdmin) return res.send("ok")

  if (text.startsWith("/start")) {
    await sendMessage(chat_id, "👋 Welcome! Use /spam <message> <number> to repeat. Use /stop to stop it.", reply_to)
    return res.send("ok")
  }

  if (text.startsWith("/help")) {
    await sendMessage(chat_id, "🛠 Commands:\n/start - Start\n/spam <HTML message> <count>\n/stop - Stop ongoing repeat\nSupports <b>bold</b>, <i>italic</i>, <a href='https://url'>link</a>", reply_to)
    return res.send("ok")
  }

  if (text.startsWith("/stop")) {
    if (activeUsers[user_id]) {
      clearInterval(activeUsers[user_id])
      delete activeUsers[user_id]
      await sendMessage(chat_id, "🛑 Stopped repeating messages.", reply_to)
    }
    return res.send("ok")
  }

  if (text.startsWith("/spam")) {
    if (activeUsers[user_id]) {
      const warn = await sendMessage(chat_id, "⚠️ Wait for previous /spam to finish or use /stop.", reply_to)
      setTimeout(() => deleteMessage(chat_id, warn.message_id), 2000)
      return res.send("ok")
    }

    const parts = text.trim().split(" ")
    if (parts.length < 3) {
      const err = await sendMessage(chat_id, "❌ Format: /spam <message> <number>", reply_to)
      setTimeout(() => deleteMessage(chat_id, err.message_id), 2000)
      return res.send("ok")
    }

    const number = parseInt(parts[parts.length - 1])
    if (isNaN(number) || number < 1 || number > 10) {
      const err = await sendMessage(chat_id, "⚠️ Enter number between 1 to 10.", reply_to)
      setTimeout(() => deleteMessage(chat_id, err.message_id), 2000)
      return res.send("ok")
    }

    const messageText = parts.slice(1, -1).join(" ")

    let content = messageText
    if (message.reply_to_message && message.reply_to_message.from) {
      const targetUser = message.reply_to_message.from
      const mention = `<a href="tg://user?id=${targetUser.id}">${targetUser.first_name}</a>`
      content = `${mention} ${messageText}`
    }

    let count = 0
    activeUsers[user_id] = setInterval(async () => {
      if (count >= number) {
        clearInterval(activeUsers[user_id])
        delete activeUsers[user_id]
        return
      }
      await sendMessage(chat_id, content, reply_to, "HTML")
      count++
    }, 800)

    return res.send("ok")
  }

  res.send("ok")
})

async function sendMessage(chat_id, text, reply_to, mode = "HTML") {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: mode,
      reply_to_message_id: reply_to
    })
  })
  const data = await res.json()
  return data.result
}

async function deleteMessage(chat_id, message_id) {
  await fetch(`${TELEGRAM_API}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      message_id
    })
  })
}

app.listen(3000, () => console.log("Bot running"))
