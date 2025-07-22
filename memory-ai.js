const { OpenAI } = require("openai");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const memoryDoc = db.collection("memory").doc("core");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function updateMemory(newInput) {
  // Step 1: Load existing memory
  const doc = await memoryDoc.get();
  let memoryText = "";
  if (doc.exists) {
    const data = doc.data();
    memoryText = data.content || "";
    console.log("📥 Loaded memory from Firestore.");
  } else {
    console.log("📭 No existing memory found. Starting fresh.");
  }

  // Step 2: Combine with new input
  const fullPrompt = `
Here is my current memory of the user:

${memoryText}

Now here is new input to add:
"${newInput}"

Please summarize and consolidate it into updated memory that’s concise and informative.
  `;

  // Step 3: Ask OpenAI to summarize and update memory
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: fullPrompt }]
  });

  const updatedMemory = response.choices[0].message.content;

  // Step 4: Save updated memory
  await memoryDoc.set({ content: updatedMemory });
  console.log("✅ Memory updated and saved to Firestore:");
  console.log(updatedMemory);
}

// 🔄 EXAMPLE USAGE
const userInput = "We use minimally invasive techniques for crowns.";
updateMemory(userInput);
