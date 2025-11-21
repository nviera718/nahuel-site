import { Link } from '@tanstack/react-router'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export function WelcomePage() {
  const { darkMode, setDarkMode, colors } = useTheme()

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-6xl mx-auto">
          <span className="text-base font-semibold">Nahuel Viera</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Hey, I'm Nahuel</h1>
          <p className={`text-lg md:text-xl ${colors.textSecondary} mb-8`}>
            Welcome to my corner of the internet
          </p>
          <Link
            to="/content-farm"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Content Farm →
          </Link>
        </div>
      </main>
    </div>
  )
}
