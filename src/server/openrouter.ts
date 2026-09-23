/**
 * STRICT FREE-ONLY OPENROUTER LLM INTEGRATION
 * 
 * CORE ARCHITECTURAL RULES:
 * 1. Primary Model: 'openrouter/free' (default and preferred router across available free models)
 * 2. Absolute Free-Only Policy: Any model must be 'openrouter/free' or explicitly end with ':free'
 * 3. NO PAID FALLBACKS: Under no circumstances does this application call a paid model or fall back to one.
 * 4. Zero Key Leakage: OPENROUTER_API_KEY is server-side only from process.env.
 * 5. Deterministic Local Calculators: Calculators calculate entirely client-side; AI is strictly optional.
 */

import { Request, Response } from 'express';

export const PRIMARY_FREE_MODEL = 'openrouter/free';
export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Validates if a model identifier complies with the strict Free-Only policy.
 */
export function isFreeModel(model?: string): boolean {
  if (!model || typeof model !== 'string') return false;
  const trimmed = model.trim().toLowerCase();
  return trimmed === 'openrouter/free' || trimmed.endsWith(':free');
}

/**
 * Asserts that a model is strictly a free-tier model. Throws an error otherwise.
 */
export function assertFreeModel(model: string): void {
  if (!isFreeModel(model)) {
    throw new Error(
      `[SECURITY REJECTION] Model '${model}' violates the Free-Only policy. Only 'openrouter/free' or models ending with ':free' are permitted.`
    );
  }
}

// In-memory rate limiting & IP throttling
interface RateLimitRecord {
  timestamps: number[];
  lastRequest: number;
}

const ipRateLimits = new Map<string, RateLimitRecord>();
const MAX_REQUESTS_PER_MINUTE = 20;
const COOLDOWN_MS = 1500; // 1.5 seconds between requests

// Periodic cleanup of stale rate-limit records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
    if (record.timestamps.length === 0 && now - record.lastRequest > 300000) {
      ipRateLimits.delete(ip);
    }
  }
}, 600000);

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number; reason?: string } {
  const now = Date.now();
  const record = ipRateLimits.get(ip) || { timestamps: [], lastRequest: 0 };

  // Cooldown check
  if (now - record.lastRequest < COOLDOWN_MS) {
    const waitTime = Math.ceil((COOLDOWN_MS - (now - record.lastRequest)) / 1000);
    return {
      allowed: false,
      retryAfter: waitTime,
      reason: 'Please wait a moment before sending another request.',
    };
  }

  // Filter out timestamps older than 1 minute
  record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);

  if (record.timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((60000 - (now - oldest)) / 1000);
    return {
      allowed: false,
      retryAfter,
      reason: 'Rate limit exceeded for free AI capacity. Please try again in a minute.',
    };
  }

  // Record this request
  record.timestamps.push(now);
  record.lastRequest = now;
  ipRateLimits.set(ip, record);

  return { allowed: true };
}

/**
 * Express Handler for POST /api/ai
 */
export async function handleAiRequest(req: Request, res: Response): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    res.status(503).json({
      error: 'OpenRouter API key is not configured on the server.',
      message: 'Free AI features require OPENROUTER_API_KEY in server secrets.',
      code: 'OPENROUTER_KEY_MISSING',
    });
    return;
  }

  // IP Throttling
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: rateCheck.reason,
      retryAfter: rateCheck.retryAfter,
      code: 'RATE_LIMIT_EXCEEDED',
    });
    return;
  }

  const { prompt, messages, model, max_tokens, temperature } = req.body || {};

  // Resolve model to use: default to openrouter/free
  const selectedModel = model ? String(model).trim() : PRIMARY_FREE_MODEL;

  // STRICT FREE-ONLY RUNTIME ASSERTION
  if (!isFreeModel(selectedModel)) {
    console.warn(`[OpenRouter Security] Rejected non-free model request: ${selectedModel}`);
    res.status(400).json({
      error: 'Free-only policy violation: Only free models (e.g. openrouter/free or *:free) are allowed.',
      code: 'PAID_MODEL_FORBIDDEN',
    });
    return;
  }

  // Construct message array
  let requestMessages = [];
  if (Array.isArray(messages) && messages.length > 0) {
    requestMessages = messages.slice(-8).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content.slice(0, 3000) : '',
    }));
  } else if (typeof prompt === 'string') {
    requestMessages = [
      {
        role: 'user',
        content: prompt.slice(0, 3000),
      },
    ];
  } else {
    res.status(400).json({
      error: 'Invalid request: "prompt" string or "messages" array is required.',
      code: 'INVALID_REQUEST',
    });
    return;
  }

  // Bounded Request payload
  const requestBody = {
    model: selectedModel,
    messages: requestMessages,
    max_tokens: Math.min(Number(max_tokens) || 800, 1500),
    temperature: typeof temperature === 'number' ? Math.max(0, Math.min(1, temperature)) : 0.6,
  };

  // Safe origin header
  const referer = req.headers.referer || req.headers.origin || process.env.APP_URL || 'https://smarttools-hub.app';

  // Request execution with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const startTime = Date.now();
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': String(referer),
        'X-Title': 'SmartTools Hub',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const status = response.status;
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // non-JSON response
      }

      console.warn(`[OpenRouter API Error] status=${status}, latency=${latencyMs}ms`, errorData?.error?.message || '');

      if (status === 401) {
        res.status(401).json({
          error: 'OpenRouter authentication failed. Please verify the server API key.',
          code: 'AUTH_FAILED',
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error: 'Free AI capacity is currently experiencing high demand. Please try again shortly.',
          code: 'OPENROUTER_RATE_LIMIT',
        });
        return;
      }

      if (status >= 500) {
        res.status(503).json({
          error: 'Free AI capacity is temporarily unavailable from upstream providers. Please try again later.',
          code: 'UPSTREAM_UNAVAILABLE',
        });
        return;
      }

      res.status(status).json({
        error: errorData?.error?.message || 'Failed to complete AI request on free router.',
        code: 'OPENROUTER_REQUEST_FAILED',
      });
      return;
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const actualModel = data?.model || selectedModel;

    res.json({
      content,
      model: actualModel,
      isFree: true,
      latencyMs,
      provider: 'OpenRouter Free Tier',
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      res.status(504).json({
        error: 'AI request timed out after 25 seconds. Please try again with a shorter prompt.',
        code: 'REQUEST_TIMEOUT',
      });
      return;
    }

    console.error('[OpenRouter Network Error]', err?.message || err);
    res.status(500).json({
      error: 'An unexpected network error occurred while connecting to the free AI provider.',
      code: 'NETWORK_ERROR',
    });
  }
}

/**
 * Express Handler for GET /api/ai/health
 * Verifies system readiness WITHOUT exposing the secret key
 */
export function handleAiHealth(req: Request, res: Response): void {
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 0);

  res.json({
    status: 'ok',
    configured: hasKey,
    provider: 'OpenRouter',
    primaryModel: PRIMARY_FREE_MODEL,
    freeOnlyPolicy: {
      strictMode: true,
      allowedPatterns: ['openrouter/free', '*:free'],
      paidFallbackAllowed: false,
    },
    message: hasKey
      ? 'Free AI router is configured and ready.'
      : 'OPENROUTER_API_KEY is not set. Add it in AI Studio Secrets.',
  });
}
