import React from 'react'
import { ExternalLink, Save, MapPin, Award } from 'lucide-react'

type Props = {
  name: string
  snippet: string
  url: string
  location?: string | null
  similarity?: number
  onSave?: () => void
  rank?: number
}

export default function CandidateCard({ name, snippet, url, location, similarity, onSave, rank }: Props) {
  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    if (score >= 40) return 'from-orange-500 to-red-600'
    return 'from-red-500 to-red-700'
  }

  const getSimilarityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Basic Match'
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group">
      {/* Rank Badge */}
      {rank && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
              {rank}
            </div>
            <span className="text-purple-300 text-xs font-medium">Top Match</span>
          </div>
          
          {/* Similarity Score */}
          {typeof similarity === 'number' && (
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getSimilarityColor(similarity)} text-white`}>
                {Math.round(similarity)}%
              </div>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
          )}
        </div>
      )}

      {/* Candidate Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
            {name}
          </h3>
          {typeof similarity === 'number' && (
            <p className="text-sm text-purple-300 font-medium">
              {getSimilarityLabel(similarity)}
            </p>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}

        <p className="text-slate-200 text-sm leading-relaxed line-clamp-4">
          {snippet}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Profile
        </a>
        {onSave && (
          <button
            onClick={onSave}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        )}
      </div>
    </div>
  )
}