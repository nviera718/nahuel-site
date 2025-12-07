import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '../context/ThemeContext'
import { Header } from '../components/ui/Header'

export function PostProcessingPage() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode, colors } = useTheme()

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Post Processing' },
  ]

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={breadcrumbItems} showUserProfile={true} />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center py-20 ${colors.textSecondary}`}>
            <p className="text-lg">Post Processing</p>
            <p className="mt-2">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
