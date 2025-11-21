import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ArrowLeft, Check, X, Clock, Moon, Sun } from 'lucide-react'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'

const columns = [
  {
    id: 'thumbnail',
    header: '',
    cell: ({ row }) => (
      <div className="w-16 h-16 rounded-lg bg-[#272727] overflow-hidden flex-shrink-0">
        {row.original.thumbnail_url ? (
          <img
            src={row.original.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-50">
            <Clock className="w-6 h-6" />
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'caption',
    header: 'Caption',
    cell: ({ getValue }) => {
      const caption = getValue() || 'No caption'
      return (
        <span className="text-sm line-clamp-2 max-w-md">
          {caption.length > 100 ? `${caption.slice(0, 100)}...` : caption}
        </span>
      )
    },
  },
  {
    accessorKey: 'posted_at',
    header: 'Posted',
    cell: ({ getValue }) => {
      const date = getValue()
      if (!date) return <span className="opacity-50">—</span>
      return (
        <span className="text-sm opacity-70">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    id: 'reviewStatus',
    header: 'Status',
    cell: ({ row }) => {
      const { classification_id, is_approved } = row.original

      if (!classification_id) {
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-[#272727] opacity-70">
            Unreviewed
          </span>
        )
      }

      if (is_approved === true) {
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
            <Check className="w-3 h-3" />
            Approved
          </span>
        )
      }

      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
          <X className="w-3 h-3" />
          Rejected
        </span>
      )
    },
  },
  {
    id: 'trickType',
    header: 'Trick Type',
    cell: ({ row }) => {
      const { trick_type } = row.original
      if (!trick_type) return <span className="opacity-50">—</span>
      return <span className="text-sm">{trick_type}</span>
    },
  },
]

// Mobile card component
function VideoCard({ video, onClick, colors }) {
  const { classification_id, is_approved, trick_type, thumbnail_url, caption, posted_at } = video

  const getStatusBadge = () => {
    if (!classification_id) {
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bgTertiary} ${colors.textSecondary}`}>
          Unreviewed
        </span>
      )
    }
    if (is_approved === true) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
          <Check className="w-3 h-3" />
          Approved
        </span>
      )
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
        <X className="w-3 h-3" />
        Rejected
      </span>
    )
  }

  return (
    <div
      onClick={onClick}
      className={`${colors.bgSecondary} rounded-lg border ${colors.border} p-3 cursor-pointer ${colors.bgHover} transition-colors`}
    >
      <div className="flex gap-3">
        <div className={`w-20 h-20 rounded-lg ${colors.bgTertiary} overflow-hidden flex-shrink-0`}>
          {thumbnail_url ? (
            <img
              src={thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${colors.textMuted}`}>
              <Clock className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm line-clamp-2 mb-2">
            {caption ? (caption.length > 80 ? `${caption.slice(0, 80)}...` : caption) : 'No caption'}
          </p>
          <div className="flex items-center justify-between gap-2">
            {getStatusBadge()}
            {posted_at && (
              <span className={`text-xs ${colors.textSecondary}`}>
                {new Date(posted_at).toLocaleDateString()}
              </span>
            )}
          </div>
          {trick_type && (
            <span className={`text-xs ${colors.textSecondary} mt-1 block`}>{trick_type}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProfileVideosPage() {
  const navigate = useNavigate()
  const { profileId } = useParams({ from: '/profiles/$profileId' })
  const { darkMode, setDarkMode, colors } = useTheme()

  const { data, isLoading } = useQuery({
    queryKey: ['profile-videos', profileId],
    queryFn: () => api.posts.getWithReviewStatus({ profileId }),
    enabled: !!profileId,
  })

  const table = useReactTable({
    data: data?.posts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className={`p-2 ${colors.bgHover} rounded-lg transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold">Profile Videos</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="h-full max-w-6xl mx-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold">Videos</h1>
            {data && (
              <span className={`text-sm ${colors.textSecondary}`}>
                {data.total} videos
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`w-8 h-8 border-2 ${colors.textSecondary} border-t-transparent rounded-full animate-spin`} />
            </div>
          ) : (
            <>
              {/* Mobile: Card view */}
              <div className="flex-1 overflow-auto md:hidden space-y-3">
                {rows.map(row => (
                  <VideoCard
                    key={row.id}
                    video={row.original}
                    colors={colors}
                    onClick={() => navigate({ to: '/profiles/$profileId/classify/$postId', params: { profileId, postId: row.original.id } })}
                  />
                ))}
                {rows.length === 0 && (
                  <div className={`py-12 text-center ${colors.textSecondary}`}>
                    No videos found for this profile
                  </div>
                )}
              </div>

              {/* Tablet/Desktop: Table view */}
              <div className={`hidden md:flex flex-1 ${colors.bgSecondary} rounded-lg border ${colors.border} overflow-hidden flex-col`}>
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className={`sticky top-0 ${colors.bgSecondary} z-10`}>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className={`border-b ${colors.border}`}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className={`px-4 py-3 text-left text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr
                          key={row.id}
                          className={`border-b ${colors.border} last:border-0 ${colors.bgHover} cursor-pointer transition-colors`}
                          onClick={() => navigate({ to: '/profiles/$profileId/classify/$postId', params: { profileId, postId: row.original.id } })}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {rows.length === 0 && (
                    <div className={`py-12 text-center ${colors.textSecondary}`}>
                      No videos found for this profile
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
