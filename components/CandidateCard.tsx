import React from 'react'
import { ExternalLink, Save, MapPin } from 'lucide-react'

type Props = {
  name: string
  snippet: string
  url: string
  location?: string | null
  similarity?: number
  onSave?: () => void
  rank?: number
}

export default function CandidateCard({ name, snippet, url, location, onSave, rank }: Props) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group">
      {/* Rank Badge */}
      {rank && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xs font-bold">
              {rank}
            </div>
            <span className="text-purple-300 text-xs font-medium">Candidate</span>
          </div>
        </div>
      )}

      {/* Candidate Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
            {name}
          </h3>
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