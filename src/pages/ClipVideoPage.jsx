import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { usePost } from '../hooks/usePost'
import { useTheme } from '../context/ThemeContext'

export function ClipVideoPage() {
  const navigate = useNavigate()
  const { profileId, postId } = useParams({ from: '/content-farm/$profileId/classify/$postId/clip' })
  const { darkMode, setDarkMode, colors } = useTheme()
  const { data: post, isLoading } = usePost(postId)

  return (
    <div className={`h-screen w-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-3 md:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate({ to: '/content-farm/$profileId/classify/$postId', params: { profileId, postId } })}
              className={`p-2 rounded-lg transition-colors ${colors.bgHover}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className={`text-sm md:text-base font-semibold ${colors.text}`}>Clip Video</span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 md:p-2 rounded-full transition-colors ${colors.bgHover}`}
          >
            {darkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`w-8 h-8 border-2 ${colors.textSecondary} border-t-transparent rounded-full animate-spin`} />
            </div>
          ) : post ? (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Post Metadata</h1>

              <div className={`${colors.bgSecondary} rounded-lg border ${colors.border} p-6 space-y-4`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Post ID</span>
                    <span className="font-mono">{post.id}</span>
                  </div>

                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Platform</span>
                    <span>{post.platform}</span>
                  </div>

                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Posted At</span>
                    <span>{post.posted_at ? new Date(post.posted_at).toLocaleString() : '—'}</span>
                  </div>

                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Profile ID</span>
                    <span className="font-mono">{post.profile_id}</span>
                  </div>
                </div>

                <div>
                  <span className={`text-sm ${colors.textSecondary} block mb-1`}>Post URL</span>
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {post.post_url}
                  </a>
                </div>

                {post.video_url && (
                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Video URL</span>
                    <a
                      href={post.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {post.video_url}
                    </a>
                  </div>
                )}

                {post.thumbnail_url && (
                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Thumbnail</span>
                    <img
                      src={post.thumbnail_url}
                      alt="Thumbnail"
                      className="max-w-xs rounded-lg"
                    />
                  </div>
                )}

                {post.caption && (
                  <div>
                    <span className={`text-sm ${colors.textSecondary} block mb-1`}>Caption</span>
                    <p className={`${colors.bgTertiary} p-3 rounded-lg whitespace-pre-wrap`}>{post.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`text-center ${colors.textSecondary} py-20`}>
              Post not found
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
