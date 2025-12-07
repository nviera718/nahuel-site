import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '../context/ThemeContext'
import { Header } from '../components/ui/Header'

export function ProductionPage() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode, colors } = useTheme()

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Production' }
  ]

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={breadcrumbItems} showUserProfile={true}>
        <button
          onClick={() => navigate({ to: '/content-farm' })}
          className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </Header>

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
