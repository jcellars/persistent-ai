
const { loadModuleMemory, saveModuleMemory } = require("./memoryModule");

async function getBackOfficeContext() {
  const memory = await loadModuleMemory("back_office");
  return memory || "No Back Office memory yet.";
}

async function updateBackOfficeContext(newInfo) {
  await saveModuleMemory("back_office", newInfo);
}

module.exports = {
  getBackOfficeContext,
  updateBackOfficeContext,
};
