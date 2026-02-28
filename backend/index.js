import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "1mb" }));

// CORS: allow your frontend dev server + deployed domain later
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  })
);

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages array." });
    }

    // Minimal guardrails
    if (messages.length > 30) {
      return res.status(400).json({ error: "Too many messages." });
    }

    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: { temperature: 0.4 },
      }),
    });

    const data = await ollamaRes.json();

    if (!ollamaRes.ok) {
      return res.status(ollamaRes.status).json({
        error: data?.error || data?.message || "Ollama error.",
      });
    }

    const reply = data?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
