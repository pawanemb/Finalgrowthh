import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const prompt = `Analyze this website: ${url}

You are a professional website and business analyst. Analyze the provided website URL and extract detailed information about the business.

Provide your analysis in the following structure:
{
  "projectName": "Business name",
  "industry": "Main business category (e.g., E-commerce, Technology, Healthcare)",
  "description": "Brief description of the business",
  "services": [
    "List of 3-5 specific services or products offered",
    "Each service should be clear and specific",
    "Focus on main offerings"
  ],
  "targetAudience": {
    "age": ["18-24", "25-34", "35-44", "45-54", "55+"],
    "gender": ["Male", "Female", "All"],
    "languages": ["Primary languages served"],
    "location": ["Geographic regions served"]
  }
}

Guidelines:
1. Category should be specific and accurate
2. Services should be actual offerings, not generic terms
3. Target audience should be realistic and based on website content
4. Include 3-5 services maximum
5. Use standard age ranges
6. Be specific with locations (e.g., "North America", "Europe", "Global")
7. Only include languages that are actually supported
8. If information is unclear, use the most likely values based on website context`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst specializing in website analysis and market research. Provide detailed, accurate analysis based on website content and context. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No analysis generated');
    }

    try {
      const analysis = JSON.parse(content);

      // Format project name for subdomains
      const parsedUrl = new URL(url);
      const domainParts = parsedUrl.hostname.replace('www.', '').split('.');
      
      if (domainParts.length > 2) {
        const subdomain = domainParts[0];
        const mainDomain = domainParts[1];
        analysis.projectName = `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} ${mainDomain.toUpperCase()}`;
      }

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