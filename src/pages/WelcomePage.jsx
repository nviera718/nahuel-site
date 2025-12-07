import { useTheme } from '../context/ThemeContext'
import { Header } from '../components/ui/Header'

export function WelcomePage() {
  const { darkMode, setDarkMode, colors } = useTheme()

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={[]} showQueue={false} showStorage={false} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Hey, I'm Nahuel :)</h1>
          <p className={`text-lg md:text-xl ${colors.textSecondary}`}>
            Welcome to my corner of the internet
          </p>
        </div>
      </main>
    </div>
  )
}
