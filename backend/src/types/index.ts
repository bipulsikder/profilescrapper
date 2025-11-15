export interface Candidate {
  id?: string;
  name: string;
  snippet: string;
  url: string;
  location?: string | null;
  similarity?: number;
  embedding?: number[];
  experience?: string | null;
  currentRole?: string | null;
  company?: string | null;
  skills?: string[];
  education?: string | null;
  industry?: string | null;
  yearsOfExperience?: number | null;
}

export interface SearchRequest {
  query: string;
  inputType?: 'requirement' | 'jd';
}

export interface SearchResponse {
  query: string;
  inputType: 'requirement' | 'jd';
  xrayQuery: string;
  results: Array<{
    name: string;
    snippet: string;
    url: string;
    location: string | null;
    similarity: number;
    experience?: string | null;
    currentRole?: string | null;
    company?: string | null;
    skills?: string[];
    education?: string | null;
    industry?: string | null;
    yearsOfExperience?: number | null;
  }>;
}

export interface SaveCandidateRequest {
  name: string;
  snippet: string;
  url: string;
  location?: string | null;
  embedding?: number[];
  experience?: string | null;
  currentRole?: string | null;
  company?: string | null;
  skills?: string[];
  education?: string | null;
  industry?: string | null;
  yearsOfExperience?: number | null;
}