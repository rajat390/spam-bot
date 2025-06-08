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
    await sendMessage(chat_id, "👋 Welcome! Use /help to see all commands.", reply_to)
  }

  else if (text.startsWith("/help")) {
    await sendMessage(chat_id, `📖 Commands:
➤ /text <msg> <number>
➤ /reverse <msg>
➤ /uppercase <msg>
➤ /lowercase <msg>
➤ /random <min> <max>
➤ /emoji <word>`, reply_to)
  }

  else if (text.startsWith("/text")) {
    const parts = text.split(" ")
    if (parts.length < 3) return sendMessage(chat_id, "❌ Use: /text <message> <number>", reply_to)
    const number = parseInt(parts[parts.length - 1])
    if (isNaN(number) || number > 10 || number < 1) return sendMessage(chat_id, "⚠️ Number must be between 1 and 10.", reply_to)
    const messageText = parts.slice(1, -1).join(" ")
    for (let i = 0; i < number; i++) await sendMessage(chat_id, messageText, reply_to)
  }

  else if (text.startsWith("/reverse")) {
    const input = text.replace("/reverse", "").trim()
    if (!input) return sendMessage(chat_id, "❌ Use: /reverse <text>", reply_to)
    await sendMessage(chat_id, input.split("").reverse().join(""), reply_to)
  }

  else if (text.startsWith("/uppercase")) {
    const input = text.replace("/uppercase", "").trim()
    if (!input) return sendMessage(chat_id, "❌ Use: /uppercase <text>", reply_to)
    await sendMessage(chat_id, input.toUpperCase(), reply_to)
  }

  else if (text.startsWith("/lowercase")) {
    const input = text.replace("/lowercase", "").trim()
    if (!input) return sendMessage(chat_id, "❌ Use: /lowercase <text>", reply_to)
    await sendMessage(chat_id, input.toLowerCase(), reply_to)
  }

  else if (text.startsWith("/random")) {
    const parts = text.split(" ")
    if (parts.length !== 3) return sendMessage(chat_id, "❌ Use: /random <min> <max>", reply_to)
    const min = parseInt(parts[1])
    const max = parseInt(parts[2])
    if (isNaN(min) || isNaN(max) || min >= max) return sendMessage(chat_id, "⚠️ Provide valid numbers. Example: /random 1 50", reply_to)
    const result = Math.floor(Math.random() * (max - min + 1)) + min
    await sendMessage(chat_id, `🎲 Random: ${result}`, reply_to)
  }

  else if (text.startsWith("/emoji")) {
    const input = text.replace("/emoji", "").trim().toLowerCase()
    if (!input) return sendMessage(chat_id, "❌ Use: /emoji <word>", reply_to)
    const emojiMap = {
      heart: "❤️",
      fire: "🔥",
      smile: "😊",
      sad: "😢",
      ok: "👌",
      wow: "😲",
      clap: "👏",
      star: "⭐",
      love: "😍",
      thumbs: "👍"
    }
    const words = input.split(" ")
    const emojiText = words.map(w => emojiMap[w] || w).join(" ")
    await sendMessage(chat_id, emojiText, reply_to)
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
