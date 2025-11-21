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
          <p className={`text-lg md:text-xl ${colors.textSecondary}`}>
            Welcome to my corner of the internet
          </p>
        </div>
      </main>
    </div>
  )
}
