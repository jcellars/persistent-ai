
const { loadModuleMemory, saveModuleMemory } = require("./memoryModule");

async function getAIReceptionistContext() {
  const memory = await loadModuleMemory("ai_receptionist");
  return memory || "No AI Receptionist memory yet.";
}

async function updateAIReceptionistContext(newInfo) {
  await saveModuleMemory("ai_receptionist", newInfo);
}

module.exports = {
  getAIReceptionistContext,
  updateAIReceptionistContext,
};
