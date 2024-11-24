export interface Project {
  id: string;
  name: string;
  url: string;
  industry: string;
  services?: string[];
  target_audience?: {
    age?: number[];
    gender?: string[];
    languages?: string[];
    location?: string[];
  };
  user_id: string;
  created_at: string;
  updated_at: string;
}