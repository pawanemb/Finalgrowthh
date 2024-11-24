'use client';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const INDUSTRY_CATEGORIES = [
  'Technology',
  'Marketing & Advertising',
  'Healthcare',
  'Education',
  'Finance',
  'E-commerce',
  'Real Estate',
  'Travel & Tourism',
  'Manufacturing',
  'Retail'
];

const LANGUAGES = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi'
];

const LOCATIONS = [
  'North America',
  'South America',
  'Europe',
  'Asia Pacific',
  'Middle East',
  'Africa',
  'Australia & NZ',
  'Global'
];

export async function analyzeWithOpenAI(url: string) {
  try {
    const prompt = `Analyze this website: ${url}

Please analyze this website and provide the following information:

1. Project Name: A suitable name based on the website
2. Industry: The main business category. Choose the closest match from these options:
   ${INDUSTRY_CATEGORIES.join(', ')}
   If none of these categories closely match, respond with "Other"
3. Services: 3-5 main services or products offered
4. Target Audience:
   - Gender: Target gender demographics (Male, Female, Others)
   - Languages: Primary languages from: ${LANGUAGES.join(', ')}. Use "Other" for unlisted languages.
   - Location: Geographic regions from: ${LOCATIONS.join(', ')}

Format your response as a structured analysis following this exact format:
{
  "projectName": "string",
  "industry": "string",
  "services": ["string"],
  "targetAudience": {
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
          content: "You are an expert business analyst. Provide accurate, concise analysis based on website content. Always respond in valid JSON format. For industry classification, if none of the predefined categories closely match, use 'Other'. For languages and locations, use only the provided options or 'Other'."
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
      
      // Ensure industry is one of our predefined categories or "Other"
      if (!INDUSTRY_CATEGORIES.includes(analysis.industry)) {
        analysis.industry = 'Other';
      }

      // Validate languages and locations
      if (analysis.targetAudience) {
        analysis.targetAudience.languages = analysis.targetAudience.languages.map((lang: string) =>
          LANGUAGES.includes(lang) ? lang : 'Other'
        );
        analysis.targetAudience.location = analysis.targetAudience.location.map((loc: string) =>
          LOCATIONS.includes(loc) ? loc : 'Global'
        );
      }

      return analysis;
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse website analysis');
    }
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(error.message || 'Failed to analyze website. Please try again.');
  }
}