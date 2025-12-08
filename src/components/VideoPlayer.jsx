import { useState, useEffect } from 'react'
import { Download, AlertCircle } from 'lucide-react'
import { InstagramEmbed } from './InstagramEmbed'
import { useTheme } from '../context/ThemeContext'

/**
 * VideoPlayer component that displays downloaded videos or falls back to Instagram embed
 *
 * @param {Object} props
 * @param {Object} props.post - Post object with video_url, local_video_path, download_status, post_url
 * @param {boolean} props.darkMode - Dark mode setting
 */
export function VideoPlayer({ post, darkMode }) {
  const { colors } = useTheme()
  const [useEmbed, setUseEmbed] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const hasLocalVideo = post?.local_video_path && post?.download_status === 'completed'
  const isDownloading = post?.download_status === 'downloading' || post?.download_status === 'processing'
  const downloadFailed = post?.download_status === 'failed'

  // Reset error state when post changes
  useEffect(() => {
    setVideoError(false)
    setUseEmbed(false)
  }, [post?.id])

  // If video failed to load or download failed, use Instagram embed
  const shouldUseEmbed = useEmbed || videoError || (!hasLocalVideo && !isDownloading && post?.post_url)

  const videoUrl = hasLocalVideo ? `https://media.nahuelviera.dev/${post.local_video_path}` : null

  if (shouldUseEmbed && post?.post_url) {
    return <InstagramEmbed postUrl={post.post_url} darkMode={darkMode} />
  }

  if (isDownloading) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${colors.bgSecondary} rounded-lg border ${colors.border} p-8`}
        style={{ minHeight: '540px', maxWidth: '400px' }}
      >
        <div className={`w-12 h-12 border-4 ${colors.border} border-t-blue-500 rounded-full animate-spin mb-4`} />
        <Download className={`w-8 h-8 ${colors.textSecondary} mb-2`} />
        <p className={`text-sm ${colors.text} mb-1`}>Downloading video...</p>
        <p className={`text-xs ${colors.textSecondary}`}>This may take a moment</p>
      </div>
    )
  }

  if (downloadFailed) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${colors.bgSecondary} rounded-lg border border-red-500/30 p-8`}
        style={{ minHeight: '540px', maxWidth: '400px' }}
      >
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className={`text-sm ${colors.text} mb-2`}>Download failed</p>
        <button
          onClick={() => setUseEmbed(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          View on Instagram
        </button>
      </div>
    )
  }

  if (!videoUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${colors.bgSecondary} rounded-lg border ${colors.border} p-8`}
        style={{ minHeight: '540px', maxWidth: '400px' }}
      >
        <AlertCircle className={`w-12 h-12 ${colors.textSecondary} mb-4`} />
        <p className={`text-sm ${colors.text} mb-2`}>Video not available</p>
        {post?.post_url && (
          <button
            onClick={() => setUseEmbed(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View on Instagram
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center" style={{ maxWidth: '400px' }}>
      <video
        key={videoUrl}
        controls
        loop
        playsInline
        className="w-full rounded-lg border shadow-lg"
        style={{ maxHeight: '600px' }}
        onError={() => {
          console.error('Video failed to load:', videoUrl)
          setVideoError(true)
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button
        onClick={() => setUseEmbed(true)}
        className={`mt-3 text-xs ${colors.textSecondary} hover:${colors.text} transition-colors`}
      >
        View on Instagram instead
      </button>
    </div>
  )
}
