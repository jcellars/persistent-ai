# Persistent AI

This is a GPT-4-powered assistant with long-term memory, modular task handling, and summarization capabilities. It uses Firebase Firestore for persistent memory storage and includes custom modules for finance/bookkeeping, AI receptionist tasks, and back-office management.

## Features

- Persistent memory stored in Firestore
- Modular design with dedicated memory modules
- Automatic memory summarization
- Local CLI chat interface
- Web UI running on Express
- Firebase Admin and OpenAI integration

## To Run

```bash
node chat.js         # Terminal chat interface
node server.js       # Web interface at http://localhost:3000
node summarize.js    # Manual summarization trigger
