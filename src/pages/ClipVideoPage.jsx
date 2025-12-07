import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { usePost } from '../hooks/usePost'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api-client'
import { Header } from '../components/ui/Header'

export function ClipVideoPage() {
  const navigate = useNavigate()
  const { categorySlug, profileId, postId } = useParams({ from: '/content-farm/categories/$categorySlug/$profileId/classify/$postId/clip' })
  const { darkMode, setDarkMode, colors } = useTheme()
  const { data: post, isLoading } = usePost(postId)

  // Fetch profile info
  const { data: profileData } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.profiles.getById(profileId),
    enabled: !!profileId,
  })
  const profile = profileData?.profile

  // Fetch category info
  const { data: categoryData } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => api.categories.getBySlug(categorySlug),
    enabled: !!categorySlug,
  })
  const category = categoryData?.category

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Categories', to: { to: '/content-farm/categories' } },
    { label: category?.name || categorySlug, to: { to: '/content-farm/categories/$categorySlug', params: { categorySlug } } },
    { label: profile?.username || 'Profile', to: { to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId } } },
    { label: 'Classify', to: { to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId', params: { categorySlug, profileId, postId } } },
    { label: 'Clip' },
  ]

  return (
    <div className={`h-screen w-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={breadcrumbItems} />

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
