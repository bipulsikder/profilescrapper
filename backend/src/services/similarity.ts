export class SimilarityService {
  static cosineSimilarity(a: number[], b: number[]): number {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    
    let dot = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : Math.max(0, Math.min(1, dot / denominator));
  }

  private static calculateIndianBonus(candidateProfile: {
    name: string;
    snippet: string;
    location?: string;
    url: string;
  }): number {
    let bonus = 0;
    const text = `${candidateProfile.name} ${candidateProfile.snippet} ${candidateProfile.location || ''}`.toLowerCase();
    
    // Indian cities bonus
    const indianCities = [
      'delhi', 'mumbai', 'bangalore', 'chennai', 'hyderabad', 'pune', 'kolkata', 'ahmedabad',
      'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal',
      'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
      'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar', 'aurangabad',
      'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur',
      'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh',
      'solapur', 'hubballi', 'tiruchirappalli', 'bareilly', 'moradabad', 'mysore', 'tiruppur', 'gurgaon',
      'aligarh', 'jalandhar', 'bhubaneswar', 'salem', 'warangal', 'guntur', 'bhiwandi', 'saharanpur',
      'gorakhpur', 'bikaner', 'amravati', 'noida', 'firozabad', 'kochi', 'dehradun', 'jammu',
      'ujjain', 'davanagere', 'jhansi', 'mangalore', 'kollam', 'nellore', 'kadapa', 'kurnool',
      'tirupati', 'anantapur', 'vizianagaram', 'eluru', 'ongole', 'machilipatnam', 'nandyal', 'srikakulam',
      'adoni', 'madanapalle', 'chittoor', 'hindupur', 'proddatur', 'bhainsa', 'khammam', 'mancherial',
      'jagtial', 'karimnagar', 'ramagundam', 'suryapet', 'wanaparthy', 'miryalaguda', 'peddapalli', 'kothagudem',
      'nizamabad', 'siddipet', 'mahbubnagar', 'armoor', 'nirmal', 'kamareddy', 'bodhan', 'asifabad',
      'bellampalli', 'bhadrachalam', 'manuguru', 'yellandu', 'palwancha', 'jangaon', 'sircilla', 'medak',
      'narayanpet'
    ];
    
    // Check for Indian cities
    for (const city of indianCities) {
      if (text.includes(city)) {
        bonus += 0.6;
        break;
      }
    }
    
    // Indian states bonus
    const indianStates = [
      'andhra pradesh', 'telangana', 'tamil nadu', 'karnataka', 'kerala', 'maharashtra', 'gujarat', 'rajasthan',
      'punjab', 'haryana', 'uttar pradesh', 'bihar', 'west bengal', 'odisha', 'jharkhand', 'chhattisgarh',
      'madhya pradesh', 'himachal pradesh', 'uttarakhand', 'jammu and kashmir', 'goa', 'assam', 'manipur',
      'meghalaya', 'mizoram', 'nagaland', 'tripura', 'arunachal pradesh', 'sikkim', 'delhi'
    ];
    
    for (const state of indianStates) {
      if (text.includes(state)) {
        bonus += 0.4;
        break;
      }
    }
    
    // Indian companies bonus
    const indianCompanies = [
      'tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'cognizant', 'accenture', 'capgemini', 'ibm india',
      'google india', 'amazon india', 'microsoft india', 'flipkart', 'swiggy', 'zomato', 'ola', 'uber india',
      'paytm', 'phonepe', 'byju\'s', 'unacademy', 'reliance', 'tata', 'birla', 'mahindra', 'bajaj', 'hero',
      'maruti', 'suzuki', 'hyundai india', 'toyota india', 'ford india', 'volkswagen india', 'mercedes india',
      'bmw india', 'audi india', 'jio', 'airtel', 'vodafone', 'idea', 'bsnl'
    ];
    
    for (const company of indianCompanies) {
      if (text.includes(company)) {
        bonus += 0.3;
        break;
      }
    }
    
    // Indian educational institutions bonus
    const indianInstitutions = [
      'iit', 'iim', 'nit', 'aiims', 'iisc', 'bits', 'vit', 'manipal', 'symbiosis', 'amity', 'lovely professional',
      'chandigarh university', 'banaras hindu university', 'delhi university', 'mumbai university', 'calcutta university',
      'madras university', 'pune university', 'bangalore university', 'hyderabad university', 'jawaharlal nehru university',
      'aligarh muslim university', 'jamia millia islamia', 'university of delhi', 'university of mumbai', 'university of calcutta',
      'university of madras', 'university of pune', 'university of bangalore', 'university of hyderabad', 'anna university',
      'jadavpur university', 'birla institute', 'indian institute'
    ];
    
    for (const institution of indianInstitutions) {
      if (text.includes(institution)) {
        bonus += 0.2;
        break;
      }
    }
    
    // Indian domain bonus
    if (candidateProfile.url.includes('.in') || candidateProfile.url.includes('in.linkedin.com')) {
      bonus += 0.5;
    }
    
    // Indian currency bonus
    if (text.includes('rupee') || text.includes('rupees') || text.includes('lakh') || text.includes('crore') || text.includes('inr') || text.includes('₹')) {
      bonus += 0.3;
    }
    
    // Common Indian names bonus
    const indianNames = [
      'kumar', 'singh', 'sharma', 'verma', 'gupta', 'agarwal', 'jain', 'patel', 'shah', 'mehta', 'desai',
      'iyer', 'nair', 'menon', 'reddy', 'rao', 'naidu', 'chowdhury', 'banerjee', 'mukherjee', 'chatterjee',
      'das', 'bose', 'ghosh', 'sen', 'bhat', 'bhatia', 'khanna', 'malhotra', 'kapoor', 'chopra', 'johar',
      'khan', 'sheikh', 'ali', 'hussain', 'ahmed', 'malik', 'qureshi', 'ansari', 'siddiqui'
    ];
    
    for (const name of indianNames) {
      if (candidateProfile.name.toLowerCase().includes(name)) {
        bonus += 0.2;
        break;
      }
    }
    
    return Math.min(1, bonus); // Cap at 1.0
  }

  static keywordSimilarity(textA: string, textB: string): number {
    const tokensA = this.normalizeTokens(textA);
    const tokensB = this.normalizeTokens(textB);
    
    if (tokensA.length === 0 || tokensB.length === 0) return 0;
    
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    
    let intersection = 0;
    for (const token of setA) {
      if (setB.has(token)) intersection++;
    }
    
    const denominator = Math.sqrt(setA.size * setB.size);
    return denominator === 0 ? 0 : intersection / denominator;
  }

  static advancedKeywordSimilarity(query: string, candidateText: string): number {
    const queryTokens = this.normalizeTokens(query);
    const candidateTokens = this.normalizeTokens(candidateText);
    
    if (queryTokens.length === 0 || candidateTokens.length === 0) return 0;
    
    // Calculate different similarity metrics with enhanced weighting
    const exactMatches = this.countExactMatches(queryTokens, candidateTokens);
    const stemMatches = this.countStemMatches(queryTokens, candidateTokens);
    const synonymMatches = this.countSynonymMatches(queryTokens, candidateTokens);
    const semanticMatches = this.countSemanticMatches(queryTokens, candidateTokens);
    const weightedMatches = this.countWeightedMatches(queryTokens, candidateTokens);
    
    // Enhanced weighted combination for better precision
    const totalScore = (
      (exactMatches * 0.4) +        // Exact matches are most important
      (weightedMatches * 0.25) +      // Weighted matches for priority skills
      (semanticMatches * 0.15) +      // Semantic understanding
      (stemMatches * 0.12) +         // Stem variations
      (synonymMatches * 0.08)        // Synonyms for broader coverage
    );
    
    const maxPossibleScore = queryTokens.length;
    const baseScore = maxPossibleScore === 0 ? 0 : Math.min(1, totalScore / maxPossibleScore);
    
    // Apply bonus multipliers for critical matches
    const bonusMultiplier = this.calculateBonusMultiplier(queryTokens, candidateTokens);
    
    return Math.min(1, baseScore * bonusMultiplier);
  }

  static calculateDeepSimilarityScore(requirement: string, candidateProfile: {
    name: string;
    snippet: string;
    location?: string;
    url: string;
  }): number {
    // Multi-dimensional similarity scoring for maximum relevance
    const text = `${candidateProfile.name} ${candidateProfile.snippet} ${candidateProfile.location || ''}`.toLowerCase();
    const requirementLower = requirement.toLowerCase();
    
    // Base similarity from advanced keyword matching
    const baseScore = this.advancedKeywordSimilarity(requirement, text);
    
    // Experience level matching
    const experienceScore = this.calculateExperienceMatch(requirementLower, text);
    
    // Location relevance
    const locationScore = this.calculateLocationMatch(requirementLower, candidateProfile.location || '');
    
    // Seniority level matching
    const seniorityScore = this.calculateSeniorityMatch(requirementLower, text);
    
    // Technical skills matching
    const technicalScore = this.calculateTechnicalSkillsMatch(requirementLower, text);
    
    // Industry/domain matching
    const industryScore = this.calculateIndustryMatch(requirementLower, text);
    
    // Bonus for Indian candidates
    const indianBonus = this.calculateIndianBonus(candidateProfile);
    
    // Weighted combination of all factors with Indian bonus
    const finalScore = (
      baseScore * 0.35 +
      experienceScore * 0.2 +
      technicalScore * 0.15 +
      seniorityScore * 0.1 +
      locationScore * 0.1 +
      industryScore * 0.05 +
      indianBonus * 0.05
    );
    
    return Math.min(1, finalScore);
  }

  private static countSemanticMatches(tokensA: string[], tokensB: string[]): number {
    const semanticMap = this.getSemanticMap();
    const setB = new Set(tokensB);
    
    let matches = 0;
    for (const token of tokensA) {
      const semanticGroups = semanticMap.get(token) || [];
      if (semanticGroups.some(group => setB.has(group))) {
        matches++;
      }
    }
    return matches;
  }

  private static countWeightedMatches(tokensA: string[], tokensB: string[]): number {
    const weightedKeywords = this.getWeightedKeywords();
    const setB = new Set(tokensB);
    
    let weightedScore = 0;
    for (const token of tokensA) {
      const weight = weightedKeywords.get(token) || 1.0;
      if (setB.has(token)) {
        weightedScore += weight;
      }
    }
    return weightedScore;
  }

  private static calculateBonusMultiplier(tokensA: string[], tokensB: string[]): number {
    const criticalKeywords = this.getCriticalKeywords();
    const setB = new Set(tokensB);
    
    let bonusMultiplier = 1.0;
    let criticalMatches = 0;
    
    for (const token of tokensA) {
      if (criticalKeywords.has(token) && setB.has(token)) {
        criticalMatches++;
      }
    }
    
    // Apply bonus for critical keyword matches
    if (criticalMatches >= 3) bonusMultiplier = 1.3;
    else if (criticalMatches >= 2) bonusMultiplier = 1.2;
    else if (criticalMatches >= 1) bonusMultiplier = 1.1;
    
    return bonusMultiplier;
  }

  private static calculateExperienceMatch(requirement: string, candidateText: string): number {
    // Extract experience requirements and match against candidate text
    const expPatterns = [
      /(\d+)\+?\s*years?/gi,
      /(\d+)\s*-\s*(\d+)\s*years?/gi,
      /\b(senior|lead|principal|head|director)\b/gi
    ];
    
    let requiredExperience = 0;
    let experienceMatch = 0;
    
    // Find required experience
    for (const pattern of expPatterns) {
      const matches = requirement.match(pattern);
      if (matches) {
        for (const match of matches) {
          const years = match.match(/(\d+)/);
          if (years) {
            requiredExperience = Math.max(requiredExperience, parseInt(years[1]));
          }
        }
      }
    }
    
    // Find candidate experience
    for (const pattern of expPatterns) {
      const matches = candidateText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const years = match.match(/(\d+)/);
          if (years) {
            experienceMatch = Math.max(experienceMatch, parseInt(years[1]));
          }
        }
      }
    }
    
    if (requiredExperience === 0) return 1.0; // No experience requirement
    if (experienceMatch === 0) return 0.2; // No experience found
    
    // Score based on experience match
    if (experienceMatch >= requiredExperience) return 1.0;
    if (experienceMatch >= requiredExperience - 1) return 0.8;
    if (experienceMatch >= requiredExperience - 2) return 0.6;
    return 0.3;
  }

  private static calculateLocationMatch(requirement: string, candidateLocation: string): number {
    if (!candidateLocation || !requirement) return 0.5;
    
    const locationVariations = this.getLocationVariationsForMatching(requirement);
    const candidateLocationLower = candidateLocation.toLowerCase();
    
    for (const location of locationVariations) {
      if (candidateLocationLower.includes(location.toLowerCase())) {
        return 1.0;
      }
    }
    
    // Check for nearby locations or same country/region
    if (this.isSameRegion(requirement, candidateLocation)) {
      return 0.7;
    }
    
    return 0.2;
  }

  private static calculateSeniorityMatch(requirement: string, candidateText: string): number {
    const seniorityLevels = {
      junior: ['junior', 'entry', 'associate', 'fresher'],
      mid: ['mid', 'intermediate', 'software', 'developer'],
      senior: ['senior', 'sr', 'lead', 'principal', 'staff'],
      leadership: ['head', 'director', 'vp', 'vice president', 'cto', 'ceo']
    };
    
    let requiredLevel = 'mid';
    let candidateLevel = 'mid';
    
    // Determine required seniority
    for (const [level, keywords] of Object.entries(seniorityLevels)) {
      if (keywords.some(keyword => requirement.toLowerCase().includes(keyword))) {
        requiredLevel = level;
        break;
      }
    }
    
    // Determine candidate seniority
    for (const [level, keywords] of Object.entries(seniorityLevels)) {
      if (keywords.some(keyword => candidateText.toLowerCase().includes(keyword))) {
        candidateLevel = level;
        break;
      }
    }
    
    const levelHierarchy = { junior: 1, mid: 2, senior: 3, leadership: 4 };
    const required = levelHierarchy[requiredLevel as keyof typeof levelHierarchy] || 2;
    const candidate = levelHierarchy[candidateLevel as keyof typeof levelHierarchy] || 2;
    
    if (candidate >= required) return 1.0;
    if (candidate === required - 1) return 0.7;
    return 0.3;
  }

  private static calculateTechnicalSkillsMatch(requirement: string, candidateText: string): number {
    const techSkills = this.extractTechnicalSkills(requirement);
    const candidateSkills = this.extractTechnicalSkills(candidateText);
    
    if (techSkills.length === 0) return 0.5;
    if (candidateSkills.length === 0) return 0.1;
    
    let matches = 0;
    for (const skill of techSkills) {
      if (candidateSkills.some(candidateSkill => 
        candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(candidateSkill.toLowerCase())
      )) {
        matches++;
      }
    }
    
    return matches / techSkills.length;
  }

  private static calculateIndustryMatch(requirement: string, candidateText: string): number {
    const industries = {
      'transportation': ['transportation', 'logistics', 'fleet', 'supply chain', 'shipping'],
      'technology': ['software', 'technology', 'tech', 'it', 'digital'],
      'finance': ['finance', 'banking', 'fintech', 'financial services'],
      'healthcare': ['healthcare', 'medical', 'hospital', 'pharma'],
      'ecommerce': ['ecommerce', 'retail', 'online', 'marketplace']
    };
    
    let requirementIndustry = 'general';
    let candidateIndustry = 'general';
    
    // Determine requirement industry
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => requirement.toLowerCase().includes(keyword))) {
        requirementIndustry = industry;
        break;
      }
    }
    
    // Determine candidate industry
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => candidateText.toLowerCase().includes(keyword))) {
        candidateIndustry = industry;
        break;
      }
    }
    
    if (requirementIndustry === candidateIndustry) return 1.0;
    if (requirementIndustry === 'general' || candidateIndustry === 'general') return 0.5;
    return 0.2;
  }

  private static extractTechnicalSkills(text: string): string[] {
    const techPatterns = [
      /\b(SAP|ERP|CRM|AWS|Azure|GCP|React|Angular|Vue|Node\.?js|Python|Java|JavaScript|SQL|MongoDB|PostgreSQL|Docker|Kubernetes|Terraform|Git|Jenkins|CI\/CD)\b/gi,
      /\b(Java|Python|JavaScript|TypeScript|C\+\+|C#|Go|Rust|PHP|Ruby|Swift|Kotlin)\b/gi,
      /\b(React|Angular|Vue|jQuery|Bootstrap|Tailwind|Sass|Less)\b/gi,
      /\b(Node\.?js|Express|Django|Flask|Spring|Rails|Laravel)\b/gi,
      /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Cassandra)\b/gi,
      /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|Linux|Windows)\b/gi
    ];
    
    const skills: string[] = [];
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        skills.push(...matches.map(s => s.trim()));
      }
    });
    
    return [...new Set(skills)];
  }

  private static getLocationVariationsForMatching(location: string): string[] {
    const variations = [location];
    
    const locationMappings: { [key: string]: string[] } = {
      'delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'noida', 'ghaziabad'],
      'bangalore': ['bangalore', 'bengaluru'],
      'mumbai': ['mumbai', 'bombay', 'pune'],
      'chennai': ['chennai', 'madras'],
      'hyderabad': ['hyderabad', 'secunderabad'],
      'pune': ['pune', 'mumbai'],
      'gurgaon': ['gurgaon', 'gurugram', 'delhi', 'ncr'],
      'noida': ['noida', 'delhi', 'ncr']
    };
    
    const lowerLocation = location.toLowerCase();
    if (locationMappings[lowerLocation]) {
      variations.push(...locationMappings[lowerLocation]);
    }
    
    return [...new Set(variations)];
  }

  private static isSameRegion(requirement: string, candidateLocation: string): boolean {
    // Simple region matching - can be enhanced with more sophisticated logic
    const requirementLower = requirement.toLowerCase();
    const candidateLower = candidateLocation.toLowerCase();
    
    // Check if both are in India
    const indianCities = ['delhi', 'mumbai', 'bangalore', 'chennai', 'hyderabad', 'pune', 'kolkata', 'ahmedabad'];
    const isReqIndia = indianCities.some(city => requirementLower.includes(city));
    const isCandIndia = indianCities.some(city => candidateLower.includes(city));
    
    if (isReqIndia && isCandIndia) return true;
    
    return false;
  }

  private static getSemanticMap(): Map<string, string[]> {
    return new Map([
      ['manager', ['lead', 'head', 'director', 'supervisor', 'team lead']],
      ['developer', ['programmer', 'engineer', 'coder', 'software', 'full stack']],
      ['experience', ['exp', 'years', 'yrs', 'background', 'tenure']],
      ['skills', ['expertise', 'abilities', 'competencies', 'proficiency', 'knowledge']],
      ['communication', ['communicate', 'speaking', 'presentation', 'interpersonal', 'verbal']],
      ['leadership', ['lead', 'manage', 'supervise', 'mentor', 'guide', 'direct']],
      ['team', ['group', 'collaboration', 'teamwork', 'colleagues']],
      ['project', ['initiative', 'program', 'task', 'assignment', 'engagement']],
      ['analysis', ['analyze', 'analytical', 'analytics', 'insights', 'reporting']],
      ['problem', ['issue', 'challenge', 'obstacle', 'difficulty', 'roadblock']]
    ]);
  }

  private static getWeightedKeywords(): Map<string, number> {
    return new Map([
      // High priority skills (3x weight)
      ['sap', 3.0], ['aws', 3.0], ['react', 3.0], ['python', 3.0], ['java', 3.0],
      ['senior', 3.0], ['lead', 3.0], ['principal', 3.0], ['architect', 3.0],
      
      // Medium priority skills (2x weight)
      ['node.js', 2.0], ['angular', 2.0], ['docker', 2.0], ['kubernetes', 2.0],
      ['communication', 2.0], ['leadership', 2.0], ['management', 2.0],
      ['agile', 2.0], ['scrum', 2.0],
      
      // Standard skills (1x weight)
      ['software', 1.0], ['engineer', 1.0], ['developer', 1.0], ['experience', 1.0],
      ['skills', 1.0], ['team', 1.0], ['project', 1.0]
    ]);
  }

  private static getCriticalKeywords(): Set<string> {
    return new Set([
      'sap', 'aws', 'react', 'python', 'java', 'senior', 'lead', 'principal',
      'architect', 'node.js', 'angular', 'docker', 'kubernetes'
    ]);
  }

  private static normalizeTokens(text: string): string[] {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2) // Filter out very short tokens
      .filter(token => !this.isStopWord(token));
  }

  private static isStopWord(token: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'shall', 'a', 'an', 'this', 'that', 'these', 'those'
    ]);
    return stopWords.has(token);
  }

  private static countExactMatches(tokensA: string[], tokensB: string[]): number {
    const setB = new Set(tokensB);
    return tokensA.filter(token => setB.has(token)).length;
  }

  private static countStemMatches(tokensA: string[], tokensB: string[]): number {
    const stemsB = new Set(tokensB.map(token => this.stem(token)));
    return tokensA.filter(token => stemsB.has(this.stem(token))).length;
  }

  private static countSynonymMatches(tokensA: string[], tokensB: string[]): number {
    const synonymMap = this.getSynonymMap();
    const setB = new Set(tokensB);
    
    let matches = 0;
    for (const token of tokensA) {
      const synonyms = synonymMap.get(token) || [];
      if (synonyms.some(syn => setB.has(syn))) {
        matches++;
      }
    }
    return matches;
  }

  private static stem(token: string): string {
    // Simple stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment', 'able', 'ible'];
    for (const suffix of suffixes) {
      if (token.length > suffix.length + 2 && token.endsWith(suffix)) {
        return token.slice(0, -suffix.length);
      }
    }
    return token;
  }

  private static getSynonymMap(): Map<string, string[]> {
    // Common synonyms in job descriptions
    return new Map([
      ['manager', ['lead', 'head', 'director', 'supervisor']],
      ['developer', ['programmer', 'engineer', 'coder', 'software']],
      ['experience', ['exp', 'years', 'yrs', 'background']],
      ['skills', ['expertise', 'abilities', 'competencies', 'proficiency']],
      ['communication', ['communicate', 'speaking', 'presentation', 'interpersonal']],
      ['leadership', ['lead', 'manage', 'supervise', 'mentor']],
      ['team', ['group', 'collaboration', 'teamwork']],
      ['project', ['initiative', 'program', 'task', 'assignment']],
      ['analysis', ['analyze', 'analytical', 'analytics', 'insights']],
      ['problem', ['issue', 'challenge', 'obstacle', 'difficulty']],
    ]);
  }
}