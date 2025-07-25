require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const memoryDoc = db.collection("persistent_ai").doc("core_memory");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let chatHistory = [];

app.post("/message", async (req, res) => {
  try {
    const userInput = req.body.message;

    if (!userInput) {
      return res.status(400).json({ error: "No message provided" });
    }

    chatHistory.push({ role: "user", content: userInput });

    const contextDoc = await memoryDoc.get();
    const memory = contextDoc.exists ? contextDoc.data().summary || "" : "";

    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant with persistent memory. Use the following memory as context:\n\n" + memory,
      },
      ...chatHistory,
    ];

    let reply = "Sorry, something went wrong. Please try again later.";

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
      });

      reply = response.choices[0].message.content;
    } catch (err) {
      console.error("❌ OpenAI API error:", err);
    }

    chatHistory.push({ role: "assistant", content: reply });

    await memoryDoc.set({ chatMemory: chatHistory }, { merge: true });

    // ✅ Safely create logs directory and write file
    const sessionId = new Date().toISOString().replace(/[:.]/g, "-");
    const logDir = path.join(__dirname, "logs");
    const logPath = path.join(logDir, `${sessionId}.json`);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    fs.writeFileSync(logPath, JSON.stringify(chatHistory, null, 2), "utf-8");

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error in /message route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web UI running at http://localhost:${PORT}`);
});
