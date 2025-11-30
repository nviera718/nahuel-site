import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ExternalLink, Search, ChevronUp, ChevronDown, Moon, Sun, Filter, X, Trash2, Plus } from 'lucide-react'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'
import { Dropdown } from '../components/ui/Dropdown'
import { MultiSelect } from '../components/ui/MultiSelect'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { AddProfileDialog } from '../components/ui/AddProfileDialog'

const STORAGE_KEY_PANEL = 'profiles_filter_panel_open'
const STORAGE_KEY_FILTERS = 'profiles_filters'

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

const createColumns = (onDelete) => [
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
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
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
    ),
  },
]

// Mobile card component
function ProfileCard({ profile, onClick, onDelete, colors }) {
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

export function HomePage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/content-farm' })
  const queryClient = useQueryClient()
  const { darkMode, setDarkMode, colors } = useTheme()
  const [sorting, setSorting] = useState([{ id: 'unreviewed_posts', desc: true }])
  const initializedRef = useRef(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState(null)

  // Add profile dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addError, setAddError] = useState(null)

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.profiles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-with-stats'] })
      setDeleteDialogOpen(false)
      setProfileToDelete(null)
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (profileUrl) => api.profiles.create({ profile_url: profileUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles-with-stats'] })
      setAddDialogOpen(false)
      setAddError(null)
    },
    onError: (error) => {
      setAddError(error.response?.data?.error || 'Failed to add profile')
    },
  })

  const handleDeleteClick = (profile) => {
    setProfileToDelete(profile)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (profileToDelete) {
      deleteMutation.mutate(profileToDelete.id)
    }
  }

  const handleAddProfile = (url) => {
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
  const [globalFilter, setGlobalFilterState] = useState('')
  const [platformFilter, setPlatformFilterState] = useState([])
  const [postStatusFilter, setPostStatusFilterState] = useState('with_posts')
  const [reviewStatusFilter, setReviewStatusFilterState] = useState('all')

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

    const hasUrlFilters = Boolean(search.q || search.platform || search.postStatus || search.reviewStatus)

    if (hasUrlFilters) {
      // Use URL params
      setGlobalFilterState(search.q || '')
      setPlatformFilterState(search.platform ? search.platform.split(',').filter(Boolean) : [])
      setPostStatusFilterState(search.postStatus || 'with_posts')
      setReviewStatusFilterState(search.reviewStatus || 'all')
    } else {
      // Try localStorage
      const stored = getStoredFilters()
      if (stored && Object.keys(stored).length > 0) {
        setGlobalFilterState(stored.q || '')
        setPlatformFilterState(stored.platform ? stored.platform.split(',').filter(Boolean) : [])
        setPostStatusFilterState(stored.postStatus || 'with_posts')
        setReviewStatusFilterState(stored.reviewStatus || 'all')
        // Also update URL
        navigate({ to: '/content-farm', search: stored, replace: true })
      }
    }
  }, [])

  // Helper to build search object from current state
  const buildSearchObject = (overrides = {}) => {
    const state = {
      q: overrides.q !== undefined ? overrides.q : globalFilter,
      platform: overrides.platform !== undefined ? overrides.platform : platformFilter,
      postStatus: overrides.postStatus !== undefined ? overrides.postStatus : postStatusFilter,
      reviewStatus: overrides.reviewStatus !== undefined ? overrides.reviewStatus : reviewStatusFilter,
    }

    const newSearch = {}
    if (state.q) newSearch.q = state.q
    if (state.platform.length > 0) newSearch.platform = state.platform.join(',')
    if (state.postStatus !== 'with_posts') newSearch.postStatus = state.postStatus
    if (state.reviewStatus !== 'all') newSearch.reviewStatus = state.reviewStatus

    return newSearch
  }

  // Update URL and localStorage when filters change
  const syncToUrl = (newSearch) => {
    saveFilters(newSearch)
    navigate({ to: '/content-farm', search: newSearch, replace: true })
  }

  const setGlobalFilter = (value) => {
    setGlobalFilterState(value)
    syncToUrl(buildSearchObject({ q: value }))
  }
  const setPlatformFilter = (value) => {
    setPlatformFilterState(value)
    syncToUrl(buildSearchObject({ platform: value }))
  }
  const setPostStatusFilter = (value) => {
    setPostStatusFilterState(value)
    syncToUrl(buildSearchObject({ postStatus: value }))
  }
  const setReviewStatusFilter = (value) => {
    setReviewStatusFilterState(value)
    syncToUrl(buildSearchObject({ reviewStatus: value }))
  }

  const { data, isLoading } = useQuery({
    queryKey: ['profiles-with-stats'],
    queryFn: () => api.profiles.getWithReviewStats(),
  })

  const filteredData = useMemo(() => {
    if (!data?.profiles) return []

    return data.profiles.filter(profile => {
      const totalPosts = parseInt(profile.total_posts) || 0
      const unreviewedPosts = parseInt(profile.unreviewed_posts) || 0

      // Post status filter
      if (postStatusFilter === 'with_posts' && totalPosts === 0) return false
      if (postStatusFilter === 'without_posts' && totalPosts > 0) return false

      // Platform filter
      if (platformFilter.length > 0 && !platformFilter.includes(profile.platform)) return false

      // Review status filter
      if (reviewStatusFilter === 'has_unreviewed' && unreviewedPosts === 0) return false
      if (reviewStatusFilter === 'fully_reviewed' && unreviewedPosts > 0) return false

      return true
    })
  }, [data, platformFilter, postStatusFilter, reviewStatusFilter])

  const activeFilterCount = [
    platformFilter.length > 0,
    postStatusFilter !== 'with_posts',
    reviewStatusFilter !== 'all',
  ].filter(Boolean).length

  const clearFilters = () => {
    setGlobalFilterState('')
    setPlatformFilterState([])
    setPostStatusFilterState('with_posts')
    setReviewStatusFilterState('all')
    saveFilters({})
    navigate({ to: '/content-farm', search: {}, replace: true })
  }

  const columns = useMemo(() => createColumns(handleDeleteClick), [])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const filteredRows = table.getRowModel().rows

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <span className="text-base font-semibold">Video Classifier</span>
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
              <h1 className="text-xl md:text-2xl font-bold">Profiles</h1>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search profiles..."
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
                <button
                  onClick={() => setAddDialogOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
                {filteredRows.map(row => (
                  <ProfileCard
                    key={row.id}
                    profile={row.original}
                    colors={colors}
                    onClick={() => navigate({ to: '/content-farm/$profileId', params: { profileId: row.original.id } })}
                    onDelete={handleDeleteClick}
                  />
                ))}
                {filteredRows.length === 0 && (
                  <div className={`py-12 text-center ${colors.textSecondary}`}>
                    {globalFilter || activeFilterCount > 0 ? 'No profiles match your filters' : 'No profiles found'}
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
                      {filteredRows.map(row => (
                        <tr
                          key={row.id}
                          className={`border-b ${colors.border} last:border-0 ${colors.bgHover} cursor-pointer transition-colors`}
                          onClick={() => navigate({ to: '/content-farm/$profileId', params: { profileId: row.original.id } })}
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

                  {filteredRows.length === 0 && (
                    <div className={`py-12 text-center ${colors.textSecondary}`}>
                      {globalFilter || activeFilterCount > 0 ? 'No profiles match your filters' : 'No profiles found'}
                    </div>
                  )}
                </div>
              </div>
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
