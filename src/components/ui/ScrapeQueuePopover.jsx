import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ListOrdered, X, Trash2, ChevronDown, ChevronUp, Play, Trash } from 'lucide-react'
import { api } from '../../lib/api-client'
import { useTheme } from '../../context/ThemeContext'
import { ConfirmDialog } from './ConfirmDialog'
import { useWebSocketStats } from '../../hooks/useWebSocketStats'
import { usePermissions, PERMISSIONS } from '../../hooks/usePermissions'

export function ScrapeQueuePopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [statsExpanded, setStatsExpanded] = useState(false)
  const popoverRef = useRef(null)
  const { colors } = useTheme()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()

  // Remove confirmation dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)

  // Remove all confirmation dialog state
  const [removeAllDialogOpen, setRemoveAllDialogOpen] = useState(false)

  // Use WebSocket for real-time stats
  const { queue, recentItems, isConnected } = useWebSocketStats()

  // Fetch download queue stats
  const { data: downloadQueueStats } = useQuery({
    queryKey: ['download-queue-stats'],
    queryFn: () => api.downloadQueue.getStats(),
    refetchInterval: isOpen ? 3000 : false, // Refresh every 3s when open
  })

  // Fetch all categories to get category names
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
  })
  const categoriesMap = new Map((categoriesData?.categories || []).map(cat => [cat.id, cat.name]))

  const removeMutation = useMutation({
    mutationFn: (queueId) => api.queue.remove(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapeQueue'] })
      setRemoveDialogOpen(false)
      setItemToRemove(null)
    },
  })

  const scrapeMutation = useMutation({
    mutationFn: () => api.scrape.trigger({ maxItems: 10 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapeQueue'] })
    },
  })

  const clearPendingMutation = useMutation({
    mutationFn: () => api.queue.clearPending(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapeQueue'] })
      setRemoveAllDialogOpen(false)
    },
  })

  const handleRemoveClick = (item) => {
    setItemToRemove(item)
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeMutation.mutate(itemToRemove.id)
    }
  }

  const handleScrapeClick = () => {
    scrapeMutation.mutate()
  }

  const handleRemoveAllClick = () => {
    setRemoveAllDialogOpen(true)
  }

  const handleConfirmRemoveAll = () => {
    clearPendingMutation.mutate()
  }

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculate total pending from WebSocket stats
  const pendingCount = queue?.pending || 0
  const inProgressCount = queue?.inProgress || 0
  const totalActiveCount = pendingCount + inProgressCount
  const items = recentItems || []

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${colors.bgHover} ${isOpen ? colors.bgTertiary : ''}`}
        title="Scrape Queue"
      >
        <ListOrdered className="w-5 h-5" />
        {totalActiveCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {totalActiveCount > 99 ? '99+' : totalActiveCount}
          </span>
        )}
        {!isConnected && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover - Full screen on mobile, floating on desktop */}
          <div
            className={`
              fixed md:absolute
              inset-x-0 bottom-0 md:inset-auto md:right-0 md:top-full md:mt-2
              w-full md:w-[560px]
              max-h-[85vh] md:max-h-[80vh]
              ${colors.bgSecondary} border ${colors.border}
              rounded-t-2xl md:rounded-lg
              shadow-2xl z-50
              flex flex-col
            `}
          >
          {/* Header */}
          <div className={`p-4 md:p-3 border-b ${colors.border} flex-shrink-0`}>
            {/* Mobile drag handle */}
            <div className="flex justify-center mb-2 md:hidden">
              <div className={`w-12 h-1 rounded-full ${colors.bgTertiary}`} />
            </div>

            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${colors.text} text-lg md:text-base`}>Scrape Queue</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded transition-colors ${colors.bgHover}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {(hasPermission(PERMISSIONS.START_SCRAPE) || hasPermission(PERMISSIONS.MANAGE_SCRAPE_QUEUE)) && (
            <div className={`p-4 md:p-3 border-b ${colors.border} flex gap-2 flex-shrink-0`}>
              {hasPermission(PERMISSIONS.START_SCRAPE) && (
                <button
                  onClick={handleScrapeClick}
                  disabled={scrapeMutation.isPending || pendingCount === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:py-2 rounded transition-colors ${
                    pendingCount > 0 && !scrapeMutation.isPending
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  }`}
                  title={pendingCount === 0 ? 'No pending items to scrape' : 'Start scraping pending items'}
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {scrapeMutation.isPending ? 'Starting...' : 'Scrape'}
                  </span>
                </button>
              )}
              {hasPermission(PERMISSIONS.MANAGE_SCRAPE_QUEUE) && (
                <button
                  onClick={handleRemoveAllClick}
                  disabled={clearPendingMutation.isPending || pendingCount === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:py-2 rounded transition-colors ${
                    pendingCount > 0 && !clearPendingMutation.isPending
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  }`}
                  title={pendingCount === 0 ? 'No pending items to remove' : 'Remove all pending items'}
                >
                  <Trash className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {clearPendingMutation.isPending ? 'Removing...' : 'Remove All'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Stats Section - Collapsible */}
          {queue && (queue.total > 0 || totalActiveCount > 0) && (
            <div className={`border-b ${colors.border} flex-shrink-0`}>
              <button
                onClick={() => setStatsExpanded(!statsExpanded)}
                className={`w-full p-3 flex items-center justify-between ${colors.bgHover} transition-colors`}
              >
                <span className={`text-sm font-medium ${colors.text}`}>Scrape Queue</span>
                {statsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {statsExpanded && (
                <div className="p-3 pt-0">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className={`${colors.textSecondary} mb-1`}>Pending</div>
                      <div className={`text-lg font-semibold text-yellow-400`}>{pendingCount}</div>
                    </div>
                    <div>
                      <div className={`${colors.textSecondary} mb-1`}>In Progress</div>
                      <div className={`text-lg font-semibold text-blue-400`}>{inProgressCount}</div>
                    </div>
                    <div>
                      <div className={`${colors.textSecondary} mb-1`}>Completed</div>
                      <div className={`text-lg font-semibold text-green-400`}>{queue.completed || 0}</div>
                    </div>
                    <div>
                      <div className={`${colors.textSecondary} mb-1`}>Failed</div>
                      <div className={`text-lg font-semibold text-red-400`}>{queue.failed || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download Queue Stats */}
          {downloadQueueStats && downloadQueueStats.total > 0 && (
            <div className={`border-b ${colors.border} flex-shrink-0 p-4 md:p-3 ${colors.bgTertiary}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${colors.textSecondary}`}>Video Downloads</span>
                {downloadQueueStats.isRunning && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className={`text-base font-semibold text-yellow-400`}>{downloadQueueStats.pending || 0}</div>
                  <div className={`${colors.textSecondary}`}>Queued</div>
                </div>
                <div>
                  <div className={`text-base font-semibold text-blue-400`}>{downloadQueueStats.processing || 0}</div>
                  <div className={`${colors.textSecondary}`}>Downloading</div>
                </div>
                <div>
                  <div className={`text-base font-semibold text-green-400`}>{downloadQueueStats.completed || 0}</div>
                  <div className={`${colors.textSecondary}`}>Done</div>
                </div>
                <div>
                  <div className={`text-base font-semibold text-red-400`}>{downloadQueueStats.failed || 0}</div>
                  <div className={`${colors.textSecondary}`}>Failed</div>
                </div>
              </div>
            </div>
          )}

          {/* Items List - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!queue ? (
              <div className={`p-8 text-center ${colors.textSecondary}`}>
                <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {isConnected ? 'Loading queue...' : 'Disconnected'}
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className={`p-8 text-center ${colors.textSecondary}`}>
                <ListOrdered className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent items</p>
              </div>
            ) : (
              <div className="p-3 md:p-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 md:p-3 rounded-lg ${colors.bgTertiary} mb-3 md:mb-2 last:mb-0`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium truncate ${colors.text}`}>
                            {item.username}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getPlatformColor(item.platform)}`}>
                            {item.platform}
                          </span>
                        </div>
                        {item.category_id && categoriesMap.has(item.category_id) && (
                          <div className={`text-xs ${colors.textSecondary} mb-1`}>
                            {categoriesMap.get(item.category_id)}
                          </div>
                        )}
                        <div className={`text-xs ${colors.textSecondary}`}>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            {item.priority > 0 && (
                              <span className="text-yellow-400">
                                Priority: {item.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {hasPermission(PERMISSIONS.MANAGE_SCRAPE_QUEUE) && (
                        <button
                          onClick={() => handleRemoveClick(item)}
                          disabled={removeMutation.isPending || item.status !== 'pending'}
                          className={`p-1.5 rounded transition-colors ${item.status === 'pending' ? 'hover:bg-red-500/20 text-red-400' : 'opacity-30 cursor-not-allowed'}`}
                          title={item.status === 'pending' ? 'Remove from queue' : 'Cannot remove (not pending)'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </>
      )}

      <ConfirmDialog
        isOpen={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false)
          setItemToRemove(null)
        }}
        onConfirm={handleConfirmRemove}
        title="Remove from Queue"
        message={itemToRemove
          ? `Remove "${itemToRemove.username}" from the scrape queue?`
          : ''
        }
        confirmText="Remove"
        isLoading={removeMutation.isPending}
      />

      <ConfirmDialog
        isOpen={removeAllDialogOpen}
        onClose={() => setRemoveAllDialogOpen(false)}
        onConfirm={handleConfirmRemoveAll}
        title="Remove All Pending Items"
        message={`Remove all ${pendingCount} pending items from the scrape queue? This action cannot be undone.`}
        confirmText="Remove All"
        isLoading={clearPendingMutation.isPending}
      />
    </div>
  )
}

function getPlatformColor(platform) {
  const colors = {
    Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    YouTube: 'bg-red-500 text-white',
    TikTok: 'bg-black text-white',
  }
  return colors[platform] || 'bg-gray-500 text-white'
}

function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}
