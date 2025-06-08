import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

const TOKEN = "7797281430:AAEmrvxBnx5y1irjRsZj2P9ymLL-nR6Sc3c"
const API = `https://api.telegram.org/bot${TOKEN}`

app.post("/", async (req, res) => {
  const msg = req.body.message
  if (!msg || !msg.text) return res.send("ok")

  const chat_id = msg.chat.id
  const text = msg.text
  const reply_to = msg.message_id

  if (text.startsWith("/start")) {
    return send(chat_id, "👋 Welcome! Use /help to view all commands.", reply_to)
  }

  if (text.startsWith("/help")) {
    return send(chat_id,
      `🛠 Available Commands:
  /start - Welcome message
  /help - List commands
  /text <message> <count> - Send a message N times
  /spam <word> <count> - Spam a word in one message
  /interval <message> <count> <seconds> - Send with delay
  /wave <message> - Typing effect message`, reply_to)
  }

  if (text.startsWith("/text")) {
    const args = text.split(" ")
    const count = parseInt(args.at(-1))
    const message = args.slice(1, -1).join(" ")
    if (isNaN(count) || count < 1 || count > 10) {
      return send(chat_id, "❌ Invalid count. Use: /text Hello 3", reply_to)
    }
    for (let i = 0; i < count; i++) {
      await send(chat_id, message, reply_to)
    }
  }

  if (text.startsWith("/spam")) {
    const args = text.split(" ")
    const count = parseInt(args.at(-1))
    const word = args.slice(1, -1).join(" ")
    if (isNaN(count) || count < 1 || count > 50) {
      return send(chat_id, "❌ Invalid count. Use: /spam hi 10", reply_to)
    }
    const spamMsg = Array(count).fill(word).join(" ")
    return send(chat_id, spamMsg, reply_to)
  }

  if (text.startsWith("/interval")) {
    const args = text.split(" ")
    const sec = parseInt(args.at(-1))
    const count = parseInt(args.at(-2))
    const message = args.slice(1, -2).join(" ")
    if (isNaN(count) || isNaN(sec) || count > 5 || sec > 60) {
      return send(chat_id, "❌ Use: /interval <message> <count> <seconds> (max 5 msgs)", reply_to)
    }
    for (let i = 0; i < count; i++) {
      await send(chat_id, message, reply_to)
      await delay(sec * 1000)
    }
  }

  if (text.startsWith("/wave")) {
    const msgText = text.replace("/wave", "").trim()
    for (let i = 1; i <= msgText.length; i++) {
      await send(chat_id, msgText.slice(0, i), reply_to)
      await delay(300)
    }
  }

  res.send("ok")
})

async function send(chat_id, text, reply_to) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      reply_to_message_id: reply_to
    })
  })
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

app.listen(3000, () => console.log("Bot running"))
