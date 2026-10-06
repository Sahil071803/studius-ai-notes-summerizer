const axios = require("axios");

const TIMEOUT = Number(process.env.AI_TIMEOUT_MS) || 60000;

// Providers are tried in order. The first one that answers wins; the rest are
// only reached when a provider is unavailable (no key, rate limit, no credits,
// timeout or a provider-side 5xx). A rejected key is treated as fatal because
// retrying it on the next provider would hide a real config mistake.
const PROVIDERS = [
  {
    id: "groq",
    label: "Groq (free tier)",
    url: "https://api.groq.com/openai/v1/chat/completions",
    apiKeyEnv: "GROQ_API_KEY",
    model: () => process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    headers: () => ({}),
    // Groq's free tier does not report a dollar cost.
    cost: () => 0,
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    apiKeyEnv: "OPENROUTER_API_KEY",
    model: () => process.env.OPENROUTER_MODEL || "openai/gpt-3.5-turbo",
    headers: () => ({
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5000",
      "X-Title": "Studius",
    }),
    // OpenRouter only returns cost when usage is requested explicitly.
    cost: (usage) => usage?.cost || 0,
  },
];

const available = () => {
  const order = String(process.env.AI_PROVIDERS || "groq,openrouter")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return order
    .map((id) => PROVIDERS.find((p) => p.id === id))
    .filter((p) => p && process.env[p.apiKeyEnv]);
};

const isAuthError = (err) => {
  const status = err.response?.status;
  return status === 401 || status === 403 || status === 400;
};

const mapError = (err, provider) => {
  const status = err.response?.status;

  if (status === 401 || status === 403) {
    const e = new Error(
      `AI provider (${provider.label}) rejected the API key. Check ${provider.apiKeyEnv} on the server.`
    );
    e.status = 502;
    return e;
  }

  if (status === 402) {
    const e = new Error(
      `AI provider (${provider.label}) has no credits left. Add credits or rely on a free provider.`
    );
    e.status = 503;
    return e;
  }

  if (status === 429) {
    const e = new Error(
      "All AI providers are rate limited right now. Please wait a moment and try again."
    );
    e.status = 429;
    return e;
  }

  if (status === 400 && /context length|maximum context|too many tokens/i.test(
    err.response?.data?.error?.message || ""
  )) {
    const e = new Error("Input is too long for this model. Try shortening your notes.");
    e.status = 413;
    return e;
  }

  if (err.code === "ECONNABORTED") {
    const e = new Error("AI request timed out. Please try again.");
    e.status = 504;
    return e;
  }

  const e = new Error("AI service is currently unavailable. Please try again shortly.");
  e.status = 502;
  return e;
};

const normalizeUsage = (usage, cost) => {
  if (!usage) return null;
  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0,
    cost: cost || 0,
  };
};

const callProvider = async (provider, messages) => {
  const apiKey = process.env[provider.apiKeyEnv];
  const model = provider.model();

  const response = await axios.post(
    provider.url,
    { model, messages, usage: { include: true } },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...provider.headers(),
      },
      timeout: TIMEOUT,
    }
  );

  const content = response?.data?.choices?.[0]?.message?.content?.trim() || "";
  const rawUsage = response?.data?.usage;
  const usage = normalizeUsage(rawUsage, provider.cost(rawUsage));

  return {
    content,
    usage: usage ? { ...usage, provider: provider.id } : null,
    provider: provider.id,
    providerLabel: provider.label,
    model,
  };
};

const chat = async (prompt, { system } = {}) => {
  const providers = available();

  if (!providers.length) {
    const e = new Error(
      "AI service is not configured. Set GROQ_API_KEY or OPENROUTER_API_KEY on the server."
    );
    e.status = 500;
    throw e;
  }

  const messages = system
    ? [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ]
    : [{ role: "user", content: prompt }];

  let authError = null;
  let rateLimitError = null;
  let lastError = null;

  for (const provider of providers) {
    try {
      const result = await callProvider(provider, messages);
      console.log(
        `[ai] answered by ${result.provider} model=${result.model} tokens=${result.usage?.totalTokens ?? 0} cost=$${(result.usage?.cost ?? 0).toFixed(6)}`
      );
      return result;
    } catch (err) {
      console.warn(
        `[ai] ${provider.id} failed: ${err.response?.status || err.code} ${err.message}`
      );
      const mapped = mapError(err, provider);
      lastError = mapped;

      if (err.response?.status === 402 || err.response?.status === 429) {
        rateLimitError = mapped;
      }
      if (isAuthError(err) || err.response?.status === 402) {
        authError = authError || mapped;
      }
      // Any other configured provider may still succeed, so the chain continues.
    }
  }

  // Nothing answered. Prefer the most actionable explanation for the user:
  // a broken or empty key is something they can actually fix, so it outranks a
  // generic "unavailable" even when a rate limit was also hit.
  throw authError || rateLimitError || lastError;
};

module.exports = { chat, normalizeUsage, PROVIDERS };