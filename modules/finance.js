
const { loadModuleMemory, saveModuleMemory } = require("./memoryModule");

async function getFinanceContext() {
  const memory = await loadModuleMemory("finance");
  return memory || "No Finance memory yet.";
}

async function updateFinanceContext(newInfo) {
  await saveModuleMemory("finance", newInfo);
}

module.exports = {
  getFinanceContext,
  updateFinanceContext,
};
