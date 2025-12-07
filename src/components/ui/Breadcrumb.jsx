import { ChevronRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '../../context/ThemeContext'

export function Breadcrumb({ items }) {
  const navigate = useNavigate()
  const { colors } = useTheme()

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-1 min-w-0">
            {index > 0 && (
              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${colors.textMuted}`} />
            )}
            {isLast ? (
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
    </nav>
  )
}
