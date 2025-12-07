import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Check, X, Clock, Moon, Sun, Filter, Search } from 'lucide-react'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'
import { Dropdown } from '../components/ui/Dropdown'
import { MultiSelect } from '../components/ui/MultiSelect'
import { Breadcrumb } from '../components/ui/Breadcrumb'

const STORAGE_KEY_PANEL = 'videos_filter_panel_open'
const STORAGE_KEY_FILTERS = 'videos_filters'

// Helper to get stored filters from localStorage
function getStoredFilters() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Helper to save filters to localStorage
function saveFilters(filters) {
  try {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters))
  } catch {
    // Ignore localStorage errors
  }
}

const REVIEW_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const TRICK_TYPE_OPTIONS = [
  { value: 'Rail', label: 'Rail' },
  { value: 'Gap', label: 'Gap' },
  { value: 'Half Pipe', label: 'Half Pipe' },
  { value: 'Ledge', label: 'Ledge' },
  { value: 'Stairs', label: 'Stairs' },
  { value: 'Manual', label: 'Manual' },
  { value: 'Flip Trick', label: 'Flip Trick' },
  { value: 'Grind', label: 'Grind' },
  { value: 'Line', label: 'Line' },
  { value: 'Hill Bomb', label: 'Hill Bomb' },
  { value: 'Other', label: 'Other' },
]

const VIDEO_URL_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'has_video', label: 'Has Video URL' },
  { value: 'no_video', label: 'Missing Video URL' },
]

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
  const { categorySlug, profileId } = useParams({ from: '/content-farm/categories/$categorySlug/$profileId' })
  const search = useSearch({ from: '/content-farm/categories/$categorySlug/$profileId' })
  const { darkMode, setDarkMode, colors } = useTheme()
  const initializedRef = useRef(false)

  // Initialize showFilters from localStorage
  const [showFilters, setShowFilters] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PANEL) === 'true'
    } catch {
      return false
    }
  })

  // Local state for filters (synced with URL)
  const [globalFilter, setGlobalFilterState] = useState('')
  const [reviewStatusFilter, setReviewStatusFilterState] = useState('all')
  const [trickTypeFilter, setTrickTypeFilterState] = useState([])
  const [videoUrlFilter, setVideoUrlFilterState] = useState('all')

  // Persist showFilters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PANEL, String(showFilters))
    } catch {
      // Ignore localStorage errors
    }
  }, [showFilters])

  // On mount, initialize from URL or localStorage
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const hasUrlFilters = Boolean(search.q || search.status || search.trickType || search.videoUrl)

    if (hasUrlFilters) {
      // Use URL params
      setGlobalFilterState(search.q || '')
      setReviewStatusFilterState(search.status || 'all')
      setTrickTypeFilterState(search.trickType ? search.trickType.split(',').filter(Boolean) : [])
      setVideoUrlFilterState(search.videoUrl || 'all')
    } else {
      // Try localStorage
      const stored = getStoredFilters()
      if (stored && Object.keys(stored).length > 0) {
        setGlobalFilterState(stored.q || '')
        setReviewStatusFilterState(stored.status || 'all')
        setTrickTypeFilterState(stored.trickType ? stored.trickType.split(',').filter(Boolean) : [])
        setVideoUrlFilterState(stored.videoUrl || 'all')
        // Also update URL
        navigate({ to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId }, search: stored, replace: true })
      }
    }
  }, [])

  // Helper to build search object from current state
  const buildSearchObject = (overrides = {}) => {
    const state = {
      q: overrides.q !== undefined ? overrides.q : globalFilter,
      status: overrides.status !== undefined ? overrides.status : reviewStatusFilter,
      trickType: overrides.trickType !== undefined ? overrides.trickType : trickTypeFilter,
      videoUrl: overrides.videoUrl !== undefined ? overrides.videoUrl : videoUrlFilter,
    }

    const newSearch = {}
    if (state.q) newSearch.q = state.q
    if (state.status !== 'all') newSearch.status = state.status
    if (state.trickType.length > 0) newSearch.trickType = state.trickType.join(',')
    if (state.videoUrl !== 'all') newSearch.videoUrl = state.videoUrl

    return newSearch
  }

  // Update URL and localStorage when filters change
  const syncToUrl = (newSearch) => {
    saveFilters(newSearch)
    navigate({ to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId }, search: newSearch, replace: true })
  }

  const setGlobalFilter = (value) => {
    setGlobalFilterState(value)
    syncToUrl(buildSearchObject({ q: value }))
  }
  const setReviewStatusFilter = (value) => {
    setReviewStatusFilterState(value)
    syncToUrl(buildSearchObject({ status: value }))
  }
  const setTrickTypeFilter = (value) => {
    setTrickTypeFilterState(value)
    syncToUrl(buildSearchObject({ trickType: value }))
  }
  const setVideoUrlFilter = (value) => {
    setVideoUrlFilterState(value)
    syncToUrl(buildSearchObject({ videoUrl: value }))
  }

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

  const { data, isLoading } = useQuery({
    queryKey: ['profile-videos', profileId],
    queryFn: () => api.posts.getWithReviewStatus({ profileId }),
    enabled: !!profileId,
  })

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Categories', to: { to: '/content-farm/categories' } },
    { label: category?.name || categorySlug, to: { to: '/content-farm/categories/$categorySlug', params: { categorySlug } } },
    { label: profile?.username || 'Profile' },
  ]

  const filteredData = useMemo(() => {
    if (!data?.posts) return []

    return data.posts.filter(post => {
      // Review status filter
      if (reviewStatusFilter === 'unreviewed' && post.classification_id) return false
      if (reviewStatusFilter === 'approved' && post.is_approved !== true) return false
      if (reviewStatusFilter === 'rejected' && post.is_approved !== false) return false

      // Trick type filter (multiselect)
      if (trickTypeFilter.length > 0) {
        if (!post.trick_type) return false
        // Check if any selected trick type matches
        const postTrickTypes = post.trick_type.split(',').map(t => t.trim())
        const hasMatch = trickTypeFilter.some(t => postTrickTypes.includes(t))
        if (!hasMatch) return false
      }

      // Video URL filter
      if (videoUrlFilter === 'has_video' && !post.video_url) return false
      if (videoUrlFilter === 'no_video' && post.video_url) return false

      // Global search (caption)
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase()
        const caption = (post.caption || '').toLowerCase()
        if (!caption.includes(searchLower)) return false
      }

      return true
    })
  }, [data, reviewStatusFilter, trickTypeFilter, videoUrlFilter, globalFilter])

  const activeFilterCount = [
    reviewStatusFilter !== 'all',
    trickTypeFilter.length > 0,
    videoUrlFilter !== 'all',
  ].filter(Boolean).length

  const clearFilters = () => {
    setGlobalFilterState('')
    setReviewStatusFilterState('all')
    setTrickTypeFilterState([])
    setVideoUrlFilterState('all')
    saveFilters({})
    navigate({ to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId }, search: {}, replace: true })
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <Breadcrumb items={breadcrumbItems} />
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
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold">Videos</h1>
                {data && (
                  <span className={`text-sm ${colors.textSecondary}`}>
                    {rows.length} of {data.total}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search captions..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className={`w-full sm:w-64 pl-9 pr-4 py-2 ${colors.bgTertiary} border ${colors.border} rounded-lg text-sm ${colors.text} placeholder:${colors.textMuted} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 ${colors.bgTertiary} border ${colors.border} rounded-lg transition-colors ${showFilters ? 'ring-2 ring-blue-500/50 border-blue-500' : ''} relative`}
                >
                  <Filter className="w-5 h-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className={`flex flex-wrap items-center gap-3 p-3 ${colors.bgSecondary} border ${colors.border} rounded-lg`}>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs ${colors.textSecondary}`}>Review Status</label>
                  <Dropdown
                    options={REVIEW_STATUS_OPTIONS}
                    value={reviewStatusFilter}
                    onChange={setReviewStatusFilter}
                    className="w-36"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs ${colors.textSecondary}`}>Trick Type</label>
                  <MultiSelect
                    options={TRICK_TYPE_OPTIONS}
                    value={trickTypeFilter}
                    onChange={setTrickTypeFilter}
                    placeholder="All Types"
                    className="w-44"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs ${colors.textSecondary}`}>Video URL</label>
                  <Dropdown
                    options={VIDEO_URL_OPTIONS}
                    value={videoUrlFilter}
                    onChange={setVideoUrlFilter}
                    className="w-40"
                  />
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className={`self-end flex items-center gap-1 px-3 py-2 text-sm ${colors.textSecondary} hover:${colors.text} transition-colors`}
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
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
                    onClick={() => navigate({ to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId', params: { categorySlug, profileId, postId: row.original.id } })}
                  />
                ))}
                {rows.length === 0 && (
                  <div className={`py-12 text-center ${colors.textSecondary}`}>
                    {globalFilter || activeFilterCount > 0 ? 'No videos match your filters' : 'No videos found for this profile'}
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
                          onClick={() => navigate({ to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId', params: { categorySlug, profileId, postId: row.original.id } })}
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
                      {globalFilter || activeFilterCount > 0 ? 'No videos match your filters' : 'No videos found for this profile'}
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
