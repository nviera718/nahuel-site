import { useState, useRef, useEffect } from 'react'
import { HardDrive, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useWebSocketStats } from '../../hooks/useWebSocketStats'

export function StorageIndicator() {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const { colors } = useTheme()
  const { storage, isConnected } = useWebSocketStats()

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

  const usagePercentage = storage?.usagePercentage || 0
  const getStorageColor = () => {
    if (usagePercentage >= 90) return 'text-red-500'
    if (usagePercentage >= 75) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500'
    if (usagePercentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${colors.bgHover} ${isOpen ? colors.bgTertiary : ''}`}
        title="Storage"
      >
        <HardDrive className={`w-5 h-5 ${getStorageColor()}`} />
        {!isConnected && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-xl z-50`}
          style={{ top: '100%' }}
        >
          <div className={`p-3 border-b ${colors.border} flex items-center justify-between`}>
            <h3 className={`font-semibold ${colors.text}`}>Media Storage</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded transition-colors ${colors.bgHover}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            {!storage ? (
              <div className={`text-center ${colors.textSecondary} py-4`}>
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {isConnected ? 'Loading storage info...' : 'Disconnected'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${colors.textSecondary}`}>Usage</span>
                    <span className={`text-2xl font-bold ${getStorageColor()}`}>
                      {usagePercentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-[#272727] dark:bg-[#272727] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor()} transition-all duration-500`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${colors.textSecondary}`}>Used</span>
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {storage.usedGB} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${colors.textSecondary}`}>Available</span>
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {storage.remainingGB} GB
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${colors.textSecondary}`}>Total</span>
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {storage.limitGB} GB
                    </span>
                  </div>
                </div>

                {usagePercentage >= 90 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">
                      ⚠️ Storage is nearly full. New downloads may be blocked.
                    </p>
                  </div>
                )}

                {usagePercentage >= 75 && usagePercentage < 90 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Storage is running low.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
