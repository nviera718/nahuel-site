import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Check, Star } from 'lucide-react'

const TRICK_TYPES = [
  'Rail', 'Gap', 'Half Pipe', 'Ledge', 'Stairs', 'Manual', 'Flip Trick', 'Grind', 'Other'
]

function StarRating({ value, onChange, label, darkMode }) {
  const labelColor = darkMode ? 'text-[#aaaaaa]' : 'text-[#606060]'
  const emptyStarColor = darkMode ? 'text-[#3f3f3f] hover:text-[#606060]' : 'text-[#d0d0d0] hover:text-[#a0a0a0]'

  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${labelColor}`}>{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="p-0.5 hover:scale-110 transition-transform cursor-pointer bg-transparent border-0"
            onClick={() => onChange(star)}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : emptyStarColor
              }`}
            />
          </button>
        ))}
        <span className={`text-xs ml-1 w-6 ${labelColor}`}>{value}/5</span>
      </div>
    </div>
  )
}

export function ClassificationForm({ classification, onChange, onSave, isSaving, darkMode = true }) {
  const colors = darkMode
    ? {
        cardBg: 'bg-[#212121]',
        cardBorder: 'border-[#303030]',
        text: 'text-[#f1f1f1]',
        textSecondary: 'text-[#aaaaaa]',
        buttonBg: 'bg-[#3f3f3f]',
        buttonHover: 'hover:bg-[#4f4f4f]',
        inputBg: 'bg-[#121212]',
        inputBorder: 'border-[#303030]',
        inputText: 'text-[#f1f1f1]',
        optionBg: '#121212',
      }
    : {
        cardBg: 'bg-white',
        cardBorder: 'border-[#e5e5e5]',
        text: 'text-[#0f0f0f]',
        textSecondary: 'text-[#606060]',
        buttonBg: 'bg-[#f2f2f2]',
        buttonHover: 'hover:bg-[#e5e5e5]',
        inputBg: 'bg-[#f9f9f9]',
        inputBorder: 'border-[#e5e5e5]',
        inputText: 'text-[#0f0f0f]',
        optionBg: '#ffffff',
      }

  return (
    <div className={`${colors.cardBg} rounded-lg p-4 border ${colors.cardBorder}`}>
      {/* Approval Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          className={`h-9 flex items-center justify-center gap-1.5 rounded text-sm font-medium transition-all ${
            classification.isApproved === false
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
          }`}
          onClick={() => onChange({ ...classification, isApproved: false })}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Trash
        </button>
        <button
          className={`h-9 flex items-center justify-center gap-1.5 rounded text-sm font-medium transition-all ${
            classification.isApproved === true
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
          }`}
          onClick={() => onChange({ ...classification, isApproved: true })}
        >
          <Check className="w-3.5 h-3.5" />
          Approve
        </button>
      </div>

      {/* Classification Form */}
      <AnimatePresence mode="wait">
        {classification.isApproved === true && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className={`space-y-3 pt-4 border-t ${colors.cardBorder} overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs ${colors.textSecondary}`}>Trick Type</span>
              <select
                value={classification.trickType}
                onChange={(e) => onChange({ ...classification, trickType: e.target.value })}
                className={`h-8 rounded px-2 text-xs ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                style={{ backgroundColor: colors.optionBg }}
              >
                <option value="" style={{ backgroundColor: colors.optionBg }}>Select...</option>
                {TRICK_TYPES.map(type => (
                  <option key={type} value={type} style={{ backgroundColor: colors.optionBg }}>{type}</option>
                ))}
              </select>
            </div>

            <StarRating
              value={classification.trickRanking}
              onChange={(value) => onChange({ ...classification, trickRanking: value })}
              label="Ranking"
              darkMode={darkMode}
            />

            <StarRating
              value={classification.trickDifficulty}
              onChange={(value) => onChange({ ...classification, trickDifficulty: value })}
              label="Difficulty"
              darkMode={darkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className={`mt-4 pt-4 border-t ${colors.cardBorder}`}>
        <button
          className="w-full h-9 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={classification.isApproved === null || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
