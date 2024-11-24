'use client';

import useSWR from 'swr';
import { getWebsiteTraffic } from '@/lib/semrush';

const normalizeUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsedUrl.hostname;
  } catch (error) {
    console.warn('Invalid URL:', url);
    return null;
  }
};

export function useTraffic(url: string) {
  const domain = normalizeUrl(url);

  const { data, error, isLoading } = useSWR(
    domain ? ['traffic', domain] : null,
    async ([_, domain]) => {
      try {
        return await getWebsiteTraffic(domain);
      } catch (error) {
        console.error('Traffic fetch error:', error);
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 3600000, // Refresh every hour
      dedupingInterval: 3600000, // Dedupe requests for 1 hour
      errorRetryCount: 2,
    }
  );

  return {
    traffic: data,
    isLoading: isLoading && domain !== null,
    isError: error,
  };
}