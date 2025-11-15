import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { Candidate } from '../types';

let supabase: any = null;

// Initialize Supabase client only if configuration is available
if (config.SUPABASE_URL && (config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY)) {
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY);
}

export class SupabaseService {
  static async fetchAllCandidates(): Promise<Candidate[]> {
    if (!supabase) {
      console.warn('⚠️  Supabase not configured, returning empty candidates list');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id,name,snippet,url,location,embedding,experience,current_role,company,skills,education,industry,years_of_experience')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name || '',
        snippet: row.snippet || '',
        url: row.url,
        location: row.location,
        embedding: row.embedding || [],
        experience: row.experience,
        currentRole: row.current_role,
        company: row.company,
        skills: row.skills,
        education: row.education,
        industry: row.industry,
        yearsOfExperience: row.years_of_experience,
      }));
    } catch (error) {
      console.error('Supabase fetch error:', error);
      // Return empty array if Supabase fails
      return [];
    }
  }

  static async upsertCandidate(candidate: Candidate): Promise<void> {
    if (!supabase) {
      console.warn('⚠️  Supabase not configured, skipping candidate save');
      return;
    }

    try {
      const payload = {
        id: candidate.id || undefined,
        name: candidate.name,
        snippet: candidate.snippet,
        url: candidate.url,
        location: candidate.location || null,
        embedding: candidate.embedding || null,
        experience: candidate.experience || null,
        current_role: candidate.currentRole || null,
        company: candidate.company || null,
        skills: candidate.skills || null,
        education: candidate.education || null,
        industry: candidate.industry || null,
        years_of_experience: candidate.yearsOfExperience || null,
      };

      const { error } = await supabase
        .from('candidates')
        .upsert(payload, { onConflict: 'url' });

      if (error) throw error;
      
    } catch (error) {
      console.error('Supabase upsert error:', error);
      // Don't throw error, just log it
    }
  }

  static async getCandidateByUrl(url: string): Promise<Candidate | null> {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id,name,snippet,url,location,embedding,experience,current_role,company,skills,education,industry,years_of_experience')
        .eq('url', url)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? {
        id: data.id,
        name: data.name || '',
        snippet: data.snippet || '',
        url: data.url,
        location: data.location,
        embedding: data.embedding || [],
        experience: data.experience,
        currentRole: data.current_role,
        company: data.company,
        skills: data.skills,
        education: data.education,
        industry: data.industry,
        yearsOfExperience: data.years_of_experience,
      } : null;
    } catch (error) {
      console.error('Supabase get by URL error:', error);
      return null;
    }
  }
}