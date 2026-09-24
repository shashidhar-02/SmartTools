// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// src/server/openrouter.ts
var PRIMARY_FREE_MODEL = "openrouter/free";
var OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
function isFreeModel(model) {
  if (!model || typeof model !== "string") return false;
  const trimmed = model.trim().toLowerCase();
  return trimmed === "openrouter/free" || trimmed.endsWith(":free");
}
var ipRateLimits = /* @__PURE__ */ new Map();
var MAX_REQUESTS_PER_MINUTE = 20;
var COOLDOWN_MS = 1500;
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 6e4);
    if (record.timestamps.length === 0 && now - record.lastRequest > 3e5) {
      ipRateLimits.delete(ip);
    }
  }
}, 6e5);
function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRateLimits.get(ip) || { timestamps: [], lastRequest: 0 };
  if (now - record.lastRequest < COOLDOWN_MS) {
    const waitTime = Math.ceil((COOLDOWN_MS - (now - record.lastRequest)) / 1e3);
    return {
      allowed: false,
      retryAfter: waitTime,
      reason: "Please wait a moment before sending another request."
    };
  }
  record.timestamps = record.timestamps.filter((ts) => now - ts < 6e4);
  if (record.timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((6e4 - (now - oldest)) / 1e3);
    return {
      allowed: false,
      retryAfter,
      reason: "Rate limit exceeded for free AI capacity. Please try again in a minute."
    };
  }
  record.timestamps.push(now);
  record.lastRequest = now;
  ipRateLimits.set(ip, record);
  return { allowed: true };
}
async function handleAiRequest(req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      error: "OpenRouter API key is not configured on the server.",
      message: "Free AI features require OPENROUTER_API_KEY in server secrets.",
      code: "OPENROUTER_KEY_MISSING"
    });
    return;
  }
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: rateCheck.reason,
      retryAfter: rateCheck.retryAfter,
      code: "RATE_LIMIT_EXCEEDED"
    });
    return;
  }
  const { prompt, messages, model, max_tokens, temperature } = req.body || {};
  const selectedModel = model ? String(model).trim() : PRIMARY_FREE_MODEL;
  if (!isFreeModel(selectedModel)) {
    console.warn(`[OpenRouter Security] Rejected non-free model request: ${selectedModel}`);
    res.status(400).json({
      error: "Free-only policy violation: Only free models (e.g. openrouter/free or *:free) are allowed.",
      code: "PAID_MODEL_FORBIDDEN"
    });
    return;
  }
  let requestMessages = [];
  if (Array.isArray(messages) && messages.length > 0) {
    requestMessages = messages.slice(-8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.slice(0, 3e3) : ""
    }));
  } else if (typeof prompt === "string") {
    requestMessages = [
      {
        role: "user",
        content: prompt.slice(0, 3e3)
      }
    ];
  } else {
    res.status(400).json({
      error: 'Invalid request: "prompt" string or "messages" array is required.',
      code: "INVALID_REQUEST"
    });
    return;
  }
  const requestBody = {
    model: selectedModel,
    messages: requestMessages,
    max_tokens: Math.min(Number(max_tokens) || 800, 1500),
    temperature: typeof temperature === "number" ? Math.max(0, Math.min(1, temperature)) : 0.6
  };
  const referer = req.headers.referer || req.headers.origin || process.env.APP_URL || "https://smarttools-hub.app";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25e3);
  try {
    const startTime = Date.now();
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": String(referer),
        "X-Title": "SmartTools Hub"
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const status = response.status;
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
      }
      console.warn(`[OpenRouter API Error] status=${status}, latency=${latencyMs}ms`, errorData?.error?.message || "");
      if (status === 401) {
        res.status(401).json({
          error: "OpenRouter authentication failed. Please verify the server API key.",
          code: "AUTH_FAILED"
        });
        return;
      }
      if (status === 429) {
        res.status(429).json({
          error: "Free AI capacity is currently experiencing high demand. Please try again shortly.",
          code: "OPENROUTER_RATE_LIMIT"
        });
        return;
      }
      if (status >= 500) {
        res.status(503).json({
          error: "Free AI capacity is temporarily unavailable from upstream providers. Please try again later.",
          code: "UPSTREAM_UNAVAILABLE"
        });
        return;
      }
      res.status(status).json({
        error: errorData?.error?.message || "Failed to complete AI request on free router.",
        code: "OPENROUTER_REQUEST_FAILED"
      });
      return;
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const actualModel = data?.model || selectedModel;
    res.json({
      content,
      model: actualModel,
      isFree: true,
      latencyMs,
      provider: "OpenRouter Free Tier"
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      res.status(504).json({
        error: "AI request timed out after 25 seconds. Please try again with a shorter prompt.",
        code: "REQUEST_TIMEOUT"
      });
      return;
    }
    console.error("[OpenRouter Network Error]", err?.message || err);
    res.status(500).json({
      error: "An unexpected network error occurred while connecting to the free AI provider.",
      code: "NETWORK_ERROR"
    });
  }
}
function handleAiHealth(req, res) {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 0);
  res.json({
    status: "ok",
    configured: hasKey,
    provider: "OpenRouter",
    primaryModel: PRIMARY_FREE_MODEL,
    freeOnlyPolicy: {
      strictMode: true,
      allowedPatterns: ["openrouter/free", "*:free"],
      paidFallbackAllowed: false
    },
    message: hasKey ? "Free AI router is configured and ready." : "OPENROUTER_API_KEY is not set. Add it in AI Studio Secrets."
  });
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "1mb" }));
app.post("/api/ai", handleAiRequest);
app.get("/api/ai/health", handleAiHealth);
app.get("/api/analytics/demand-summary", (req, res) => {
  res.json({
    status: "ok",
    connectedGsc: false,
    message: "Google Search Console is not yet authenticated for first-party data.",
    observedInternalSearches: 420,
    topCategories: ["Finance", "Fitness & Gym", "Construction & Tiles", "Salary & Tax", "Student Tools"]
  });
});
async function startServer() {
  const distPath = path.resolve(__dirname, "dist");
  const distIndexHtml = path.resolve(distPath, "index.html");
  const hasDist = fs.existsSync(distIndexHtml);
  if (hasDist) {
    console.log(`[SmartTools Hub] Serving production static build from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    console.log(`[SmartTools Hub] Serving development mode via Vite middleware`);
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SmartTools Hub] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[OpenRouter Policy] Strict FREE-ONLY active (Primary: openrouter/free)`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
