'use client';

interface WebsiteAnalysis {
  projectName: string;
  industry: string;
  description?: string;
  services?: string[];
  targetAudience?: {
    age: string[];
    gender: string[];
    languages: string[];
    location: string[];
  };
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  try {
    // Clean and validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (error) {
      throw new Error('Please enter a valid website URL');
    }

    // Format project name based on URL structure
    const domainParts = parsedUrl.hostname.replace('www.', '').split('.');
    let projectName = '';

    if (domainParts.length > 2) {
      // Handle subdomains (e.g., blog.emb.global -> Blog EMB)
      const subdomain = domainParts[0];
      const mainDomain = domainParts[1];
      projectName = `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} ${mainDomain.toUpperCase()}`;
    } else {
      projectName = domainParts[0]
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Try to get additional data from the API
    try {
      const response = await fetch(`/api/analyze-website?url=${encodeURIComponent(parsedUrl.toString())}`, {
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

      return {
        projectName: data.projectName || projectName,
        industry: data.industry || 'Other',
        description: data.description,
        services: data.services || [
          'Website Development',
          'Digital Marketing',
          'Content Creation',
          'SEO Optimization'
        ],
        targetAudience: data.targetAudience || {
          age: ['25-34', '35-44'],
          gender: ['All'],
          languages: ['English'],
          location: ['Global']
        }
      };
    } catch (error) {
      console.error('API analysis failed:', error);
      
      // Return basic analysis based on URL
      return {
        projectName,
        industry: 'Other',
        description: `Website for ${projectName}`,
        services: [
          'Website Development',
          'Digital Marketing',
          'Content Creation',
          'SEO Optimization'
        ],
        targetAudience: {
          age: ['25-34', '35-44'],
          gender: ['All'],
          languages: ['English'],
          location: ['Global']
        }
      };
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze website. Please try again.');
  }
}