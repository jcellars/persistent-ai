
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

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
    });

    const reply = response.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: reply });

    await memoryDoc.set({ chatMemory: chatHistory }, { merge: true });

    const sessionId = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(
      path.join(__dirname, "logs", `${sessionId}.json`),
      JSON.stringify(chatHistory, null, 2),
      "utf-8"
    );

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error in /message route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web UI running at http://localhost:${PORT}`);
});
