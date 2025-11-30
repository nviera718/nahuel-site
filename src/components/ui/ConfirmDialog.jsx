import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
}) {
  const { colors } = useTheme()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-xl max-w-md w-full mx-4 p-6`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 ${colors.textMuted} hover:${colors.text} transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-lg font-semibold ${colors.text} mb-2`}>
          {title}
        </h2>

        <p className={`${colors.textSecondary} mb-6`}>
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 ${colors.bgTertiary} ${colors.text} rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
