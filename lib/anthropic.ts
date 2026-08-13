import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  // Don't throw at import time in build environments; routes will surface a clear error instead.
  console.warn('ANTHROPIC_API_KEY is not set. Extraction/analysis routes will fail until it is configured.');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Use a current, capable model for both vision extraction and text analysis.
export const MODEL = 'claude-sonnet-4-6';
