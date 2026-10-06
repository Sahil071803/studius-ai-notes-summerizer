import { Chip } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";

const PROVIDER_LABELS = {
  groq: "Groq free",
  openrouter: "OpenRouter",
};

function UsageChip({ usage, sx }) {
  if (!usage || !usage.totalTokens) return null;

  const cost = Number(usage.cost || 0);
  const costLabel =
    cost > 0 && cost < 0.01 ? `$${cost.toFixed(5)}` : `$${cost.toFixed(2)}`;

  const provider = usage.provider;
  const providerLabel =
    provider === "groq"
      ? PROVIDER_LABELS.groq
      : provider === "openrouter"
        ? PROVIDER_LABELS.openrouter
        : null;

  return (
    <Chip
      icon={<BoltIcon sx={{ fontSize: "14px !important" }} />}
      label={`${usage.totalTokens.toLocaleString()} tokens · ${costLabel}${
        providerLabel ? ` · ${providerLabel}` : ""
      }`}
      size="small"
      variant="outlined"
      color={provider === "groq" ? "success" : "default"}
      title={`Prompt: ${usage.promptTokens} · Completion: ${usage.completionTokens}${
        providerLabel ? ` · Provider: ${providerLabel}` : ""
      }`}
      sx={{
        color: provider === "groq" ? "success.main" : "text.secondary",
        borderColor: provider === "groq" ? "success.main" : "divider",
        fontSize: "11px",
        height: 24,
        ...sx,
      }}
    />
  );
}

export default UsageChip;