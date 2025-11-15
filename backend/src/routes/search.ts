import { Router } from 'express';
import { GeminiService } from '../services/gemini';
import { GoogleSearchService } from '../services/googleSearch';
import { SupabaseService } from '../services/supabase';
import { SimilarityService } from '../services/similarity';
import { SearchRequest, SearchResponse } from '../types';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { query, inputType = 'requirement' }: SearchRequest = req.body;
    
    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`🔍 Processing ${inputType} search: "${query}"`);

    // Generate embeddings for the query
    let queryEmbedding: number[] | null = null;
    let useKeywordFallback = false;
    
    try {
      queryEmbedding = await GeminiService.generateEmbedding(query);
      console.log(`✅ Generated query embedding (${queryEmbedding.length} dimensions)`);
    } catch (error) {
      console.warn('⚠️  Embedding generation failed, using keyword fallback:', error);
      useKeywordFallback = true;
    }

    // Fetch existing candidates and calculate similarities
    const existingCandidates = await SupabaseService.fetchAllCandidates();
    console.log(`📊 Found ${existingCandidates.length} existing candidates`);

    // Calculate similarities for existing candidates using enhanced deep scoring
    const scoredExisting = existingCandidates.map(candidate => {
      if (!useKeywordFallback && candidate.embedding && candidate.embedding.length > 0 && queryEmbedding) {
        // Use cosine similarity for embedding-based matching
        const embeddingScore = SimilarityService.cosineSimilarity(queryEmbedding, candidate.embedding);
        // Enhance with deep similarity analysis
        const deepScore = SimilarityService.calculateDeepSimilarityScore(query, {
          name: candidate.name,
          snippet: candidate.snippet,
          location: candidate.location || undefined,
          url: candidate.url
        });
        // Combine both scores for maximum accuracy
        candidate.similarity = (embeddingScore * 0.6) + (deepScore * 0.4);
      } else {
        // Use enhanced deep similarity scoring for keyword fallback
        candidate.similarity = SimilarityService.calculateDeepSimilarityScore(query, {
          name: candidate.name,
          snippet: candidate.snippet,
          location: candidate.location || undefined,
          url: candidate.url
        });
      }
      return candidate;
    });

    // Generate X-Ray query using Gemini
    const xrayQuery = await GeminiService.generateXrayQuery(query, inputType);
    console.log(`🎯 Generated X-Ray query: "${xrayQuery}"`);

    // Search for new candidates using Google Custom Search - target 30+ results
    const newCandidates = await GoogleSearchService.searchLinkedInProfiles(xrayQuery, 40);
    console.log(`🔍 Found ${newCandidates.length} new candidates from Google Search`);

    // Process and score new candidates
    const processedNewCandidates = [];
    const existingUrls = new Set(existingCandidates.map(c => c.url));

    for (const candidate of newCandidates) {
      if (existingUrls.has(candidate.url)) {
        continue; // Skip duplicates
      }

      try {
        // Generate embedding for new candidate
        if (!useKeywordFallback) {
          const candidateText = `${candidate.name}\n${candidate.snippet}`;
          candidate.embedding = await GeminiService.generateEmbedding(candidateText);
          
          if (queryEmbedding) {
            const embeddingScore = SimilarityService.cosineSimilarity(queryEmbedding, candidate.embedding);
            const deepScore = SimilarityService.calculateDeepSimilarityScore(query, {
              name: candidate.name,
              snippet: candidate.snippet,
              location: candidate.location || undefined,
              url: candidate.url
            });
            candidate.similarity = (embeddingScore * 0.6) + (deepScore * 0.4);
          } else {
            candidate.similarity = SimilarityService.calculateDeepSimilarityScore(query, {
              name: candidate.name,
              snippet: candidate.snippet,
              location: candidate.location || undefined,
              url: candidate.url
            });
          }
        } else {
          // Use enhanced deep similarity scoring for new candidates
          candidate.similarity = SimilarityService.calculateDeepSimilarityScore(query, {
            name: candidate.name,
            snippet: candidate.snippet,
            location: candidate.location || undefined,
            url: candidate.url
          });
        }

        // Save to database
        await SupabaseService.upsertCandidate(candidate);
        processedNewCandidates.push(candidate);
        
      } catch (error) {
        console.warn('⚠️  Failed to process candidate:', candidate.name, error);
        // Continue with other candidates
      }
    }

    console.log(`✅ Processed ${processedNewCandidates.length} new candidates`);

    // Combine and rank all candidates - ensure minimum 30 results
    const allCandidates = [...scoredExisting, ...processedNewCandidates]
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 50); // Get more candidates to ensure 30+ after filtering

    // Convert similarity to percentage (0-100)
    const results = allCandidates.map(candidate => ({
      name: candidate.name,
      snippet: candidate.snippet,
      url: candidate.url,
      location: candidate.location || null,
      similarity: Math.round(((candidate.similarity || 0) * 100) * 100) / 100, // Round to 2 decimal places
      experience: candidate.experience || null,
      currentRole: candidate.currentRole || null,
      company: candidate.company || null,
      skills: candidate.skills || [],
      education: candidate.education || null,
      industry: candidate.industry || null,
      yearsOfExperience: candidate.yearsOfExperience || null,
    }));

    const response: SearchResponse = {
      query,
      inputType,
      xrayQuery,
      results,
    };

    console.log(`🎉 Search completed with ${results.length} results`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Search error:', error);
    next(error);
  }
});

export { router as searchRouter };