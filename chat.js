
require("dotenv").config(); // ⬅️ Load .env first
console.log("✅ Loaded key:", process.env.OPENAI_API_KEY);

const { OpenAI } = require("openai");
const admin = require("firebase-admin");
const readline = require("readline");
const { exec } = require("child_process");

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const memoryDoc = db.collection("persistent_ai").doc("core_memory");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let chatHistory = [];
let messageCounter = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function loadMemory() {
  const doc = await memoryDoc.get();
  if (!doc.exists) {
    console.log("📭 No existing memory found. Starting fresh.");
    return [];
  } else {
    const data = doc.data();
    console.log("📦 Loaded memory from Firestore:");
    console.log(JSON.stringify(data, null, 2));
    return data.chatMemory || [];
  }
}

async function saveMemory(history) {
  await memoryDoc.set({ chatMemory: history }, { merge: true });
  console.log("💾 Memory saved to Firestore.");
}

function runSummarizer() {
  console.log("🧠 Triggering summarize.js...");
  exec("node summarize.js", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error running summarizer:", err.message);
      return;
    }
    if (stderr) console.error(stderr);
    if (stdout) console.log(stdout);
  });
}

async function askQuestion() {
  rl.question("💬 You: ", async (userInput) => {
    chatHistory.push({ role: "user", content: userInput });
    messageCounter++;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: chatHistory,
    });

    const reply = response.choices[0].message.content;
    console.log("🤖 AI:", reply);
    chatHistory.push({ role: "assistant", content: reply });

    await saveMemory(chatHistory);

    if (messageCounter % 10 === 0) {
      runSummarizer();
    }

    askQuestion(); // Continue loop
  });
}

(async () => {
  const memoryContext = await loadMemory();
  chatHistory = [
    {
      role: "system",
      content:
        "You are a helpful assistant with persistent memory. Use the following saved memory as context:\n\n" +
        JSON.stringify(memoryContext, null, 2),
    },
    ...memoryContext,
  ];
  askQuestion();
})();
