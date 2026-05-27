import { refineTaskResultSchema, type RefineTaskResult } from "@/features/ai/refine.types";
import { getAiProvider } from "@/server/ai/get-ai-provider";

export type RefineInput = {
  title: string;
  description: string;
};

function buildFallbackRefine(input: RefineInput): RefineTaskResult {
  return {
    title: `[Refined] ${input.title || "Untitled Task"}`,
    description: `**Problem:**\n${input.description || "No clear problem stated."}\n\n**Proposed Solution:**\nDetermine root cause and implement fix.\n\n**Acceptance Criteria:**\n- Works as expected\n- Tests pass`,
    generatedAt: new Date().toISOString(),
    agentSteps: [
      "Loaded raw task title and description.",
      "Detected mock provider.",
      "Generated fallback structured format.",
    ],
  };
}

function buildUserPrompt(input: RefineInput) {
  return [
    "Please refine the following raw task input into a professional, structured engineering task.",
    "",
    "Raw Title:",
    input.title || "(Empty)",
    "",
    "Raw Description:",
    input.description || "(Empty)",
  ].join("\n");
}

export async function runRefineAgent(input: RefineInput): Promise<RefineTaskResult> {
  const fallback = buildFallbackRefine(input);
  const provider = getAiProvider();

  const result = await provider.generateJson({
    schemaName: "RefineTaskResult",
    schema: refineTaskResultSchema,
    mockResponse: fallback,
    system: [
      "You are a Senior Engineering Task Refiner.",
      "You receive poorly written, vague, or quick draft tasks and convert them into professional engineering tickets.",
      "The refined description should include clear sections like: Problem Statement, Proposed Solution, and Acceptance Criteria.",
      "Ensure the title is descriptive and actionable.",
    ].join("\n"),
    user: buildUserPrompt(input),
  });

  return {
    ...result,
    generatedAt: new Date().toISOString(),
  };
}
