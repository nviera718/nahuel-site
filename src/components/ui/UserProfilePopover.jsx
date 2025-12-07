import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { User, LogOut, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function UserProfilePopover() {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const { colors } = useTheme()
  const { user, isAuthenticated, isLoading, logout } = useAuth0()

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

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  // Don't render if not authenticated or still loading
  if (isLoading || !isAuthenticated || !user) {
    return null
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-0.5 rounded-full transition-colors ${colors.bgHover} ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
        title="User Profile"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full ${colors.bgTertiary} flex items-center justify-center`}>
            <User className="w-5 h-5" />
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-xl z-50`}
          style={{ top: '100%' }}
        >
          {/* Header */}
          <div className={`p-3 border-b ${colors.border} flex items-center justify-between`}>
            <h3 className={`font-semibold ${colors.text}`}>Profile</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded transition-colors ${colors.bgHover}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full ${colors.bgTertiary} flex items-center justify-center`}>
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${colors.text} truncate`}>
                  {user.name || 'User'}
                </div>
                <div className={`text-sm ${colors.textSecondary} truncate`}>
                  {user.email || ''}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
