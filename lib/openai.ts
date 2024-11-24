'use client';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeWithOpenAI(url: string) {
  try {
    const response = await fetch(`/api/analyze-website?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to analyze website');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error: any) {
    console.error('Analysis error:', error);
    throw new Error(error.message || 'Failed to analyze website. Please try again.');
  }
}