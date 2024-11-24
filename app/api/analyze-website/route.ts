import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Use server-side environment variable
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const prompt = `Analyze this website: ${url}

Please provide a structured analysis with the following information:

1. Industry: Choose from these categories only:
   - Technology
   - Marketing & Advertising
   - Healthcare
   - Education
   - Finance
   - E-commerce
   - Real Estate
   - Travel & Tourism
   - Manufacturing
   - Retail
   - Other

2. Target Audience:
   - Gender: ["Male", "Female", "All"]
   - Languages: Primary languages supported
   - Location: Geographic focus

3. Services: List 3-5 main services or products

Format the response as JSON:
{
  "industry": "string",
  "services": ["string"],
  "target_audience": {
    "gender": ["string"],
    "languages": ["string"],
    "location": ["string"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst. Provide analysis in the exact JSON format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No analysis generated');
    }

    try {
      const analysis = JSON.parse(content);
      return NextResponse.json(analysis);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      return NextResponse.json({ error: 'Failed to parse website analysis' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Website analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze website' }, { status: 500 });
  }
}