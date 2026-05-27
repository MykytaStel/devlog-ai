export const AI_PROVIDERS = ["mock", "openai"] as const;

export type AiProviderId = (typeof AI_PROVIDERS)[number];

export type AiProviderHealth = {
  provider: AiProviderId;
  configured: boolean;
  model: string | null;
};
