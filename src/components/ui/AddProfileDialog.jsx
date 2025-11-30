import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function AddProfileDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}) {
  const { colors } = useTheme()
  const [url, setUrl] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setUrl('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-xl max-w-md w-full mx-4 p-6`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 ${colors.textMuted} hover:${colors.text} transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-lg font-semibold ${colors.text} mb-2`}>
          Add Profile
        </h2>

        <p className={`${colors.textSecondary} text-sm mb-4`}>
          Enter a profile URL from Instagram, TikTok, or YouTube.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/username"
            className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-lg text-sm ${colors.text} placeholder:${colors.textMuted} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 mb-3`}
            disabled={isLoading}
          />

          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 ${colors.bgTertiary} ${colors.text} rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Add Profile
            </button>
          </div>
        </form>

        <div className={`mt-4 pt-4 border-t ${colors.border}`}>
          <p className={`text-xs ${colors.textMuted}`}>
            Supported formats:
          </p>
          <ul className={`text-xs ${colors.textMuted} mt-1 space-y-0.5`}>
            <li>instagram.com/username</li>
            <li>tiktok.com/@username</li>
            <li>youtube.com/@channel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
