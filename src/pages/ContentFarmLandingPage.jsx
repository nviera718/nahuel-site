import { useNavigate } from '@tanstack/react-router'
import { Moon, Sun, FolderOpen, Scissors, Film } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function NavCard({ title, description, icon: Icon, onClick, colors }) {
  return (
    <div
      onClick={onClick}
      className={`${colors.bgSecondary} rounded-lg border ${colors.border} p-6 cursor-pointer ${colors.bgHover} transition-colors`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-12 h-12 rounded-lg ${colors.bgTertiary} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.textSecondary}`} />
        </div>
        <h3 className={`text-lg font-semibold ${colors.text}`}>{title}</h3>
      </div>
      <p className={`text-sm ${colors.textSecondary}`}>{description}</p>
    </div>
  )
}

export function ContentFarmLandingPage() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode, colors } = useTheme()

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          <span className="text-base font-semibold">Content Farm</span>
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
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <div className="grid gap-4 md:grid-cols-3">
            <NavCard
              title="Classification"
              description="Categorize video contents. Manage profile's and their categories"
              icon={FolderOpen}
              onClick={() => navigate({ to: '/content-farm/categories' })}
              colors={colors}
            />
            <NavCard
              title="Post Processing"
              description="Process and refine video clips"
              icon={Scissors}
              onClick={() => navigate({ to: '/content-farm/post-processing' })}
              colors={colors}
            />
            <NavCard
              title="Production"
              description="Create and manage production-ready clips"
              icon={Film}
              onClick={() => navigate({ to: '/content-farm/production' })}
              colors={colors}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
