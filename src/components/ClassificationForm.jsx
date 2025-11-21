import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Check, Star } from 'lucide-react'

const TRICK_TYPES = [
  'Rail', 'Gap', 'Half Pipe', 'Ledge', 'Stairs', 'Manual', 'Flip Trick', 'Grind', 'Line', 'Other'
]

function StarRating({ value, onChange, label, darkMode }) {
  const labelColor = darkMode ? 'text-[#aaaaaa]' : 'text-[#606060]'
  const emptyStarColor = darkMode ? 'text-[#404040] hover:text-[#666666]' : 'text-[#d0d0d0] hover:text-[#a0a0a0]'

  return (
    <div className="flex items-center justify-between px-2">
      <span className={`text-sm ${labelColor}`}>{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="p-1 hover:scale-110 transition-transform cursor-pointer bg-transparent border-0"
            onClick={() => onChange(star)}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : emptyStarColor
              }`}
            />
          </button>
        ))}
        <span className={`text-sm ml-2 w-8 text-right tabular-nums ${labelColor}`}>{value}/5</span>
      </div>
    </div>
  )
}

export function ClassificationForm({ classification, onChange, onSave, isSaving, darkMode = true }) {
  const colors = darkMode
    ? {
        cardBg: 'bg-[#181818]',
        cardBorder: 'border-[#303030]',
        text: 'text-[#f1f1f1]',
        textSecondary: 'text-[#aaaaaa]',
        buttonBg: 'bg-[#272727]',
        buttonHover: 'hover:bg-[#3a3a3a]',
        inputBg: 'bg-[#0f0f0f]',
        inputBorder: 'border-[#303030]',
        inputText: 'text-[#f1f1f1]',
        optionBg: '#0f0f0f',
        shadow: 'shadow-lg shadow-black/20',
      }
    : {
        cardBg: 'bg-white',
        cardBorder: 'border-[#e0e0e0]',
        text: 'text-[#0f0f0f]',
        textSecondary: 'text-[#606060]',
        buttonBg: 'bg-[#f2f2f2]',
        buttonHover: 'hover:bg-[#e5e5e5]',
        inputBg: 'bg-[#f9f9f9]',
        inputBorder: 'border-[#e0e0e0]',
        inputText: 'text-[#0f0f0f]',
        optionBg: '#ffffff',
        shadow: 'shadow-lg shadow-black/10',
      }

  return (
    <div className={`${colors.cardBg} rounded-2xl p-10 border ${colors.cardBorder} ${colors.shadow}`}>
      <h3 className={`text-lg font-semibold ${colors.text} mb-8`}>Classification</h3>

      {/* Approval Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          className={`h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ${
            classification.isApproved === false
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
          }`}
          onClick={() => onChange({ ...classification, isApproved: false })}
        >
          <Trash2 className="w-4 h-4" />
          Trash
        </button>
        <button
          className={`h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all ${
            classification.isApproved === true
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
          }`}
          onClick={() => onChange({ ...classification, isApproved: true })}
        >
          <Check className="w-4 h-4" />
          Approve
        </button>
      </div>

      {/* Save Button - only visible after selection made */}
      <AnimatePresence>
        {classification.isApproved !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-6">
              <button
                className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Classification'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classification Form - expands below when approved */}
      <AnimatePresence mode="wait">
        {classification.isApproved === true && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`space-y-2 pt-6 mt-6 border-t ${colors.cardBorder}`}>
              <div className="flex items-center justify-between py-2">
                <span className={`text-sm ${colors.textSecondary}`}>Trick Type</span>
                <select
                  value={classification.trickType}
                  onChange={(e) => onChange({ ...classification, trickType: e.target.value })}
                  className={`h-10 rounded-lg px-3 text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                  style={{ backgroundColor: colors.optionBg }}
                >
                  <option value="" style={{ backgroundColor: colors.optionBg }}>Select type...</option>
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

              <div className="flex items-center justify-between py-2 px-2">
                <span className={`text-sm ${colors.textSecondary}`}>Requires Clipping</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ ...classification, requiresClipping: false })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      classification.requiresClipping === false
                        ? 'bg-green-500 text-white'
                        : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...classification, requiresClipping: true })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      classification.requiresClipping === true
                        ? 'bg-orange-500 text-white'
                        : `${colors.buttonBg} ${colors.buttonHover} ${colors.text}`
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
