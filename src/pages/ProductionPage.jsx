import { Moon, Sun, ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '../context/ThemeContext'

export function ProductionPage() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode, colors } = useTheme()

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/content-farm' })}
              className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold">Production</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center py-20 ${colors.textSecondary}`}>
            <p className="text-lg">Production</p>
            <p className="mt-2">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
