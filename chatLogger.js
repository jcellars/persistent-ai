
const fs = require("fs");
const path = require("path");

function saveChatLog(sessionId, messages) {
  const logPath = path.join(__dirname, "logs", `${sessionId}.json`);
  fs.writeFileSync(logPath, JSON.stringify(messages, null, 2), "utf-8");
  console.log(`📝 Chat log saved to logs/${sessionId}.json`);
}

module.exports = {
  saveChatLog,
};
