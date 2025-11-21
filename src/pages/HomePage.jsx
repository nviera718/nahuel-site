import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ExternalLink, Search, ChevronUp, ChevronDown, Moon, Sun } from 'lucide-react'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'

const columns = [
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
      <a
        href={row.original.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-[#272727] rounded-lg transition-colors inline-flex opacity-70"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    ),
  },
]

// Mobile card component
function ProfileCard({ profile, onClick, colors }) {
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
        <a
          href={profile.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 ${colors.bgHover} rounded-lg transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className={`w-4 h-4 ${colors.textSecondary}`} />
        </a>
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

export function HomePage() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode, colors } = useTheme()
  const [sorting, setSorting] = useState([{ id: 'unreviewed_posts', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['profiles-with-stats'],
    queryFn: () => api.profiles.getWithReviewStats(),
  })

  const filteredData = useMemo(() => {
    if (!data?.profiles) return []
    return data.profiles.filter(p => parseInt(p.total_posts) > 0)
  }, [data])

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h1 className="text-xl md:text-2xl font-bold">Profiles</h1>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textMuted}`} />
              <input
                type="text"
                placeholder="Search profiles..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className={`w-full sm:w-64 pl-9 pr-4 py-2 ${colors.bgTertiary} border ${colors.border} rounded-lg text-sm ${colors.text} placeholder:${colors.textMuted} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
              />
            </div>
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
                  />
                ))}
                {filteredRows.length === 0 && (
                  <div className={`py-12 text-center ${colors.textSecondary}`}>
                    {globalFilter ? 'No profiles match your search' : 'No profiles with posts found'}
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
                      {globalFilter ? 'No profiles match your search' : 'No profiles with posts found'}
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
