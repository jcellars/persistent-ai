
require("dotenv").config();
const { OpenAI } = require("openai");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const memoryDoc = db.collection("persistent_ai").doc("core_memory");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeMemory() {
  const doc = await memoryDoc.get();
  if (!doc.exists) {
    console.log("❌ No memory found to summarize.");
    return;
  }

  const data = doc.data();
  const chatHistory = data.chatMemory || [];

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "You are an assistant summarizer. Summarize this conversation history so it can be used as memory context in future sessions.",
      },
      {
        role: "user",
        content: JSON.stringify(chatHistory, null, 2),
      },
    ],
  });

  const summary = response.choices[0].message.content;
  await memoryDoc.set({ summary }, { merge: true });

  console.log("✅ Summary updated in Firestore:");
  console.log(summary);
}

summarizeMemory().catch((err) => {
  console.error("❌ Error summarizing memory:", err);
});
