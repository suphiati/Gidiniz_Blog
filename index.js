// index.js
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function run() {
  console.log("=== GPT-4o-mini cevabı ===");
  const gpt = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Merhaba GPT, nasılsın?" }]
  });
  console.log(gpt.choices[0].message.content);

  console.log("\n=== Claude cevabı ===");
  const sonnet = await claude.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 200,
    messages: [{ role: "user", content: "Merhaba Claude, nasılsın?" }]
  });
  console.log(sonnet.content[0].text);
}

run();
