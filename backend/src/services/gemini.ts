import axios from 'axios';
import { config } from '../config';

export class GeminiService {
  private static readonly EMBED_URL = config.GEMINI_EMBED_URL;
  private static readonly GENERATE_URL = config.GEMINI_GENERATE_URL;
  private static readonly API_KEY = config.GEMINI_API_KEY;

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.EMBED_URL}?key=${this.API_KEY}`,
        {
          model: 'models/embedding-001',
          content: {
            parts: [{ text }]
          }
        },
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = response.data;
      return data?.embedding?.values || 
             data?.embeddings?.[0]?.values || 
             (() => { throw new Error('Invalid embedding response format'); })();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Gemini embedding failed: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  static async generateXrayQuery(requirement: string, inputType: 'requirement' | 'jd' = 'requirement'): Promise<string> {
    const locationHint = this.extractLocation(requirement);
    
    // Enhanced deep analysis prompt for true requirement understanding
    const prompt = [
      '🧠 YOU ARE: A Senior Technical Recruiter with 20+ years experience who THINKS DEEPLY before searching',
      '🔍 MISSION: First UNDERSTAND the requirement deeply, then generate the PERFECT LinkedIn X-ray query',
      '',
      '📋 REQUIREMENT TO DEEP ANALYZE:',
      `"${requirement}"`,
      '',
      '🎯 THINKING PROTOCOL - Analyze BEFORE Generating:',
      '',
      'STEP 1: REQUIREMENT COMPREHENSION (Think like a recruiter)',
      '- WHAT is the core job function? (Extract the essence)',
      '- WHO is the ideal candidate? (Profile persona)',
      '- WHERE should they be located? (Geographic constraints)',
      '- WHEN do they need experience? (Seniority level)',
      '- WHY are these skills important? (Business context)',
      '- HOW complex is this search? (Simple vs Specialized)',
      '',
      'STEP 2: INTELLIGENT REQUIREMENT DECONSTRUCTION',
      'A) PRIMARY ROLE ANALYSIS:',
      '   - Core function: What do they actually DO?',
      '   - Industry context: What sector/vertical?',
      '   - Seniority level: Junior/Mid/Senior/Lead/Executive?',
      '   - Alternative titles: What else might they be called?',
      '',
      'B) SKILL PRIORITIZATION (Don\'t just list - PRIORITIZE):',
      '   - MUST-HAVE skills (Critical - 90% importance)',
      '   - NICE-TO-HAVE skills (Important - 60% importance)',
      '   - BONUS skills (Added value - 30% importance)',
      '   - DOMAIN knowledge (Industry-specific - 80% importance)',
      '',
      'C) EXPERIENCE INTELLIGENCE:',
      '   - Years range: Extract EXACT ranges mentioned',
      '   - Experience TYPE: What KIND of experience?',
      '   - Seniority markers: "Head of", "Senior", "Lead", "Principal"',
      '   - Career progression: Individual contributor vs Management',
      '',
      'D) LOCATION STRATEGY (Indian Market Intelligence):',
      '   - Primary city: Extract main location',
      '   - Metro alternatives: Mumbai/Delhi/Bangalore/Chennai/Hyderabad/Pune',
      '   - Tier-2 options: Ahmedabad, Jaipur, Chandigarh, Indore, Coimbatore',
      '   - NCR expansion: Delhi + Gurgaon + Noida + Faridabad',
      '',
      'STEP 3: SEARCH COMPLEXITY ASSESSMENT',
      '📊 SIMPLE SEARCH INDICATORS (Use broader approach):',
      '- Single function roles ("React Developer")',
      '- Common skills (JavaScript, Python, Management)',
      '- Standard experience levels ("5 years")',
      '- Single location ("Bangalore")',
      '',
      '📊 COMPLEX SEARCH INDICATORS (Use surgical precision):',
      '- Multiple specialized skills ("Rail logistics + SAP + Stakeholder management")',
      '- Niche industry knowledge ("Car carrier operations")',
      '- Senior leadership roles ("Head of Business Development")',
      '- Multiple locations ("Delhi NCR")',
      '- Domain expertise ("End-to-end rail operations")',
      '',
      'STEP 4: QUERY STRATEGY FORMULATION',
      '🔍 SIMPLE SEARCH STRATEGY:',
      '- Use broader job titles (catch more fish)',
      '- Include common skill variations',
      '- Moderate experience requirements',
      '- Standard location combinations',
      '',
      '🔍 COMPLEX SEARCH STRATEGY:',
      '- Surgical title precision (exact matches)',
      '- Mandatory skill combinations (AND logic)',
      '- Specific experience markers',
      '- Domain-specific terminology',
      '- Industry context keywords',
      '',
      '⚡ NOW EXECUTE: Based on your analysis above, generate the OPTIMAL query:',
      '',
      '🔍 BOOLEAN SEARCH EXECUTION:',
      'site:linkedin.com/in',
      '(PRIMARY_TITLE OR SYNONYM1 OR SYNONYM2) [Adjust based on complexity]',
      'AND',
      '(LOCATION_STRATEGY) [Based on requirement complexity]',
      'AND', 
      '(EXPERIENCE_STRATEGY) [Match seniority requirements]',
      'AND',
      '(SKILL_STRATEGY) [Prioritize must-have vs nice-to-have]',
      'AND',
      '(DOMAIN_STRATEGY) [Industry-specific terms if complex]',
      '',
      '🎯 INTELLIGENT EXAMPLES:',
      '',
      'SIMPLE REQUIREMENT: "Need a Python developer in Bangalore"',
      '→ site:linkedin.com/in ("python developer" OR "python engineer" OR "software engineer") AND (Bangalore OR Bengaluru) AND (Python OR "Python programming")',
      '',
      'COMPLEX REQUIREMENT: "Head of Rail & Business Development in Delhi with 5-7 years managing end-to-end rail operations, SAP experience, stakeholder management"',
      '→ site:linkedin.com/in ("Head of Rail" OR "Rail Business Development" OR "Rail Operations Manager") AND (Delhi OR "New Delhi" OR Gurgaon OR Noida) AND ("5+ years" OR "6+ years" OR "7+ years" OR "senior") AND ("rail operations" OR "rail logistics" OR "car carrier operations") AND (SAP OR "SAP ERP") AND ("stakeholder management" OR "key account management")',
      '',
      '🎯 OUTPUT REQUIREMENTS:',
      '1. Return ONLY the final X-ray query - NOTHING ELSE',
      '2. MUST start with: site:linkedin.com/in',
      '3. Use intelligent parentheses grouping',
      '4. Prioritize Indian locations and candidates',
      '5. Adjust complexity based on requirement sophistication',
      '6. Balance between precision and result quantity',
      locationHint ? `🌍 DETECTED LOCATION CONTEXT: ${locationHint}` : '',
      inputType === 'jd' ? '📄 JOB DESCRIPTION MODE: Extract ALL technical requirements, responsibilities, and qualifications comprehensively' : '📄 SIMPLE REQUIREMENT MODE: Focus on core needs with intelligent expansion'
    ].filter(Boolean).join('\n');

    try {
      console.log(`🤖 Sending to Gemini for DEEP X-ray query analysis...`);
      console.log(`📋 Input: "${requirement}"`);
      console.log(`🔍 Type: ${inputType}`);
      
      const response = await axios.post(
        `${this.GENERATE_URL}?key=${this.API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2, // Very low for maximum precision
            topK: 1,
            topP: 0.9,
            maxOutputTokens: 300
          }
        },
        {
          timeout: 45000, // Increased timeout for complex analysis
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = response.data;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      console.log(`🤖 Gemini analysis complete`);
      console.log(`📊 Raw response: "${text}"`);
      
      if (!text) {
        console.warn('⚠️  No analysis returned from Gemini, using intelligent fallback');
        return this.generateIntelligentFallback(requirement, locationHint, inputType);
      }

      // Extract the actual query from the analysis
      const queryMatch = text.match(/(?:OUTPUT:|Query:|Generated Query:|X-Ray Query:?)\s*([^\n]+)/i);
      let extractedQuery = queryMatch ? queryMatch[1].trim() : text.replace(/\n/g, ' ').trim();
      
      // Clean up the extracted query
      extractedQuery = extractedQuery
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log(`📊 Extracted query: "${extractedQuery}"`);
      
      // Validate and enhance the query
      if (!/site:\s*linkedin\.com\/in/i.test(extractedQuery)) {
        console.warn('⚠️  Missing LinkedIn site filter, adding professional enhancement');
        extractedQuery = `site:linkedin.com/in ${extractedQuery}`;
      }
      
      // Additional validation for query quality
      if (extractedQuery.length < 50) {
        console.warn('⚠️  Query too short, enhancing with intelligent fallback');
        return this.generateIntelligentFallback(requirement, locationHint, inputType);
      }
      
      console.log(`✅ SURGICAL QUERY GENERATED: "${extractedQuery}"`);
      return extractedQuery;
    } catch (error) {
      console.error('❌ Gemini DEEP analysis failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      console.warn('⚠️  Using intelligent fallback with deep analysis');
      return this.generateIntelligentFallback(requirement, locationHint, inputType);
    }
  }

  private static generateIntelligentFallback(requirement: string, locationHint: string | null, inputType?: 'requirement' | 'jd'): string {
    console.log('🔄 Generating intelligent fallback with deep pattern analysis');
    
    // Enhanced fallback with requirement complexity assessment
    const complexity = this.assessRequirementComplexity(requirement);
    console.log(`📊 Requirement complexity: ${complexity.level} (${complexity.score}/10)`);
    
    // Enhanced pattern matching with deeper understanding
    const patterns = {
      experience: /(\d+)\+?\s*years?/i,
      seniority: /\b(senior|lead|principal|head|director|manager|executive|vp|vice president)\b/i,
      location: locationHint || this.extractLocation(requirement),
      skills: this.extractSkillsWithPriority(requirement),
      titles: this.extractJobTitles(requirement),
      industry: this.extractIndustryTerms(requirement)
    };

    let fallbackQuery = 'site:linkedin.com/in';
    
    // Intelligent query building based on complexity
    let effectiveLevel = complexity.level;
    if (inputType === 'jd') {
      const wordCount = requirement.split(/\s+/).length;
      const hasIndustry = patterns.industry.length > 0;
      const hasMultipleHighSkills = patterns.skills.high.length >= 2;
      if (wordCount > 40 || hasIndustry || hasMultipleHighSkills) {
        effectiveLevel = 'complex';
      }
    }
    if (effectiveLevel === 'simple') {
      // Simple requirements: Broader approach to catch more candidates
      console.log('🎯 Simple requirement detected - using broader search strategy');
      
      // Add titles with broader synonyms
      if (patterns.titles.length > 0) {
        const primary = inputType === 'jd' ? (this.extractPrimaryTitleFromJD(requirement) || patterns.titles[0]) : patterns.titles[0];
        const broadTitles = this.getBroadJobTitles(primary);
        const synonyms = inputType === 'jd' ? this.getTitleSynonyms(primary) : [];
        const titleGroup = [...new Set([...broadTitles, ...synonyms])].slice(0, 6);
        fallbackQuery += ` AND (${titleGroup.map(t => `"${t}"`).join(' OR ')})`;
      }
      
      // Add skills with OR logic for broader reach
      if (patterns.skills.high.length > 0) {
        const skillTerms = patterns.skills.high.slice(0, 3).map(skill => `"${skill}"`);
        fallbackQuery += ` AND (${skillTerms.join(' OR ')})`;
      }
      
    } else {
      // Complex requirements: Surgical precision approach
      console.log('🎯 Complex requirement detected - using surgical precision strategy');
      
      // Add primary title with surgical precision
      if (patterns.titles.length > 0) {
        const primaryRaw = inputType === 'jd' ? (this.extractPrimaryTitleFromJD(requirement) || patterns.titles[0]) : patterns.titles[0];
        const primaryTitle = `"${primaryRaw}"`;
        const surgicalTitles = patterns.titles.slice(1, 3).map(t => `"${t}"`);
        const synonyms = inputType === 'jd' ? this.getTitleSynonyms(primaryRaw).slice(0, 3).map(t => `"${t}"`) : [];
        const titleGroup = [primaryTitle, ...surgicalTitles, ...synonyms];
        fallbackQuery += ` AND (${titleGroup.join(' OR ')})`;
      }
      
      // Add experience with seniority if detected
      const experienceMatch = requirement.match(/(\d+)\+?\s*-\s*(\d+)\+?\s*years?/i);
      if (experienceMatch) {
        const minYears = parseInt(experienceMatch[1]);
        const maxYears = parseInt(experienceMatch[2]);
        fallbackQuery += ` AND ("${minYears}+ years" OR "${maxYears}+ years" OR "${Math.floor((minYears + maxYears) / 2)}+ years")`;
      } else if (patterns.experience) {
        const years = parseInt(patterns.experience.exec(requirement)?.[1] || '0');
        if (years > 0) {
          fallbackQuery += ` AND ("${years}+ years" OR "${years + 1}+ years")`;
        }
      }
      
      // Add high-priority skills with AND logic for precision
      if (patterns.skills.high.length > 0) {
        const mandatorySkills = patterns.skills.high.slice(0, 2);
        fallbackQuery += ` AND (${mandatorySkills.map(skill => `"${skill}"`).join(' AND ')})`;
      }
      
      // Add medium-priority skills with OR logic
      if (patterns.skills.medium.length > 0) {
        const bonusSkills = patterns.skills.medium.slice(0, 2);
        fallbackQuery += ` AND (${bonusSkills.map(skill => `"${skill}"`).join(' OR ')})`;
      }
      
      // Add industry terms for domain specificity
      if (patterns.industry.length > 0) {
        fallbackQuery += ` AND (${patterns.industry.map(term => `"${term}"`).join(' OR ')})`;
      }
    }
    
    // Add location
    if (patterns.location) {
      const locationVariations = this.getLocationVariations(patterns.location);
      fallbackQuery += ` AND (${locationVariations})`;
    }
    
    console.log(`🎯 Intelligent fallback: "${fallbackQuery}"`);
    return fallbackQuery;
  }

  private static extractSkills(text: string): string[] {
    // Enhanced skill extraction
    const skills: string[] = [];
    
    // Technical skills patterns
    const techPatterns = [
      /\b(SAP|ERP|CRM|AWS|Azure|GCP|React|Angular|Vue|Node\.?js|Python|Java|JavaScript|SQL|MongoDB|PostgreSQL|Docker|Kubernetes|Terraform)\b/gi,
      /\b(project management|agile|scrum|kanban|leadership|communication|problem.solving|analytical|strategic)\b/gi,
      /\b(fleet management|transportation|logistics|supply.chain|operations|maintenance)\b/gi
    ];
    
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        skills.push(...matches.map(s => s.trim()));
      }
    });
    
    return [...new Set(skills)]; // Remove duplicates
  }

  private static extractJobTitles(text: string): string[] {
    // Enhanced job title extraction
    const titles: string[] = [];
    
    // Common job title patterns
    const titlePatterns = [
      /\b(fleet manager|transportation manager|logistics manager|operations manager|supply chain manager)\b/gi,
      /\b(software engineer|developer|programmer|architect|technical lead|engineering manager)\b/gi,
      /\b(data scientist|data analyst|business analyst|product manager|project manager)\b/gi,
      /\b(senior|lead|principal|head|director|vp|vice president)\s+(\w+\s*){1,3}(manager|engineer|developer|analyst|scientist)/gi
    ];
    
    titlePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        titles.push(...matches.map(t => t.trim()));
      }
    });
    
    // Extract primary role from the beginning of the requirement
    const primaryRoleMatch = text.match(/^need\s+\w+\s+(\w+\s*){1,3}(?:with|in|at)/i);
    if (primaryRoleMatch) {
      const primaryRole = primaryRoleMatch[0].replace(/^need\s+/i, '').replace(/\s+(with|in|at).*$/i, '').trim();
      if (primaryRole && !titles.includes(primaryRole)) {
        titles.unshift(primaryRole); // Add to beginning as primary
      }
    }
    
    return [...new Set(titles)].slice(0, 5); // Limit to top 5 titles
  }

  private static getLocationVariations(location: string): string {
    // Comprehensive Indian cities coverage
    const variations = [`"${location}"`];
    
    const indianLocationMappings: { [key: string]: string[] } = {
      // Tier-1 Cities
      'delhi': ['"New Delhi"', 'NCR', '"National Capital Region"', '"Delhi NCR"'],
      'mumbai': ['Bombay', '"Financial Capital of India"', '"Mumbai Metropolitan Region"'],
      'bangalore': ['Bengaluru', '"Silicon Valley of India"', '"IT Capital of India"'],
      'chennai': ['Madras', '"Detroit of India"'],
      'hyderabad': ['"City of Pearls"', 'Hitech City', '"Cyberabad"'],
      'pune': ['"Oxford of the East"', '"Automobile Hub"'],
      'kolkata': ['Calcutta', '"City of Joy"'],
      'ahmedabad': ['"Manchester of India"', '"Textile Hub"'],
      
      // Tier-2 Cities
      'gurgaon': ['Gurugram', 'NCR', '"Millennium City"'],
      'noida': ['NCR', '"New Okhla Industrial Development Authority"'],
      'faridabad': ['NCR', '"Industrial Hub"'],
      'ghaziabad': ['NCR', '"Gateway of Uttar Pradesh"'],
      'chandigarh': ['"The City Beautiful"'],
      'jaipur': ['"Pink City"', '"Capital of Rajasthan"'],
      'lucknow': ['"City of Nawabs"', '"Capital of Uttar Pradesh"'],
      'indore': ['"Commercial Capital of Madhya Pradesh"'],
      'bhopal': ['"City of Lakes"'],
      'nagpur': ['"Orange City"', '"Winter Capital of Maharashtra"'],
      'vadodara': ['Baroda', '"Cultural Capital of Gujarat"'],
      'surat': ['"Diamond City of the World"', '"Textile Hub"'],
      'coimbatore': ['"Manchester of South India"'],
      'kochi': ['Cochin', '"Queen of the Arabian Sea"'],
      'thiruvananthapuram': ['Trivandrum', '"Capital of Kerala"'],
      'visakhapatnam': ['Vizag', '"City of Destiny"'],
      'madurai': ['"Temple City"'],
      'mysore': ['Mysuru', '"City of Palaces"'],
      'guwahati': ['"Gateway to Northeast India"'],
      'patna': ['"Capital of Bihar"'],
      'ranchi': ['"Capital of Jharkhand"'],
      'raipur': ['"Capital of Chhattisgarh"'],
      'bhubaneswar': ['"Temple City of India"'],
      'dehradun': ['"Capital of Uttarakhand"']
    };
    
    const lowerLocation = location.toLowerCase();
    if (indianLocationMappings[lowerLocation]) {
      variations.push(...indianLocationMappings[lowerLocation]);
    }
    
    return variations.join(' OR ');
  }

  private static extractLocation(text: string): string | null {
    const locationPatterns = [
      /\b(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /\b(Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata|Ahmedabad|Surat|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Thane|Bhopal|Visakhapatnam|Pimpri|Pimpri-Chinchwad|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Kalyan|Vasai|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Navi Mumbai|Allahabad|Ranchi|Howrah|Coimbatore|Jabalpur|Gwalior|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Guwahati|Chandigarh|Solapur|Hubballi|Tiruchirappalli|Bareilly|Moradabad|Mysore|Tiruppur|Gurgaon|Aligarh|Jalandhar|Bhubaneswar|Salem|Warangal|Guntur|Bhiwandi|Saharanpur|Gorakhpur|Bikaner|Amravati|Noida|Firozabad|Kochi|Dehradun|Jammu|Ujjain|Davanagere|Jhansi|Mangalore|Kollam|Nellore|Tiruchirappalli|Kadapa|Kurnool|Tirupati|Anantapur|Vizianagaram|Eluru|Ongole|Machilipatnam|Nandyal|Srikakulam|Adoni|Madanapalle|Chittoor|Hindupur|Proddatur|Bhainsa|Khammam|Mancherial|Jagtial|Karimnagar|Ramagundam|Suryapet|Wanaparthy|Miryalaguda|Peddapalli|Kothagudem|Nizamabad|Siddipet|Mahbubnagar|Armoor|Nirmal|Kamareddy|Bodhan|Asifabad|Bellampalli|Bhadrachalam|Manuguru|Yellandu|Palwancha|Jangaon|Sircilla|Medak|Narayanpet|Andhra Pradesh|Telangana|Tamil Nadu|Karnataka|Kerala|Maharashtra|Gujarat|Rajasthan|Punjab|Haryana|Uttar Pradesh|Bihar|West Bengal|Odisha|Jharkhand|Chhattisgarh|Madhya Pradesh|Himachal Pradesh|Uttarakhand|Jammu and Kashmir|Goa|Assam|Manipur|Meghalaya|Mizoram|Nagaland|Tripura|Arunachal Pradesh|Sikkim)\b/g
    ];

    for (const pattern of locationPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/\b(?:in|at|near|around)\s+/i, '').trim();
      }
    }
    
    return null;
  }

  private static assessRequirementComplexity(requirement: string): { level: 'simple' | 'complex', score: number } {
    let complexityScore = 0;
    const text = requirement.toLowerCase();
    
    // Complexity indicators
    const complexIndicators = [
      // Multiple specialized skills
      { pattern: /\b(and|with|plus|including)\b.*\b(and|with|plus|including)\b.*\b(and|with|plus|including)\b/g, weight: 3 },
      { pattern: /\b(SAP|ERP|CRM|AWS|Azure|GCP|React|Angular|Vue|Node\.?js|Python|Java|JavaScript|SQL|MongoDB|PostgreSQL|Docker|Kubernetes|Terraform)\b.*\b(SAP|ERP|CRM|AWS|Azure|GCP|React|Angular|Vue|Node\.?js|Python|Java|JavaScript|SQL|MongoDB|PostgreSQL|Docker|Kubernetes|Terraform)\b/gi, weight: 2 },
      
      // Senior leadership roles
      { pattern: /\b(Head of|Director|VP|Vice President|Chief|C-level|CXO|Senior Vice President|Executive)\b/gi, weight: 2 },
      
      // Niche industry knowledge
      { pattern: /\b(rail|logistics|fleet|supply chain|transportation|car carrier|freight|cargo|warehousing|3PL|4PL)\b/gi, weight: 2 },
      { pattern: /\b(fintech|insurtech|healthtech|edtech|proptech|agritech)\b/gi, weight: 2 },
      
      // Multiple experience ranges
      { pattern: /\b(\d+)\+?\s*-\s*(\d+)\+?\s*years?\b/g, weight: 1 },
      { pattern: /\b(\d+)\+\s*years?.*\b(\d+)\+\s*years?\b/g, weight: 2 },
      
      // Multiple locations
      { pattern: /\b(Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata|Ahmedabad|Gurgaon|Noida|Faridabad|Ghaziabad)\b.*\b(Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata|Ahmedabad|Gurgaon|Noida|Faridabad|Ghaziabad)\b/gi, weight: 1 },
      
      // Domain expertise indicators
      { pattern: /\b(end-to-end|full stack|full lifecycle|enterprise|strategic|operational excellence|business development|key account|stakeholder)\b/gi, weight: 1 },
      
      // Complex soft skills combinations
      { pattern: /\b(communication|leadership|stakeholder|negotiation|presentation|interpersonal|team management|people management)\b.*\b(communication|leadership|stakeholder|negotiation|presentation|interpersonal|team management|people management)\b.*\b(communication|leadership|stakeholder|negotiation|presentation|interpersonal|team management|people management)\b/gi, weight: 2 }
    ];
    
    // Simple indicators
    const simpleIndicators = [
      { pattern: /^\s*(need|want|looking for|searching for)\s+(a|an)\s+\w+\s+(in|at|with)\s+/i, weight: -1 },
      { pattern: /^\s*\w+\s+(developer|engineer|manager|analyst)\s+(in|at)\s+\w+\s*$/i, weight: -2 },
      { pattern: /\b(junior|entry level|fresher|intern|trainee)\b/gi, weight: -1 }
    ];
    
    // Calculate complexity score
    complexIndicators.forEach(({ pattern, weight }) => {
      const matches = text.match(pattern);
      if (matches) {
        complexityScore += weight * (matches.length || 1);
      }
    });
    
    simpleIndicators.forEach(({ pattern, weight }) => {
      if (pattern.test(text)) {
        complexityScore += weight;
      }
    });
    
    // Length factor
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 50) complexityScore += 1;
    if (wordCount > 100) complexityScore += 1;
    if (wordCount < 10) complexityScore -= 1;
    
    // Determine complexity level
    const level = complexityScore >= 3 ? 'complex' : 'simple';
    const score = Math.max(0, Math.min(10, complexityScore + 5));
    
    console.log(`📊 Requirement complexity analysis: ${level} (score: ${score}/10)`);
    console.log(`📝 Word count: ${wordCount}, Raw score: ${complexityScore}`);
    
    return { level, score };
  }

  private static extractSkillsWithPriority(requirement: string): { high: string[], medium: string[], low: string[] } {
    const text = requirement.toLowerCase();
    const skills = {
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[]
    };
    
    // High-priority skills (must-have)
    const highPriorityPatterns = [
      /\b(SAP|ERP|CRM|AWS|Azure|GCP|React|Angular|Vue|Node\.?js|Python|Java|JavaScript|SQL|MongoDB|PostgreSQL|Docker|Kubernetes|Terraform|Git|Jenkins|CI\/CD)\b/gi,
      /\b(rail|logistics|fleet|supply chain|transportation|car carrier|freight|cargo|warehousing|3PL|4PL|business development|key account|stakeholder|end-to-end)\b/gi,
      /\b(senior|lead|principal|head|director|vp|vice president|chief|manager)\b/gi,
      /\b(5\+?\s*years?|6\+?\s*years?|7\+?\s*years?|8\+?\s*years?|9\+?\s*years?|10\+?\s*years?)\b/gi
    ];
    
    // Medium-priority skills (nice-to-have)
    const mediumPriorityPatterns = [
      /\b(communication|leadership|negotiation|presentation|interpersonal|team management|people management|strategic|analytical|problem.solving)\b/gi,
      /\b(agile|scrum|kanban|waterfall|project management|operations|process|efficiency|optimization)\b/gi,
      /\b(Microsoft Office|Excel|PowerPoint|Word|Outlook|Teams|Slack|Jira|Confluence|Trello|Asana)\b/gi
    ];
    
    // Extract skills based on priority
    highPriorityPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        skills.high.push(...matches.map(s => s.trim()));
      }
    });
    
    mediumPriorityPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        skills.medium.push(...matches.map(s => s.trim()));
      }
    });
    
    // Remove duplicates and normalize
    skills.high = [...new Set(skills.high)].slice(0, 5);
    skills.medium = [...new Set(skills.medium)].slice(0, 5);
    
    console.log(`🎯 Skills priority extraction: High[${skills.high.length}], Medium[${skills.medium.length}], Low[${skills.low.length}]`);
    
    return skills;
  }

  private static extractIndustryTerms(requirement: string): string[] {
    const text = requirement.toLowerCase();
    const industries: string[] = [];
    
    const industryPatterns = [
      /\b(transportation|logistics|supply chain|fleet|rail|shipping|cargo|freight|warehousing|3PL|4PL)\b/gi,
      /\b(technology|IT|software|computer|digital|internet|web|mobile|app|SaaS|PaaS|IaaS)\b/gi,
      /\b(finance|banking|fintech|insurance|investment|trading|capital|wealth|asset|risk)\b/gi,
      /\b(healthcare|medical|hospital|pharma|biotech|clinical|patient|health|wellness)\b/gi,
      /\b(ecommerce|retail|consumer|marketplace|shopping|online|B2B|B2C|D2C)\b/gi,
      /\b(manufacturing|automotive|aerospace|defense|industrial|engineering|construction|real estate|property)\b/gi,
      /\b(energy|oil|gas|renewable|solar|wind|power|utility|electricity|nuclear)\b/gi,
      /\b(telecommunications|telecom|wireless|mobile|broadband|internet|cable|satellite)\b/gi,
      /\b(education|edtech|learning|training|university|college|school|academic|student)\b/gi,
      /\b(consulting|advisory|strategy|management|operations|transformation|digital)\b/gi
    ];
    
    industryPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        industries.push(...matches.map(s => s.trim()));
      }
    });
    
    return [...new Set(industries)].slice(0, 3);
  }

  private static getBroadJobTitles(primaryTitle: string): string[] {
    const title = primaryTitle.toLowerCase();
    
    // Broad title mappings for simple searches
    const broadMappings: { [key: string]: string[] } = {
      'developer': ['developer', 'engineer', 'programmer', 'coder', 'software engineer'],
      'engineer': ['engineer', 'developer', 'programmer', 'architect', 'technical lead'],
      'manager': ['manager', 'lead', 'head', 'director', 'supervisor', 'coordinator'],
      'analyst': ['analyst', 'specialist', 'consultant', 'expert', 'advisor'],
      'administrator': ['administrator', 'admin', 'coordinator', 'manager', 'executive'],
      'executive': ['executive', 'manager', 'lead', 'officer', 'representative'],
      'specialist': ['specialist', 'expert', 'consultant', 'analyst', 'advisor'],
      'consultant': ['consultant', 'advisor', 'specialist', 'expert', 'analyst'],
      'coordinator': ['coordinator', 'manager', 'administrator', 'organizer', 'facilitator'],
      'supervisor': ['supervisor', 'manager', 'lead', 'coordinator', 'team lead'],
      'director': ['director', 'head', 'manager', 'lead', 'chief', 'vp'],
      'head': ['head', 'director', 'manager', 'lead', 'chief', 'vp'],
      'lead': ['lead', 'manager', 'senior', 'principal', 'head', 'director'],
      'senior': ['senior', 'lead', 'principal', 'manager', 'director', 'head'],
      'principal': ['principal', 'senior', 'lead', 'chief', 'director', 'head'],
      'chief': ['chief', 'head', 'director', 'vp', 'principal', 'lead'],
      'vp': ['vp', 'vice president', 'director', 'head', 'chief', 'principal'],
      'vice president': ['vice president', 'vp', 'director', 'head', 'chief']
    };
    
    // Find matching broad titles
    for (const [key, variations] of Object.entries(broadMappings)) {
      if (title.includes(key)) {
        return [primaryTitle, ...variations.filter(v => v !== key)].slice(0, 4);
      }
    }
    
    // Default broad expansion
    return [primaryTitle, `${primaryTitle} specialist`, `${primaryTitle} expert`, `${primaryTitle} lead`].slice(0, 4);
  }

  private static extractPrimaryTitleFromJD(text: string): string | null {
    const patterns = [
      /\bwe are looking for\s+([^\n,]+?)(?:\s+with|\s+in|\s+for|\s+who|\.|,)/i,
      /\bseeking\s+([^\n,]+?)(?:\s+with|\s+in|\s+for|\s+who|\.|,)/i,
      /\brole\s*:\s*([^\n,]+?)(?:\.|,)/i,
      /\bposition\s*:\s*([^\n,]+?)(?:\.|,)/i,
      /\btitle\s*:\s*([^\n,]+?)(?:\.|,)/i
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m && m[1]) {
        const title = m[1].trim();
        if (title.length > 3 && title.length < 80) return title;
      }
    }
    return null;
  }

  private static getTitleSynonyms(primaryTitle: string): string[] {
    const t = primaryTitle.toLowerCase();
    const map: { [key: string]: string[] } = {
      'business development': ['bd manager', 'partnerships manager', 'growth manager', 'sales development'],
      'rail': ['rail operations manager', 'rail logistics manager', 'rail freight manager'],
      'logistics': ['operations manager', 'supply chain manager', 'transportation manager'],
      'supply chain': ['logistics manager', 'operations manager', 'procurement manager'],
      'head': ['director', 'lead', 'senior manager'],
      'manager': ['lead', 'head', 'supervisor'],
      'developer': ['engineer', 'software engineer', 'programmer']
    };
    const result: string[] = [];
    for (const [key, synonyms] of Object.entries(map)) {
      if (t.includes(key)) result.push(...synonyms);
    }
    return [...new Set(result)];
  }
}
