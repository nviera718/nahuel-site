import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Select } from './ui/select'
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

function StarRating({ value, onChange, label }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/70 block text-center">{label}</label>
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="p-0 hover:scale-110 transition-transform cursor-pointer bg-transparent border-0"
            onClick={() => onChange(star)}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-white/20 hover:text-white/40'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-sm font-medium text-white/60 text-center">{value}/5</div>
    </div>
  )
}

export function ClassificationForm({ classification, onChange, onSave, isSaving }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.08]">
      <h2 className="text-lg font-semibold text-white mb-5">Classification</h2>

      {/* Approval Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          variant={classification.isApproved === false ? 'destructive' : 'outline'}
          className={`h-11 justify-center gap-2 font-medium transition-all ${
            classification.isApproved === false
              ? 'bg-red-600 hover:bg-red-700 text-white border-0'
              : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
          }`}
          onClick={() => onChange({ ...classification, isApproved: false })}
        >
          <Trash2 className="w-4 h-4" />
          Trash
        </Button>
        <Button
          variant={classification.isApproved === true ? 'default' : 'outline'}
          className={`h-11 justify-center gap-2 font-medium transition-all ${
            classification.isApproved === true
              ? 'bg-green-600 hover:bg-green-700 text-white border-0'
              : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
          }`}
          onClick={() => onChange({ ...classification, isApproved: true })}
        >
          <Check className="w-4 h-4" />
          Approve
        </Button>
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
            className="space-y-6 pt-6 border-t border-white/[0.08] overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 block text-center">
                Trick Type
              </label>
              <Select
                value={classification.trickType}
                onChange={(e) => onChange({ ...classification, trickType: e.target.value })}
                className="bg-white/5 border-white/10 text-white h-11 focus:border-blue-500"
              >
                <option value="" className="bg-[#0f0f0f]">Select trick type...</option>
                {TRICK_TYPES.map(type => (
                  <option key={type} value={type} className="bg-[#0f0f0f]">{type}</option>
                ))}
              </Select>
            </div>

            <StarRating
              value={classification.trickRanking}
              onChange={(value) => onChange({ ...classification, trickRanking: value })}
              label="Trick Ranking"
            />

            <StarRating
              value={classification.trickDifficulty}
              onChange={(value) => onChange({ ...classification, trickDifficulty: value })}
              label="Trick Difficulty"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t border-white/[0.08]">
        <Button
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={classification.isApproved === null || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Classification'}
        </Button>
      </div>
    </div>
  )
}
