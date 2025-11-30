import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = ''
}) {
  const { colors } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 ${colors.bgTertiary} border ${colors.border} rounded-lg text-sm ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
      >
        <span className={selectedOption ? colors.text : colors.textMuted}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 ${colors.textMuted} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-lg max-h-60 overflow-auto`}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-sm text-left ${colors.bgHover} transition-colors ${value === option.value ? 'bg-blue-500/20' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
