import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Check, Star } from 'lucide-react'

const TRICK_TYPES = [
  'Rail',
  'Gap',
  'Half Pipe',
  'Ledge',
  'Stairs',
  'Manual',
  'Flip Trick',
  'Grind',
  'Other'
]

function StarRating({ value, onChange, label, darkMode }) {
  const labelColor = darkMode ? 'text-[#aaaaaa]' : 'text-[#606060]'
  const emptyStarColor = darkMode ? 'text-[#3f3f3f] hover:text-[#606060]' : 'text-[#d0d0d0] hover:text-[#a0a0a0]'

  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium block text-center ${labelColor}`}>{label}</label>
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="p-1 hover:scale-110 transition-transform cursor-pointer bg-transparent border-0"
            onClick={() => onChange(star)}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : emptyStarColor
              }`}
            />
          </button>
        ))}
      </div>
      <div className={`text-sm font-medium text-center ${labelColor}`}>{value}/5</div>
    </div>
  )
}

export function ClassificationForm({ classification, onChange, onSave, isSaving, darkMode = true }) {
  // YouTube-inspired colors
  const colors = darkMode
    ? {
        cardBg: 'bg-[#272727]',
        cardBorder: 'border-[#3f3f3f]',
        text: 'text-[#f1f1f1]',
        textSecondary: 'text-[#aaaaaa]',
        buttonBg: 'bg-[#3f3f3f]',
        buttonHover: 'hover:bg-[#4f4f4f]',
        inputBg: 'bg-[#121212]',
        inputBorder: 'border-[#3f3f3f]',
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
    <div className={`${colors.cardBg} rounded-xl p-6 border ${colors.cardBorder}`}>
      <h2 className={`text-lg font-semibold ${colors.text} mb-5`}>Classification</h2>

      {/* Approval Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          className={`h-11 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${
            classification.isApproved === false
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
          }`}
          onClick={() => onChange({ ...classification, isApproved: false })}
        >
          <Trash2 className="w-4 h-4" />
          Trash
        </button>
        <button
          className={`h-11 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${
            classification.isApproved === true
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
          }`}
          onClick={() => onChange({ ...classification, isApproved: true })}
        >
          <Check className="w-4 h-4" />
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
            transition={{ duration: 0.2 }}
            className={`space-y-6 pt-6 border-t ${colors.cardBorder} overflow-hidden`}
          >
            <div className="space-y-2">
              <label className={`text-sm font-medium block text-center ${colors.textSecondary}`}>
                Trick Type
              </label>
              <select
                value={classification.trickType}
                onChange={(e) => onChange({ ...classification, trickType: e.target.value })}
                className={`w-full h-11 rounded-lg px-3 ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors`}
                style={{ backgroundColor: colors.optionBg }}
              >
                <option value="" style={{ backgroundColor: colors.optionBg }}>Select trick type...</option>
                {TRICK_TYPES.map(type => (
                  <option key={type} value={type} style={{ backgroundColor: colors.optionBg }}>{type}</option>
                ))}
              </select>
            </div>

            <StarRating
              value={classification.trickRanking}
              onChange={(value) => onChange({ ...classification, trickRanking: value })}
              label="Trick Ranking"
              darkMode={darkMode}
            />

            <StarRating
              value={classification.trickDifficulty}
              onChange={(value) => onChange({ ...classification, trickDifficulty: value })}
              label="Trick Difficulty"
              darkMode={darkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className={`mt-6 pt-6 border-t ${colors.cardBorder}`}>
        <button
          className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={classification.isApproved === null || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Classification'}
        </button>
      </div>
    </div>
  )
}
