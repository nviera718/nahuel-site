import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)

  const colors = darkMode
    ? {
        bg: 'bg-[#0f0f0f]',
        bgSecondary: 'bg-[#181818]',
        bgTertiary: 'bg-[#272727]',
        bgHover: 'hover:bg-[#272727]',
        text: 'text-[#f1f1f1]',
        textSecondary: 'text-[#aaaaaa]',
        textMuted: 'text-[#606060]',
        border: 'border-[#272727]',
      }
    : {
        bg: 'bg-[#f9f9f9]',
        bgSecondary: 'bg-white',
        bgTertiary: 'bg-[#f2f2f2]',
        bgHover: 'hover:bg-[#f2f2f2]',
        text: 'text-[#0f0f0f]',
        textSecondary: 'text-[#606060]',
        textMuted: 'text-[#909090]',
        border: 'border-[#e5e5e5]',
      }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
