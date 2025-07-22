
const admin = require("firebase-admin");
const db = admin.firestore();

function getModuleDoc(moduleName) {
  return db.collection("modules").doc(moduleName);
}

async function loadModuleMemory(moduleName) {
  const doc = await getModuleDoc(moduleName).get();
  if (!doc.exists) {
    console.log(`📭 No memory found for module: ${moduleName}`);
    return "";
  } else {
    const data = doc.data();
    return data.content || "";
  }
}

async function saveModuleMemory(moduleName, newMemory) {
  await getModuleDoc(moduleName).set({ content: newMemory }, { merge: true });
  console.log(`💾 Memory saved for module: ${moduleName}`);
}

module.exports = {
  loadModuleMemory,
  saveModuleMemory,
};
