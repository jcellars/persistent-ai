const admin = require('firebase-admin');
const fs = require('fs');

// Load your Firebase service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Example memory save function
async function saveMemory(memoryEntry) {
  const memoryRef = db.collection('persistent_memory').doc('core');
  const memoryDoc = await memoryRef.get();

  let data = memoryDoc.exists ? memoryDoc.data() : {};

  if (!data.updates) {
    data.updates = [];
  }

  data.updates.push(memoryEntry);

  await memoryRef.set(data);

  console.log('✅ Memory entry saved.');
}

// Example usage
const newMemory = {
  module: "General",
  memory_name: "Persistent AI Initialization",
  description: "Set up the initial persistent AI system with Firebase connection.",
  usage_notes: "This entry verifies the system is connected and functioning."
};

saveMemory(newMemory);
