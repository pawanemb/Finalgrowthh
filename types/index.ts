// Project Types
export interface Project {
  id: string;
  name: string;
  url: string;
  industry: string;
  services: string[];
  target_audience: {
    gender: string[];
    languages: string[];
    location: string[];
  };
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface NewProject {
  name: string;
  url: string;
  services: string[];
  target_audience: {
    gender: string[];
    languages: string[];
    location: string[];
    industry: string[];
  };
}

// Traffic Types
export interface TrafficData {
  visits: number;
  previousVisits: number;
  trend: number;
}