import axios from 'axios';
import { config } from '../config';
import { Candidate } from '../types';

export class GoogleSearchService {
  private static readonly SEARCH_URL = config.GOOGLE_SEARCH_URL;
  private static readonly API_KEY = config.GOOGLE_API_KEY;
  private static readonly CX_ID = config.GOOGLE_CX_ID;

  static async searchLinkedInProfiles(query: string, num: number = 30): Promise<Candidate[]> {
    try {
      // Get multiple pages to reach 30+ results
      const resultsPerPage = 10; // Google API max per request
      const totalPages = Math.ceil(num / resultsPerPage);
      const allItems: any[] = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const startIndex = (page - 1) * resultsPerPage + 1;
        
        const response = await axios.get(this.SEARCH_URL, {
          params: {
            key: this.API_KEY,
            cx: this.CX_ID,
            q: query,
            num: resultsPerPage,
            start: startIndex,
            lr: 'lang_en', // English language results
            cr: 'countryIN', // Country restriction to India
            gl: 'in', // Geographic location India
          },
          timeout: 30000,
          headers: { 'Accept': 'application/json' }
        });

        const data = response.data;
        if (data.items && data.items.length > 0) {
          allItems.push(...data.items);
        } else {
          break; // No more results
        }
      }

      // Filter and process candidates focusing on Indian profiles
      const processedCandidates = allItems.map((item: any) => {
        const title = item.title || '';
        const snippet = item.snippet || '';
        const link = item.link;
        
        // Advanced name extraction with multiple parsing strategies
        const name = this.extractNameFromTitle(title);
        
        // Comprehensive candidate information extraction
        const extractedInfo = this.extractComprehensiveCandidateInfo(snippet, title);
        
        // Filter for Indian candidates only
        if (!this.isIndianCandidate(snippet, title, link)) {
          return null;
        }
        
        return {
          name,
          snippet,
          url: link,
          location: extractedInfo.location,
          experience: extractedInfo.experience,
          currentRole: extractedInfo.currentRole,
          company: extractedInfo.company,
          skills: extractedInfo.skills,
          education: extractedInfo.education,
          industry: extractedInfo.industry,
          yearsOfExperience: extractedInfo.yearsOfExperience,
        } as Candidate;
      }).filter((candidate): candidate is Candidate => !!candidate && !!candidate.url);
      
      return processedCandidates;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Google Search failed: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  private static isIndianCandidate(snippet: string, title: string, link: string): boolean {
    // Comprehensive Indian candidate detection
    const indianIndicators = [
      // Indian cities and states
      /\b(Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata|Ahmedabad|Surat|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Thane|Bhopal|Visakhapatnam|Pimpri|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Kalyan|Vasai|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Navi Mumbai|Allahabad|Ranchi|Howrah|Coimbatore|Jabalpur|Gwalior|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Guwahati|Chandigarh|Solapur|Hubballi|Tiruchirappalli|Bareilly|Moradabad|Mysore|Tiruppur|Gurgaon|Aligarh|Jalandhar|Bhubaneswar|Salem|Warangal|Guntur|Bhiwandi|Saharanpur|Gorakhpur|Bikaner|Amravati|Noida|Firozabad|Kochi|Dehradun|Jammu|Ujjain|Davanagere|Jhansi|Mangalore|Kollam|Nellore|Kadapa|Kurnool|Tirupati|Anantapur|Vizianagaram|Eluru|Ongole|Machilipatnam|Nandyal|Srikakulam|Adoni|Madanapalle|Chittoor|Hindupur|Proddatur|Bhainsa|Khammam|Mancherial|Jagtial|Karimnagar|Ramagundam|Suryapet|Wanaparthy|Miryalaguda|Peddapalli|Kothagudem|Nizamabad|Siddipet|Mahbubnagar|Armoor|Nirmal|Kamareddy|Bodhan|Asifabad|Bellampalli|Bhadrachalam|Manuguru|Yellandu|Palwancha|Jangaon|Sircilla|Medak|Narayanpet)\b/gi,
      
      // Indian states and union territories
      /\b(Andhra Pradesh|Telangana|Tamil Nadu|Karnataka|Kerala|Maharashtra|Gujarat|Rajasthan|Punjab|Haryana|Uttar Pradesh|Bihar|West Bengal|Odisha|Jharkhand|Chhattisgarh|Madhya Pradesh|Himachal Pradesh|Uttarakhand|Jammu and Kashmir|Goa|Assam|Manipur|Meghalaya|Mizoram|Nagaland|Tripura|Arunachal Pradesh|Sikkim|Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata)\b/gi,
      
      // Indian companies and organizations
      /\b(TCS|Infosys|Wipro|HCL|Tech Mahindra|Cognizant|Accenture|Capgemini|IBM India|Google India|Amazon India|Microsoft India|Flipkart|Swiggy|Zomato|Ola|Uber India|Paytm|PhonePe|BYJU'S|Unacademy|Reliance|Tata|Birla|Mahindra|Bajaj|Hero|Maruti|Suzuki|Hyundai India|Toyota India|Ford India|Volkswagen India|Mercedes India|BMW India|Audi India|Jio|Airtel|Vodafone|Idea|BSNL|State Bank of India|HDFC|ICICI|Axis Bank|Punjab National Bank|Bank of Baroda|Canara Bank|Union Bank|Indian Bank|Central Bank of India|Bank of India|UCO Bank|Syndicate Bank|Corporation Bank|Allahabad Bank|United Bank of India|Dena Bank|Vijaya Bank|Andhra Bank|Corporation Bank|Indian Overseas Bank|Bank of Maharashtra|Syndicate Bank|United Commercial Bank|Central Bank of India|Union Bank of India|Bank of India|Canara Bank|Syndicate Bank|Corporation Bank|Indian Bank|Allahabad Bank|United Bank of India|Dena Bank|Vijaya Bank|Andhra Bank|Corporation Bank|Indian Overseas Bank|Bank of Maharashtra)\b/gi,
      
      // Indian educational institutions
      /\b(IIT|IIM|NIT|AIIMS|IISc|BITS|VIT|Manipal|Symbiosis|Amity|Lovely Professional|Chandigarh University|Banaras Hindu University|Delhi University|Mumbai University|Calcutta University|Madras University|Pune University|Bangalore University|Hyderabad University|Jawaharlal Nehru University|Aligarh Muslim University|Jamia Millia Islamia|University of Delhi|University of Mumbai|University of Calcutta|University of Madras|University of Pune|University of Bangalore|University of Hyderabad|Anna University|Jadavpur University|Birla Institute|Indian Institute)\b/gi,
      
      // Indian currency and terms
      /\b(Rupee|Rupees|Lakh|Crore|Crores|INR|₹|paise)\b/gi,
      
      // Indian domains and emails
      /\b\.in\b/gi,
      
      // Common Indian names and terms
      /\b(Kumar|Singh|Sharma|Verma|Gupta|Agarwal|Jain|Patel|Shah|Mehta|Desai|Iyer|Nair|Menon|Reddy|Rao|Naidu|Chowdhury|Banerjee|Mukherjee|Chatterjee|Das|Bose|Ghosh|Sen|Bhat|Bhatia|Khanna|Malhotra|Kapoor|Chopra|Johar|Khan|Sheikh|Ali|Hussain|Ahmed|Malik|Qureshi|Ansari|Siddiqui)\b/gi
    ];
    
    // Check for Indian indicators in snippet
    const hasIndianIndicator = indianIndicators.some(pattern => pattern.test(snippet));
    if (hasIndianIndicator) {
      return true;
    }
    
    // Check for Indian indicators in title
    const hasIndianTitle = indianIndicators.some(pattern => pattern.test(title));
    if (hasIndianTitle) {
      return true;
    }
    
    // Check for Indian domain in link
    if (link.includes('.in') || link.includes('in.linkedin.com')) {
      return true;
    }
    
    // If no clear indicators, check for absence of foreign indicators
    const foreignIndicators = [
      /\b(USA|United States|America|Canada|UK|United Kingdom|England|Australia|Germany|France|Japan|China|Singapore|Dubai|UAE|Saudi Arabia|Qatar|Kuwait|Bahrain|Oman|South Africa|Brazil|Argentina|Mexico|Spain|Italy|Netherlands|Belgium|Switzerland|Austria|Sweden|Norway|Denmark|Finland|Poland|Czech|Hungary|Romania|Bulgaria|Croatia|Slovenia|Slovakia|Lithuania|Latvia|Estonia|Ukraine|Russia|Belarus|Moldova|Serbia|Bosnia|Montenegro|Macedonia|Albania|Kosovo)\b/gi,
      /\b(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Washington|Boston|El Paso|Nashville|Detroit|Oklahoma City|Portland|Las Vegas|Memphis|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Mesa|Sacramento|Atlanta|Kansas City|Colorado Springs|Miami|Raleigh|Omaha|Long Beach|Virginia Beach|Oakland|Minneapolis|Tulsa|Tampa|Arlington|New Orleans|Wichita|Cleveland|Tampa|Bakersfield|Aurora|Anaheim|Honolulu|Santa Ana|Riverside|Corpus Christi|Lexington|Henderson|Stockton|Saint Paul|Cincinnati|St. Louis|Pittsburgh|Greensboro|Lincoln|Anchorage|Plano|Orlando|Irvine|Newark|Durham|Chula Vista|Toledo|Fort Wayne|St. Petersburg|Laredo|Jersey City|Chandler|Madison|Lubbock|Scottsdale|Reno|Buffalo|Gilbert|Glendale|North Las Vegas|Winston-Salem|Chesapeake|Norfolk|Fremont|Garland|Paradise|Richmond|Hialeah|Baton Rouge|Spokane|Des Moines|Tacoma|San Bernardino|Modesto|Fontana|Santa Clarita|Birmingham|Oxnard|Fayetteville|Moreno Valley|Rochester|Glendale|Huntington Beach|Salt Lake City|Grand Rapids|Amarillo|Yonkers|Aurora|Montgomery|Tallahassee|Akron|Little Rock|Grand Prairie|Overland Park|Tempe|Cape Coral|Mobile|Shreveport|Frisco|Knoxville|Port St. Lucie|Worcester|Sioux Falls|Ontario|Vancouver|Chattanooga|Fort Lauderdale|Providence|Newport News|Rancho Cucamonga|Santa Rosa|Oceanside|Salem|Garden Grove|Springfield|Santa Rosa|Clarksville|Lakewood|Ontario|Lancaster|Eugene|Pembroke Pines|Peoria|McKinney|Rockford|Joliet|Paterson|Bridgeport|Miramar|Mesquite|Syracuse|McAllen|Pasadena|Bellevue|Fullerton|Orange|Dayton|Killeen|Thornton|Gainesville|Waco|West Valley City|Carrollton|Charleston|Warren|Hampton|Columbia|Denton|Cedar Rapids|Sterling Heights|New Haven|Roseville|Concord|Thousand Oaks|Simi Valley|Lafayette|Topeka|Elizabeth|Athens|Norman|Hartford|Fargo|Abilene|Norman|Vallejo|Berkeley|Richardson|Round Rock|Ann Arbor|Cambridge|Sugar Land|Lansing|Evansville|Independence|Beaumont|Fairfield|Clearwater|Carlsbad|Westminster|West Jordan|Pearland|Provo|Lakeland|Elgin|Athens|Murrieta|Temecula|Clovis|Columbia|Costa Mesa|Downey|Peoria|Manchester|Waterbury|Gresham|Carlsbad|West Covina|League City|Norwalk|San Buenaventura|Fairfield|Richmond|Murrieta|Burbank|Santa Maria|El Cajon|Rio Rancho|Rialto|Daly City|Westminster|Davenport|Santa Fe|Lakewood|Las Cruces|San Mateo|Sparks|Tyler|Green Bay|Wichita Falls|Lansing|El Monte|Brockton|Duluth|Citrus Heights|Woodbridge|Plantation|Lawrence|Canton|Southfield|Palmdale|Pomona|Edison|Hillsboro|Woodbridge|Hemet|Redwood City|Bellingham|Yuma|Bloomington|Edinburg|Clifton|Fishers|Albany|Bryan|New Braunfels|Georgetown|Vacaville|Roswell|Sunrise|Lakewood|Alameda|Bowling Green|Orem|San Marcos|Reading|Lynn|Spokane Valley|Boca Raton|Des Plaines|Huntington Park|Trenton|Napa|Wilmington|Livermore|Bellflower|Duluth|Victorville|Kirkland|Johns Creek|Medford|Laguna Niguel|Chino|Champaign|Davis|Bismarck|Dublin|Hoover|Sioux City|Bloomington|Ogden|Meridian|O\'Fallon|Frederick|Merced|Chico|Kennewick|Walnut Creek|Lakewood|Fort Myers|Nashua|Dearborn|Mount Vernon|Joplin|Encinitas|Bend|Westland|Indio|Palm Coast|St. Charles|Gary|Layton|Largo|Camden|Mission Viejo|Tuscaloosa|South Gate|Rapid City|Santa Cruz|Muncie|Rosenberg|Waukegan|South Jordan|Gastonia|Lake Forest|Flagstaff|Perris|Decatur|Appleton|Milford|Fayetteville|Kenner|Rock Hill|Hawthorne|Redlands|Doral|Lynchburg|Sunrise|Johns Creek|San Ramon|Pleasanton|Union City|Baldwin Park|Warner Robins|Novi|West Hartford|Newton|Great Falls|Rogers|Farmington Hills|Passaic|North Miami|Shawnee|Kalamazoo|Mount Pleasant|Rancho Cordova|Schenectady|Arlington Heights|Utica|Bloomington|Danbury|Bellingham|Evanston|Meriden|Bristol|Lehi|Springfield|Lake Charles|San Luis Obispo|Medford|Novi|Westland|Barnstable Town|Cheyenne|Oakland Park|Biloxi|Wheaton|Montebello|Hesperia|Rogers|Blue Springs|Hanford|Lodi|Hoffman Estates|Harrisburg|Huntington|Apple Valley|North Little Rock|Glenview|Cleveland Heights|Tigard|Cutler Bay|Oak Park|West Des Moines|Orland Park|Huntersville|Grapevine|Blacksburg|Castle Rock|West New York|East Orange|Sherman|North Port|Great Falls|Altamonte Springs|Cedar Park|Coral Gables|St. Cloud|Cerritos|South San Francisco|Cheektowaga|Watsonville|Anderson|Romeoville|Plainfield|Buffalo Grove|Dublin|Haltom City|Hoffman Estates|Lombard|Streamwood|Buffalo Grove|Cleveland|Dublin|Haltom City|Hoffman Estates|Lombard|Streamwood|Buffalo Grove)\b/gi
    ];
    
    // Check for foreign indicators
    const hasForeignIndicator = foreignIndicators.some(pattern => pattern.test(snippet) || pattern.test(title));
    if (hasForeignIndicator) {
      return false;
    }
    
    // Default to true if no clear indicators found (better to include than exclude)
    return true;
  }

  private static extractNameFromTitle(title: string): string {
    // Multiple parsing strategies for LinkedIn titles
    const strategies = [
      // Strategy 1: Split by pipe (most common)
      () => title.split('|')[0].trim(),
      // Strategy 2: Split by dash
      () => title.split('-')[0].trim(),
      // Strategy 3: Remove LinkedIn suffixes
      () => title.replace(/\s*-\s*LinkedIn\s*$/, '').trim(),
      // Strategy 4: Extract before company indicators
      () => title.split(/\s*(?:at|@|working at)\s*/i)[0].trim(),
      // Strategy 5: Default fallback
      () => 'Unknown'
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result && result.length > 1 && result.length < 50 && !result.toLowerCase().includes('linkedin')) {
        return result;
      }
    }
    
    return 'Unknown';
  }

  private static extractComprehensiveCandidateInfo(snippet: string, title: string): {
    location: string | null;
    experience: string | null;
    currentRole: string | null;
    company: string | null;
    skills: string[];
    education: string | null;
    industry: string | null;
    yearsOfExperience: number | null;
  } {
    const text = `${title} ${snippet}`.toLowerCase();
    
    return {
      location: this.extractLocationFromSnippet(snippet),
      experience: this.extractExperienceFromText(text),
      currentRole: this.extractCurrentRoleFromText(text),
      company: this.extractCompanyFromText(text),
      skills: this.extractSkillsFromText(text),
      education: this.extractEducationFromText(text),
      industry: this.extractIndustryFromText(text),
      yearsOfExperience: this.extractYearsOfExperience(text),
    };
  }

  private static extractExperienceFromText(text: string): string | null {
    const experiencePatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp|work|professional)/i,
      /(?:experience|exp):?\s*(\d+)\+?\s*years?/i,
      /worked\s*for\s*(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*years?\s*in\s*(?:the\s*)?(?:industry|field|domain)/i,
    ];

    for (const pattern of experiencePatterns) {
      const match = text.match(pattern);
      if (match) {
        return `${match[1]} years`;
      }
    }
    return null;
  }

  private static extractCurrentRoleFromText(text: string): string | null {
    const rolePatterns = [
      /(?:currently|presently|now)\s*(?:working\s*as|as)\s*([^.]+?)(?:\s*at|\s*@|\s*for|\s*in\s*the|\.|$)/i,
      /(?:position|role|title):?\s*([^.]+?)(?:\s*at|\s*@|\s*for|\s*in\s*the|\.|$)/i,
      /(?:is\s*a?|as\s*a?)\s*([^.]+?)(?:\s*with|\s*at|\s*@|\s*for|\s*in\s*the|\.|$)/i,
    ];

    for (const pattern of rolePatterns) {
      const match = text.match(pattern);
      if (match) {
        const role = match[1].trim();
        if (role.length > 3 && role.length < 50) {
          return role.charAt(0).toUpperCase() + role.slice(1);
        }
      }
    }
    return null;
  }

  private static extractCompanyFromText(text: string): string | null {
    const companyPatterns = [
      /(?:working\s*at|worked\s*at|currently\s*at|@)\s*([A-Z][^.]+?)(?:\s*as|\s*for|\s*in\s*the|\.|$)/i,
      /(?:company|organization|firm):?\s*([A-Z][^.]+?)(?:\s*as|\s*for|\s*in\s*the|\.|$)/i,
      /(?:with)\s*([A-Z][^.]+?)(?:\s*as|\s*for|\s*in\s*the|\.|$)/i,
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        const company = match[1].trim();
        if (company.length > 2 && company.length < 40 && !company.toLowerCase().includes('linkedin')) {
          return company;
        }
      }
    }
    return null;
  }

  private static extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'sap', 'oracle', 'salesforce', 'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node',
      'typescript', 'mongodb', 'sql', 'mysql', 'postgresql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
      'git', 'jenkins', 'ci/cd', 'agile', 'scrum', 'project management', 'team leadership', 'communication',
      'negotiation', 'analytical', 'problem solving', 'strategic planning', 'budget management', 'operations',
      'supply chain', 'logistics', 'fleet management', 'transportation', 'warehouse', 'inventory', 'procurement',
      'vendor management', 'customer service', 'relationship management', 'business development', 'sales',
      'marketing', 'finance', 'accounting', 'hr', 'recruitment', 'training', 'development', 'quality assurance',
      'testing', 'automation', 'machine learning', 'ai', 'data analysis', 'excel', 'powerpoint', 'word',
      'outlook', 'teams', 'zoom', 'slack', 'trello', 'asana', 'jira', 'confluence', 'sharepoint'
    ];

    const foundSkills: string[] = [];
    const words = text.split(/\s+|,|;|\.|\//);
    
    for (const skill of commonSkills) {
      if (text.includes(skill)) {
        foundSkills.push(skill.toUpperCase());
      }
    }

    // Extract from skill lists
    const skillListPatterns = [
      /(?:skills?|expertise|proficient\s*in|experience\s*with):?\s*([^.]+?)(?:\s*and\s*more|\s*etc|\.|$)/i,
      /(?:including|such\s*as)\s*([^.]+?)(?:\s*and\s*more|\s*etc|\.|$)/i,
    ];

    for (const pattern of skillListPatterns) {
      const match = text.match(pattern);
      if (match) {
        const skillsText = match[1];
        const individualSkills = skillsText.split(/[,;\s]+/);
        for (const skill of individualSkills) {
          const cleanSkill = skill.trim().replace(/[^a-zA-Z0-9]/g, '');
          if (cleanSkill.length > 2 && cleanSkill.length < 20) {
            foundSkills.push(cleanSkill.toUpperCase());
          }
        }
      }
    }

    return [...new Set(foundSkills)].slice(0, 10); // Remove duplicates and limit to 10
  }

  private static extractEducationFromText(text: string): string | null {
    const educationPatterns = [
      /(?:education|degree|qualification):?\s*([^.]+?)(?:\s*from|\s*@|\s*in\s*the|\.|$)/i,
      /(?:graduated|completed|earned)\s*(?:with)?\s*([^.]+?)(?:\s*from|\s*@|\s*in\s*the|\.|$)/i,
      /(?:bachelor|master|phd|mba|b\.tech|m\.tech|b\.e|m\.e|b\.sc|m\.sc)\s*([^.]+?)(?:\s*from|\s*@|\s*in\s*the|\.|$)/i,
    ];

    for (const pattern of educationPatterns) {
      const match = text.match(pattern);
      if (match) {
        const education = match[1].trim();
        if (education.length > 3 && education.length < 50) {
          return education.charAt(0).toUpperCase() + education.slice(1);
        }
      }
    }
    return null;
  }

  private static extractIndustryFromText(text: string): string | null {
    const industries = [
      'information technology', 'software', 'technology', 'consulting', 'finance', 'banking',
      'insurance', 'healthcare', 'pharmaceutical', 'manufacturing', 'automotive', 'retail',
      'e-commerce', 'logistics', 'transportation', 'supply chain', 'telecommunications',
      'media', 'entertainment', 'education', 'real estate', 'construction', 'energy',
      'oil & gas', 'mining', 'agriculture', 'hospitality', 'tourism', 'food & beverage',
      'textile', 'apparel', 'consumer goods', 'electronics', 'aerospace', 'defense',
      'government', 'non-profit', 'startup', 'sme', 'mnc'
    ];

    for (const industry of industries) {
      if (text.includes(industry)) {
        return industry.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }
    return null;
  }

  private static extractYearsOfExperience(text: string): number | null {
    const yearPatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp|work|professional)/i,
      /(?:experience|exp):?\s*(\d+)\+?\s*years?/i,
      /worked\s*for\s*(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*years?\s*in\s*(?:the\s*)?(?:industry|field|domain)/i,
    ];

    for (const pattern of yearPatterns) {
      const match = text.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (years > 0 && years < 50) {
          return years;
        }
      }
    }
    return null;
  }

  private static extractLocationFromSnippet(snippet: string): string | null {
    // Common location indicators in LinkedIn snippets
    const locationPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2,3}\b/, // City, State
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z][a-z]+\b/, // City, Country
      /\b(Delhi|Mumbai|Bangalore|Chennai|Hyderabad|Pune|Kolkata|Ahmedabad|Surat|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Thane|Bhopal|Visakhapatnam|Pimpri|Pimpri-Chinchwad|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Kalyan|Vasai|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Navi Mumbai|Allahabad|Ranchi|Howrah|Coimbatore|Jabalpur|Gwalior|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Guwahati|Chandigarh|Solapur|Hubballi|Tiruchirappalli|Bareilly|Moradabad|Mysore|Tiruppur|Gurgaon|Aligarh|Jalandhar|Bhubaneswar|Salem|Warangal|Guntur|Bhiwandi|Saharanpur|Gorakhpur|Bikaner|Amravati|Noida|Firozabad|Kochi|Dehradun|Jammu|Ujjain|Davanagere|Jhansi|Mangalore|Kollam|Nellore|Tiruchirappalli|Kadapa|Kurnool|Tirupati|Anantapur|Vizianagaram|Eluru|Ongole|Machilipatnam|Nandyal|Srikakulam|Adoni|Madanapalle|Chittoor|Hindupur|Proddatur|Bhainsa|Khammam|Mancherial|Jagtial|Karimnagar|Ramagundam|Suryapet|Wanaparthy|Miryalaguda|Peddapalli|Kothagudem|Nizamabad|Siddipet|Mahbubnagar|Armoor|Nirmal|Kamareddy|Bodhan|Asifabad|Bellampalli|Bhadrachalam|Manuguru|Yellandu|Palwancha|Jangaon|Sircilla|Medak|Narayanpet|Andhra Pradesh|Telangana|Tamil Nadu|Karnataka|Kerala|Maharashtra|Gujarat|Rajasthan|Punjab|Haryana|Uttar Pradesh|Bihar|West Bengal|Odisha|Jharkhand|Chhattisgarh|Madhya Pradesh|Himachal Pradesh|Uttarakhand|Jammu and Kashmir|Goa|Assam|Manipur|Meghalaya|Mizoram|Nagaland|Tripura|Arunachal Pradesh|Sikkim)\b/,
    ];

    for (const pattern of locationPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    return null;
  }
}