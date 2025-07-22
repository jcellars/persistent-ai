
const { loadModuleMemory, saveModuleMemory } = require("./memoryModule");

async function getMarketingContext() {
  const memory = await loadModuleMemory("marketing");
  return memory || "No marketing memory yet.";
}

async function updateMarketingContext(newInfo) {
  await saveModuleMemory("marketing", newInfo);
}

module.exports = {
  getMarketingContext,
  updateMarketingContext,
};
