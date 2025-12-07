import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Breadcrumb } from './Breadcrumb'
import { ScrapeQueuePopover } from './ScrapeQueuePopover'
import { StorageIndicator } from './StorageIndicator'
import { UserProfilePopover } from './UserProfilePopover'

/**
 * Consolidated Header component for all pages
 *
 * @param {Object} props
 * @param {Array} props.breadcrumbItems - Array of breadcrumb items { label, to }
 * @param {React.ReactNode} props.children - Additional toolbar items to render (page-specific)
 * @param {boolean} props.showQueue - Show scrape queue popover (default: true)
 * @param {boolean} props.showStorage - Show storage indicator (default: true)
 * @param {boolean} props.showThemeToggle - Show theme toggle (default: true)
 */
export function Header({
  breadcrumbItems = [],
  children,
  showQueue = true,
  showStorage = true,
  showThemeToggle = true
}) {
  const { colors, darkMode, setDarkMode } = useTheme()

  // Check if we're on a content-farm route
  const isContentFarmRoute = window.location.pathname.startsWith('/content-farm')

  return (
    <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Page-specific toolbar items */}
          {children}

          {/* Storage indicator */}
          {showStorage && <StorageIndicator />}

          {/* Scrape queue */}
          {showQueue && <ScrapeQueuePopover />}

          {/* User profile popover (only on content-farm routes) */}
          {isContentFarmRoute && <UserProfilePopover />}

          {/* Theme toggle */}
          {showThemeToggle && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
