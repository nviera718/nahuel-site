import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function MultiSelect({
  options,
  value = [],
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

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const removeOption = (optionValue, e) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
  }

  const clearAll = (e) => {
    e.stopPropagation()
    onChange([])
  }

  const selectedLabels = options.filter(o => value.includes(o.value))

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 ${colors.bgTertiary} border ${colors.border} rounded-lg text-sm ${colors.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500`}
      >
        <div className="flex-1 flex items-center gap-1 flex-wrap min-h-[20px]">
          {selectedLabels.length === 0 ? (
            <span className={colors.textMuted}>{placeholder}</span>
          ) : (
            selectedLabels.map(option => (
              <span
                key={option.value}
                className={`inline-flex items-center gap-1 px-2 py-0.5 ${colors.bgSecondary} rounded text-xs`}
              >
                {option.label}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-400"
                  onClick={(e) => removeOption(option.value, e)}
                />
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <X
              className={`w-4 h-4 ${colors.textMuted} hover:${colors.text} cursor-pointer`}
              onClick={clearAll}
            />
          )}
          <ChevronDown className={`w-4 h-4 ${colors.textMuted} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-lg max-h-60 overflow-auto`}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${colors.bgHover} transition-colors`}
            >
              <div className={`w-4 h-4 rounded border ${value.includes(option.value) ? 'bg-blue-500 border-blue-500' : colors.border} flex items-center justify-center`}>
                {value.includes(option.value) && <Check className="w-3 h-3 text-white" />}
              </div>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
