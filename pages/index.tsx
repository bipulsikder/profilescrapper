import { useState } from 'react'
import CandidateCard from '../components/CandidateCard'
import { Toaster, toast } from 'sonner'
import { exportToCSV } from '../utils/csv'
import { Search, FileText, Download, Sparkles, Users, TrendingUp } from 'lucide-react'

type Result = {
  name: string
  snippet: string
  url: string
  location?: string | null
  similarity?: number
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [inputType, setInputType] = useState<'requirement' | 'jd'>('requirement')
  const [xrayQuery, setXrayQuery] = useState<string>('')
  const [visibleCount, setVisibleCount] = useState<number>(24)
  const [maxNum, setMaxNum] = useState<number>(200)

  const doSearch = async (opts?: { mode?: 'default' | 'broad' | 'enhanced', num?: number }) => {
    if (!query.trim()) {
      toast.error('Please enter a hiring requirement')
      return
    }
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const resp = await fetch(`${apiUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, inputType, mode: opts?.mode || 'default', num: opts?.num ?? maxNum })
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      setResults(data.results || [])
      setXrayQuery(data.xrayQuery || '')
      setVisibleCount(Math.min(24, (data.results || []).length))
      toast.success(`Found ${data.results?.length || 0} matching candidates`)
    } catch (e: any) {
      toast.error(e.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const saveCandidate = async (c: Result) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const resp = await fetch(`${apiUrl}/api/candidates/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: c.name, snippet: c.snippet, url: c.url, location: c.location })
      })
      if (!resp.ok) throw new Error(await resp.text())
      toast.success('Candidate saved successfully')
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* <Sparkles className="w-8 h-8 text-purple-400" /> */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Truckinzy
            </h1>
          </div>
          {/* <p className="text-slate-300 text-lg">
            AI-Powered Candidate Discovery with Advanced X-Ray Search
          </p> */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Smart Search</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Similarity Scoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>LinkedIn Integration</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* Search Interface */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          {/* Input Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800/50 rounded-lg p-1 flex">
              <button
                onClick={() => setInputType('requirement')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  inputType === 'requirement'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                Requirement
              </button>
              <button
                onClick={() => setInputType('jd')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  inputType === 'jd'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Job Description
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder={
                  inputType === 'jd'
                    ? 'Paste your complete job description here...\nExample: "We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and cloud technologies..."'
                    : 'Describe your ideal candidate...\nExample: "Need a fleet manager in Delhi with min 5 years experience, good communication skills, SAP knowledge, and team management experience"'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={inputType === 'jd' ? 6 : 3}
                disabled={loading}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
        </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => doSearch()}
                disabled={loading || !query.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Find Candidates
                  </>
                )}
              </button>
              <button
                onClick={() => doSearch({ mode: 'default', num: maxNum })}
                disabled={loading || !query.trim()}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
              >
                Regenerate X-Ray
              </button>
              <button
                onClick={() => doSearch({ mode: 'broad', num: Math.max(100, maxNum) })}
                disabled={loading || !query.trim()}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
              >
                Find More
              </button>
              
              <button
                onClick={() => results.length && exportToCSV('peoplegpt-candidates.csv', results)}
                disabled={loading || results.length === 0}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
          </div>
          </div>

          {/* X-Ray Query Display */}
          {xrayQuery && (
            <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <p className="text-purple-300 text-sm font-medium mb-1">Generated X-Ray Search Query:</p>
              <p className="text-purple-100 text-xs font-mono bg-purple-950/50 p-2 rounded break-all">
                {xrayQuery}
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center gap-3 text-slate-300 text-sm">
            <label className="flex items-center gap-2">
              Max Candidates
              <select
                value={maxNum}
                onChange={(e) => setMaxNum(Number(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
              </select>
            </label>
            <span>Showing {Math.min(visibleCount, results.length)} of {results.length}</span>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
              <h2 className="text-xl font-semibold text-white">Searching for candidates...</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded mb-3"></div>
                  <div className="h-3 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Top Candidates ({results.length})
              </h2>
              <div className="flex items-center gap-3">
                <div className="text-slate-300 text-sm">
                  Sorted by relevance score
                </div>
                <button
                  onClick={() => doSearch({ mode: 'enhanced', num: Math.max(100, maxNum) })}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get Better Candidates
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.slice(0, visibleCount).map((candidate, index) => (
                <CandidateCard
                  key={`${candidate.url}-${index}`}
                  name={candidate.name}
                  snippet={candidate.snippet}
                  url={candidate.url}
                  location={candidate.location}
                  similarity={candidate.similarity}
                  onSave={() => saveCandidate(candidate)}
                  rank={index + 1}
                />
              ))}
            </div>
            {results.length > visibleCount && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => setVisibleCount(Math.min(visibleCount + 24, results.length))}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Show More (24)
                </button>
                <button
                  onClick={() => setVisibleCount(results.length)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Show All ({results.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No candidates found</h3>
            <p className="text-slate-400">
              Try adjusting your search criteria or using different keywords.
            </p>
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to find your perfect candidate?</h3>
            <p className="text-slate-300 max-w-md mx-auto">
              Enter your hiring requirements or paste a job description, and our AI will find the most relevant LinkedIn profiles for you.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center text-slate-400 py-8">
        <p>© {new Date().getFullYear()} PeopleGPT. Powered by Gemini AI & Google Search.</p>
      </footer>
    </div>
  )
}