'use client';

import axios from 'axios';

const SEMRUSH_API_KEY = process.env.NEXT_PUBLIC_SEMRUSH_API_KEY;
const SEMRUSH_API_URL = 'https://api.semrush.com/analytics/v1';

interface TrafficData {
  visits: number;
  previousVisits: number;
  trend: number;
}

// Mock data for development or when API is not available
const getMockTrafficData = (domain: string): TrafficData => {
  const currentVisits = Math.floor(Math.random() * 100000) + 10000;
  const previousVisits = Math.floor(currentVisits * (0.8 + Math.random() * 0.4));
  const trend = ((currentVisits - previousVisits) / previousVisits) * 100;

  return {
    visits: currentVisits,
    previousVisits,
    trend: Math.round(trend * 10) / 10,
  };
};

export async function getWebsiteTraffic(domain: string): Promise<TrafficData> {
  try {
    // If no API key, return mock data
    if (!SEMRUSH_API_KEY) {
      console.warn('SEMrush API key not found, using mock data');
      return getMockTrafficData(domain);
    }

    const response = await axios.get(SEMRUSH_API_URL, {
      params: {
        type: 'traffic_summary',
        key: SEMRUSH_API_KEY,
        domain: domain,
        database: 'us',
        export_columns: 'visits',
        display_limit: 2,
      },
    });

    if (!response.data) {
      throw new Error('No data received from SEMrush API');
    }

    const lines = response.data.split('\n').filter(Boolean);
    if (lines.length < 2) {
      throw new Error('Insufficient data from SEMrush API');
    }

    const currentVisits = parseInt(lines[1].split(';')[1]) || 0;
    const previousVisits = lines[2] ? parseInt(lines[2].split(';')[1]) || 0 : 0;
    
    const trend = previousVisits > 0 
      ? ((currentVisits - previousVisits) / previousVisits) * 100
      : 0;

    return {
      visits: currentVisits,
      previousVisits,
      trend: Math.round(trend * 10) / 10,
    };
  } catch (error) {
    console.error('SEMrush API Error:', error);
    // Fallback to mock data on error
    return getMockTrafficData(domain);
  }
}