// backend/src/services/ai.service.js
const env = require("../config/env");

/**
 * Minimal, safe OpenAI Chat Completions call using fetch (Node 20 has fetch built-in)
 * Returns a string response. If key missing, returns a safe message (no crash).
 */
async function askAI(prompt) {
  if (!env.OPENAI_API_KEY) {
    return "AI is not configured yet. Please add OPENAI_API_KEY in backend/.env";
  }

  const payload = {
    model: env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are KrishnaTech Innovations assistant. Answer concisely, professionally, and helpfully. If user asks about services, mention web/mobile development, UI/UX, SaaS, SEO/marketing.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "No response from AI.";
}

module.exports = { askAI };
