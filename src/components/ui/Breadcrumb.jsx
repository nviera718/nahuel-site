import { useState } from 'react'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '../../context/ThemeContext'

export function Breadcrumb({ items }) {
  const navigate = useNavigate()
  const { colors } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  // On mobile, show only last 2 items by default unless expanded
  const shouldCollapse = items.length > 3
  const visibleItems = shouldCollapse && !isExpanded
    ? [items[0], ...items.slice(-2)] // Show first and last 2 items
    : items

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      {visibleItems.map((item, index) => {
        const originalIndex = shouldCollapse && !isExpanded && index > 0
          ? items.indexOf(item)
          : index
        const isLast = originalIndex === items.length - 1
        const showCollapsedIndicator = shouldCollapse && !isExpanded && index === 1

        return (
          <div key={originalIndex} className="flex items-center gap-1 min-w-0">
            {index > 0 && (
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${colors.textMuted}`} />
            )}
            {showCollapsedIndicator ? (
              // Collapsed indicator - expand button
              <button
                onClick={() => setIsExpanded(true)}
                className={`p-1 rounded transition-colors ${colors.bgHover} md:hidden`}
                title="Show full path"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            ) : isLast ? (
              <span className={`font-medium truncate ${colors.text}`}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.to && navigate(item.to)}
                className={`${colors.textSecondary} hover:${colors.text} transition-colors truncate`}
              >
                {item.label}
              </button>
            )}
          </div>
        )
      })}

      {/* Collapse button when expanded on mobile */}
      {isExpanded && shouldCollapse && (
        <button
          onClick={() => setIsExpanded(false)}
          className={`ml-1 px-2 py-0.5 text-xs rounded ${colors.bgTertiary} ${colors.textSecondary} md:hidden`}
        >
          Collapse
        </button>
      )}
    </nav>
  )
}
