import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch, useParams } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ExternalLink, Search, ChevronUp, ChevronDown, Filter, X, Trash2, Plus, ChevronLeft, ChevronRight, ListPlus } from 'lucide-react'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'
import { Dropdown } from '../components/ui/Dropdown'
import { MultiSelect } from '../components/ui/MultiSelect'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { AddProfileDialog } from '../components/ui/AddProfileDialog'
import { Header } from '../components/ui/Header'

const STORAGE_KEY_PANEL = 'profiles_filter_panel_open'
const STORAGE_KEY_FILTERS = 'profiles_filters'
const PAGE_SIZE = 50

const PLATFORM_OPTIONS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'TikTok', label: 'TikTok' },
]

const POST_STATUS_OPTIONS = [
  { value: 'all', label: 'All Profiles' },
  { value: 'with_posts', label: 'With Posts' },
  { value: 'without_posts', label: 'Without Posts' },
]

const REVIEW_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'has_unreviewed', label: 'Has Unreviewed' },
  { value: 'fully_reviewed', label: 'Fully Reviewed' },
]

const createColumns = (onDelete, onQueue, onRemoveFromQueue, queuedProfileIds) => [
  {
    accessorKey: 'username',
    header: 'Profile',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {row.original.username?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="font-medium truncate">{row.original.username}</span>
      </div>
    ),
  },
  {
    accessorKey: 'platform',
    header: 'Source',
    cell: ({ getValue }) => {
      const platform = getValue()
      const platformColors = {
        Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
        YouTube: 'bg-red-500',
        TikTok: 'bg-black',
      }
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${platformColors[platform] || 'bg-gray-500'}`}>
          {platform}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_posts',
    header: 'Total',
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  },
  {
    accessorKey: 'unreviewed_posts',
    header: 'Unreviewed',
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  },
  {
    id: 'reviewStatus',
    header: 'Progress',
    cell: ({ row }) => {
      const unreviewed = parseInt(row.original.unreviewed_posts) || 0
      const total = parseInt(row.original.total_posts) || 0
      const reviewed = total - unreviewed
      const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0

      return (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#272727] dark:bg-[#272727] rounded-full overflow-hidden min-w-[60px] md:min-w-[100px]">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm tabular-nums whitespace-nowrap opacity-70">
            {percentage}%
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: ({ row }) => {
      const isQueued = queuedProfileIds.has(row.original.id)
      return (
        <div className="flex items-center gap-1">
          {isQueued ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFromQueue(row.original)
              }}
              className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors inline-flex opacity-70 hover:opacity-100 text-orange-400"
              title="Remove from scrape queue"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQueue(row.original)
              }}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors inline-flex opacity-70 hover:opacity-100 text-blue-400"
              title="Add to scrape queue"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          )}
          <a
            href={row.original.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-[#272727] rounded-lg transition-colors inline-flex opacity-70"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(row.original)
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors inline-flex opacity-70 hover:opacity-100 text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  },
]

// Mobile card component
function ProfileCard({ profile, onClick, onDelete, onQueue, onRemoveFromQueue, isQueued, colors }) {
  const unreviewed = parseInt(profile.unreviewed_posts) || 0
  const total = parseInt(profile.total_posts) || 0
  const reviewed = total - unreviewed
  const percentage = total > 0 ? Math.round((reviewed / total) * 100) : 0

  const platformColors = {
    Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    YouTube: 'bg-red-500',
    TikTok: 'bg-black',
  }

  return (
    <div
      onClick={onClick}
      className={`${colors.bgSecondary} rounded-lg border ${colors.border} p-4 cursor-pointer ${colors.bgHover} transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
            {profile.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium block">{profile.username}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${platformColors[profile.platform] || 'bg-gray-500'}`}>
              {profile.platform}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isQueued ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFromQueue(profile)
              }}
              className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors text-orange-400"
              title="Remove from scrape queue"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQueue(profile)
              }}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
              title="Add to scrape queue"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          )}
          <a
            href={profile.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 ${colors.bgHover} rounded-lg transition-colors`}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className={`w-4 h-4 ${colors.textSecondary}`} />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(profile)
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex-1 h-2 ${colors.bgTertiary} rounded-full overflow-hidden`}>
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-sm ${colors.textSecondary} tabular-nums whitespace-nowrap`}>
          {unreviewed}/{total}
        </span>
      </div>
    </div>
  )
}

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

export function ProfilePage() {
  const navigate = useNavigate()
  const { categorySlug } = useParams({ from: '/content-farm/categories/$categorySlug' })
  const search = useSearch({ from: '/content-farm/categories/$categorySlug' })
  const queryClient = useQueryClient()
  const { darkMode, setDarkMode, colors } = useTheme()
  const [sorting, setSorting] = useState([{ id: 'unreviewed_posts', desc: true }])
  const initializedRef = useRef(false)
  const searchDebounceRef = useRef(null)

  // Fetch category info
  const { data: categoryData } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => api.categories.getBySlug(categorySlug),
  })
  const category = categoryData?.category

  // Fetch queue data
  const { data: queueData } = useQuery({
    queryKey: ['scrapeQueue'],
    queryFn: () => api.queue.getAll({ status: 'pending', limit: 100 }),
    refetchInterval: 5000, // Poll every 5s
  })
  const queuedProfileIds = new Set((queueData?.queue || []).map(item => item.profile_id))

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Categories', to: { to: '/content-farm/categories' } },
    { label: category?.name || categorySlug },
  ]

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState(null)

  // Remove from queue dialog state
  const [removeQueueDialogOpen, setRemoveQueueDialogOpen] = useState(false)
  const [queueItemToRemove, setQueueItemToRemove] = useState(null)

  // Add profile dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addError, setAddError] = useState(null)

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.profiles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-with-stats', categorySlug] })
      setDeleteDialogOpen(false)
      setProfileToDelete(null)
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (profileUrl) => api.profiles.create({ profile_url: profileUrl, category_id: category?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-with-stats', categorySlug] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setAddDialogOpen(false)
      setAddError(null)
    },
    onError: (error) => {
      setAddError(error.response?.data?.error || 'Failed to add profile')
    },
  })

  // Queue mutation
  const queueMutation = useMutation({
    mutationFn: (profileId) => api.queue.add({ profileIds: [profileId], priority: 0, options: { limit: 50 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapeQueue'] })
    },
  })

  // Remove from queue mutation
  const removeQueueMutation = useMutation({
    mutationFn: (queueId) => api.queue.remove(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapeQueue'] })
      setRemoveQueueDialogOpen(false)
      setQueueItemToRemove(null)
    },
  })

  const handleDeleteClick = (profile) => {
    setProfileToDelete(profile)
    setDeleteDialogOpen(true)
  }

  const handleQueueClick = (profile) => {
    queueMutation.mutate(profile.id)
  }

  const handleRemoveFromQueueClick = (profile) => {
    // Find queue item for this profile
    const queueItem = (queueData?.queue || []).find(item => item.profile_id === profile.id)
    if (queueItem) {
      setQueueItemToRemove(queueItem)
      setRemoveQueueDialogOpen(true)
    }
  }

  const handleConfirmRemoveFromQueue = () => {
    if (queueItemToRemove) {
      removeQueueMutation.mutate(queueItemToRemove.id)
    }
  }

  const handleConfirmDelete = () => {
    if (profileToDelete) {
      deleteMutation.mutate(profileToDelete.id)
    }
  }

  const handleAddProfile = (url) => {
    if (!category?.id) {
      setAddError('Category not loaded. Please try again.')
      return
    }
    setAddError(null)
    createMutation.mutate(url)
  }

  // Initialize showFilters from localStorage
  const [showFilters, setShowFilters] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PANEL) === 'true'
    } catch {
      return false
    }
  })

  // Local state for filters (synced with URL)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [platformFilter, setPlatformFilterState] = useState([])
  const [postStatusFilter, setPostStatusFilterState] = useState('with_posts')
  const [reviewStatusFilter, setReviewStatusFilterState] = useState('all')
  const [page, setPage] = useState(0)

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

    const hasUrlFilters = Boolean(search.q || search.platform || search.postStatus || search.reviewStatus || search.page)

    if (hasUrlFilters) {
      // Use URL params
      setSearchInput(search.q || '')
      setDebouncedSearch(search.q || '')
      setPlatformFilterState(search.platform ? search.platform.split(',').filter(Boolean) : [])
      setPostStatusFilterState(search.postStatus || 'with_posts')
      setReviewStatusFilterState(search.reviewStatus || 'all')
      setPage(parseInt(search.page) || 0)
    } else {
      // Try localStorage
      const stored = getStoredFilters()
      if (stored && Object.keys(stored).length > 0) {
        setSearchInput(stored.q || '')
        setDebouncedSearch(stored.q || '')
        setPlatformFilterState(stored.platform ? stored.platform.split(',').filter(Boolean) : [])
        setPostStatusFilterState(stored.postStatus || 'with_posts')
        setReviewStatusFilterState(stored.reviewStatus || 'all')
        setPage(parseInt(stored.page) || 0)
        // Also update URL
        navigate({ to: '/content-farm/categories/$categorySlug', params: { categorySlug }, search: stored, replace: true })
      }
    }
  }, [categorySlug])

  // Helper to build search object from current state
  const buildSearchObject = useCallback((overrides = {}) => {
    const state = {
      q: overrides.q !== undefined ? overrides.q : debouncedSearch,
      platform: overrides.platform !== undefined ? overrides.platform : platformFilter,
      postStatus: overrides.postStatus !== undefined ? overrides.postStatus : postStatusFilter,
      reviewStatus: overrides.reviewStatus !== undefined ? overrides.reviewStatus : reviewStatusFilter,
      page: overrides.page !== undefined ? overrides.page : page,
    }

    const newSearch = {}
    if (state.q) newSearch.q = state.q
    if (state.platform.length > 0) newSearch.platform = state.platform.join(',')
    if (state.postStatus !== 'with_posts') newSearch.postStatus = state.postStatus
    if (state.reviewStatus !== 'all') newSearch.reviewStatus = state.reviewStatus
    if (state.page > 0) newSearch.page = state.page

    return newSearch
  }, [debouncedSearch, platformFilter, postStatusFilter, reviewStatusFilter, page])

  // Update URL and localStorage when filters change
  const syncToUrl = useCallback((newSearch) => {
    saveFilters(newSearch)
    navigate({ to: '/content-farm/categories/$categorySlug', params: { categorySlug }, search: newSearch, replace: true })
  }, [navigate, categorySlug])

  // Debounced search handler
  const handleSearchChange = (value) => {
    setSearchInput(value)
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(0) // Reset to first page on search
      syncToUrl(buildSearchObject({ q: value, page: 0 }))
    }, 300)
  }

  const setPlatformFilter = (value) => {
    setPlatformFilterState(value)
    setPage(0)
    syncToUrl(buildSearchObject({ platform: value, page: 0 }))
  }
  const setPostStatusFilter = (value) => {
    setPostStatusFilterState(value)
    setPage(0)
    syncToUrl(buildSearchObject({ postStatus: value, page: 0 }))
  }
  const setReviewStatusFilter = (value) => {
    setReviewStatusFilterState(value)
    setPage(0)
    syncToUrl(buildSearchObject({ reviewStatus: value, page: 0 }))
  }

  // Build API params from filter state
  const apiParams = useMemo(() => {
    const params = {
      category: categorySlug,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }
    if (debouncedSearch) params.search = debouncedSearch
    if (platformFilter.length > 0) params.platform = platformFilter.join(',')
    if (postStatusFilter !== 'all') params.postStatus = postStatusFilter
    if (reviewStatusFilter !== 'all') params.reviewStatus = reviewStatusFilter
    return params
  }, [categorySlug, debouncedSearch, platformFilter, postStatusFilter, reviewStatusFilter, page])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['profiles-with-stats', categorySlug, apiParams],
    queryFn: () => api.profiles.getWithReviewStats(apiParams),
    keepPreviousData: true,
  })

  const profiles = data?.profiles || []
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const activeFilterCount = [
    platformFilter.length > 0,
    postStatusFilter !== 'with_posts',
    reviewStatusFilter !== 'all',
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setPlatformFilterState([])
    setPostStatusFilterState('with_posts')
    setReviewStatusFilterState('all')
    setPage(0)
    saveFilters({})
    navigate({ to: '/content-farm/categories/$categorySlug', params: { categorySlug }, search: {}, replace: true })
  }

  const goToPage = (newPage) => {
    setPage(newPage)
    syncToUrl(buildSearchObject({ page: newPage }))
  }

  const columns = useMemo(() => createColumns(handleDeleteClick, handleQueueClick, handleRemoveFromQueueClick, queuedProfileIds), [handleQueueClick, handleRemoveFromQueueClick, queuedProfileIds])

  const table = useReactTable({
    data: profiles,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true,
  })

  const rows = table.getRowModel().rows

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={breadcrumbItems} />

      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="h-full max-w-6xl mx-auto flex flex-col">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-xl md:text-2xl font-bold">Profiles</h1>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search profiles..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
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
                <button
                  onClick={() => setAddDialogOpen(true)}
                  disabled={!category}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Profile</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className={`flex flex-wrap items-center gap-3 p-3 ${colors.bgSecondary} border ${colors.border} rounded-lg`}>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs ${colors.textSecondary}`}>Platform</label>
                  <MultiSelect
                    options={PLATFORM_OPTIONS}
                    value={platformFilter}
                    onChange={setPlatformFilter}
                    placeholder="All Platforms"
                    className="w-40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs ${colors.textSecondary}`}>Post Status</label>
                  <Dropdown
                    options={POST_STATUS_OPTIONS}
                    value={postStatusFilter}
                    onChange={setPostStatusFilter}
                    className="w-36"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-xs ${colors.textSecondary}`}>Review Status</label>
                  <Dropdown
                    options={REVIEW_STATUS_OPTIONS}
                    value={reviewStatusFilter}
                    onChange={setReviewStatusFilter}
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
                  <ProfileCard
                    key={row.id}
                    profile={row.original}
                    colors={colors}
                    onClick={() => navigate({ to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId: row.original.id } })}
                    onDelete={handleDeleteClick}
                    onQueue={handleQueueClick}
                    onRemoveFromQueue={handleRemoveFromQueueClick}
                    isQueued={queuedProfileIds.has(row.original.id)}
                  />
                ))}
                {rows.length === 0 && (
                  <div className={`py-12 text-center ${colors.textSecondary}`}>
                    {searchInput || activeFilterCount > 0 ? 'No profiles match your filters' : 'No profiles found'}
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
                              className={`px-4 py-3 text-left text-xs font-medium ${colors.textSecondary} uppercase tracking-wider ${
                                header.column.getCanSort() ? `cursor-pointer select-none ${colors.bgHover}` : ''
                              }`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className="flex items-center gap-1">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
                                {header.column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
                              </div>
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
                          onClick={() => navigate({ to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId: row.original.id } })}
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
                      {searchInput || activeFilterCount > 0 ? 'No profiles match your filters' : 'No profiles found'}
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between mt-4 px-2`}>
                  <div className={`text-sm ${colors.textSecondary}`}>
                    Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                    {isFetching && <span className="ml-2 opacity-50">Loading...</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 0}
                      className={`p-2 ${colors.bgTertiary} border ${colors.border} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:${colors.bgHover}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`text-sm ${colors.textSecondary} tabular-nums`}>
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages - 1}
                      className={`p-2 ${colors.bgTertiary} border ${colors.border} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:${colors.bgHover}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setProfileToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Profile"
        message={profileToDelete
          ? `Are you sure you want to delete "${profileToDelete.username}"? This will also delete all ${profileToDelete.total_posts || 0} posts and their classifications. This action cannot be undone.`
          : ''
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={removeQueueDialogOpen}
        onClose={() => {
          setRemoveQueueDialogOpen(false)
          setQueueItemToRemove(null)
        }}
        onConfirm={handleConfirmRemoveFromQueue}
        title="Remove from Queue"
        message={queueItemToRemove
          ? `Remove "${queueItemToRemove.username}" from the scrape queue?`
          : ''
        }
        confirmText="Remove"
        isLoading={removeQueueMutation.isPending}
      />

      <AddProfileDialog
        isOpen={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false)
          setAddError(null)
        }}
        onSubmit={handleAddProfile}
        isLoading={createMutation.isPending}
        error={addError}
      />
    </div>
  )
}
