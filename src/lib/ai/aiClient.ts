/**
 * Client-side AI Service for SmartTools Hub.
 * 
 * IMPORTANT ARCHITECTURAL CONTRACT:
 * - This service NEVER calls OpenRouter directly.
 * - All calls route strictly through internal server endpoint: /api/ai
 * - The server enforces the strict FREE-ONLY policy (openrouter/free or *:free).
 * - No secrets or API keys are ever stored or accessible on the client.
 */

import { CalculationResult } from '../../types';

export interface AiExplanationResponse {
  success: boolean;
  explanation?: string;
  modelUsed?: string;
  error?: string;
  code?: string;
}

/**
 * Request an educational explanation of a calculation result from the free OpenRouter model.
 */
export async function requestResultExplanation(
  toolName: string,
  result: CalculationResult
): Promise<AiExplanationResponse> {
  const inputsSummary = result.inputs.map((i) => `${i.label}: ${i.value}`).join(', ');
  const breakdownSummary = result.breakdown.map((b) => `${b.label}: ${b.value}`).join(' | ');

  const prompt = `You are a concise, helpful calculation tutor. Explain the following calculation in 3 short, easy-to-understand bullet points for an everyday user. Focus on:
1. What the final result (${result.primaryResult.label}: ${result.primaryResult.value}) practically means.
2. The key mathematical factor driving this outcome.
3. One practical financial, construction, health, or planning takeaway.

Calculation Details:
- Tool: ${toolName}
- Inputs: ${inputsSummary}
- Primary Result: ${result.primaryResult.label} = ${result.primaryResult.value} (${result.primaryResult.subtext || ''})
- Breakdown: ${breakdownSummary}
${result.formula ? `- Formula: ${result.formula}` : ''}

Keep your answer clean, objective, well-formatted, and under 160 words. Do not use generic filler.`;

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'openrouter/free', // Default & mandatory free router
        max_tokens: 450,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: 'Free AI capacity is temporarily busy. Your calculation result is fully accurate and preserved above.',
          code: 'RATE_LIMIT',
        };
      }
      if (response.status === 503) {
        return {
          success: false,
          error: 'Free AI capacity is temporarily unavailable. Your calculation itself is still available.',
          code: 'UNAVAILABLE',
        };
      }
      return {
        success: false,
        error: data.error || 'Free AI explanation could not be generated at this time.',
        code: data.code || 'ERROR',
      };
    }

    return {
      success: true,
      explanation: data.content,
      modelUsed: data.model || 'openrouter/free',
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Could not connect to the free AI service. Your calculation remains unaffected.',
      code: 'NETWORK_ERROR',
    };
  }
}
