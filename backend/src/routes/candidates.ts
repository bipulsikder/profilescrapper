import { Router, Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../services/supabase';
import { GeminiService } from '../services/gemini';
import { SaveCandidateRequest, Candidate } from '../types';

const router = Router();

// Get all candidates
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await SupabaseService.fetchAllCandidates();
    res.json({ candidates });
  } catch (error) {
    next(error);
  }
});

// Save a candidate
router.post('/save', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, snippet, url, location, embedding }: SaveCandidateRequest = req.body;
    
    if (!name?.trim() || !snippet?.trim() || !url?.trim()) {
      return res.status(400).json({ error: 'Name, snippet, and URL are required' });
    }

    // Generate embedding if not provided
    let finalEmbedding = embedding;
    if (!finalEmbedding || finalEmbedding.length === 0) {
      try {
        const candidateText = `${name}\n${snippet}`;
        finalEmbedding = await GeminiService.generateEmbedding(candidateText);
      } catch (error) {
        console.warn('⚠️  Failed to generate embedding for saved candidate:', error);
        finalEmbedding = undefined;
      }
    }

    const candidate: Candidate = {
      name: name.trim(),
      snippet: snippet.trim(),
      url: url.trim(),
      location: location || null,
      embedding: finalEmbedding,
    };

    await SupabaseService.upsertCandidate(candidate);
    
    res.json({ status: 'ok', message: 'Candidate saved successfully' });
  } catch (error) {
    next(error);
  }
});

// Get candidate by URL
router.get('/check/:url(*)', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = decodeURIComponent(req.params.url);
    const candidate = await SupabaseService.getCandidateByUrl(url);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({ candidate });
  } catch (error) {
    next(error);
  }
});

export { router as candidatesRouter };