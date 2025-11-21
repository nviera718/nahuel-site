import { useState, useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { InstagramEmbed } from './components/InstagramEmbed'
import { ClassificationForm } from './components/ClassificationForm'
import { usePost } from './hooks/usePost'
import { useClassification, useCreateClassification, useUpdateClassification } from './hooks/useClassification'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function VideoClassifierContent() {
  const [currentPostId, setCurrentPostId] = useState(1)
  const [darkMode, setDarkMode] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const loadingTimeout = useRef(null)
  const [classification, setClassification] = useState({
    isApproved: null,
    trickType: '',
    trickRanking: 0,
    trickDifficulty: 0,
  })

  const { data: post, isLoading: postLoading } = usePost(currentPostId)
  const { data: existingClassification, isLoading: classificationLoading } = useClassification(currentPostId)
  const createClassification = useCreateClassification()
  const updateClassification = useUpdateClassification()

  const isLoading = postLoading || classificationLoading

  // Debounce loading state to prevent flicker
  useEffect(() => {
    if (isLoading) {
      loadingTimeout.current = setTimeout(() => {
        setShowLoading(true)
      }, 200)
    } else {
      clearTimeout(loadingTimeout.current)
      setShowLoading(false)
    }

    return () => clearTimeout(loadingTimeout.current)
  }, [isLoading])

  // Load existing classification when it changes
  useEffect(() => {
    if (existingClassification) {
      setClassification({
        isApproved: existingClassification.is_approved,
        trickType: existingClassification.trick_type || '',
        trickRanking: existingClassification.trick_ranking || 0,
        trickDifficulty: existingClassification.trick_difficulty || 0,
      })
    } else {
      setClassification({
        isApproved: null,
        trickType: '',
        trickRanking: 0,
        trickDifficulty: 0,
      })
    }
  }, [existingClassification, currentPostId])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentPostId > 1) {
        setCurrentPostId(prev => prev - 1)
      } else if (e.key === 'ArrowRight') {
        setCurrentPostId(prev => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPostId])

  const handleSave = async () => {
    const payload = {
      post_id: currentPostId,
      is_approved: classification.isApproved,
      trick_type: classification.trickType || null,
      trick_ranking: classification.trickRanking || null,
      trick_difficulty: classification.trickDifficulty || null,
    }

    try {
      if (existingClassification) {
        await updateClassification.mutateAsync(payload)
      } else {
        await createClassification.mutateAsync(payload)
      }
      setCurrentPostId(prev => prev + 1)
    } catch (error) {
      console.error('Failed to save classification:', error)
    }
  }

  const isSaving = createClassification.isPending || updateClassification.isPending

  // YouTube-inspired color palette
  const colors = darkMode
    ? {
        bg: 'bg-[#0f0f0f]',
        bgSecondary: 'bg-[#272727]',
        bgHover: 'hover:bg-[#3f3f3f]',
        text: 'text-[#f1f1f1]',
        textSecondary: 'text-[#aaaaaa]',
        border: 'border-[#3f3f3f]',
      }
    : {
        bg: 'bg-[#f9f9f9]',
        bgSecondary: 'bg-white',
        bgHover: 'hover:bg-[#e5e5e5]',
        text: 'text-[#0f0f0f]',
        textSecondary: 'text-[#606060]',
        border: 'border-[#e5e5e5]',
      }

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} transition-colors duration-200 flex flex-col`}>
      {/* Header */}
      <header className={`flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <h1 className={`text-lg font-medium ${colors.text}`}>
            Video Classifier
          </h1>

          <div className="flex items-center gap-2">
            {/* Navigation */}
            <div className={`flex items-center gap-1 ${colors.bgSecondary} rounded-full px-1`}>
              <button
                onClick={() => setCurrentPostId(prev => Math.max(1, prev - 1))}
                disabled={currentPostId <= 1}
                className={`p-2 rounded-full transition-colors ${
                  currentPostId <= 1
                    ? 'opacity-30 cursor-not-allowed'
                    : colors.bgHover
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className={`text-sm font-medium px-3 min-w-[80px] text-center ${colors.textSecondary}`}>
                Post #{currentPostId}
              </span>

              <button
                onClick={() => setCurrentPostId(prev => prev + 1)}
                className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${colors.bgHover}`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-full">
          <AnimatePresence mode="wait">
            {showLoading && isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className={`flex flex-col items-center gap-3 ${colors.textSecondary}`}>
                  <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              </motion.div>
            ) : !post && !isLoading ? (
              <motion.div
                key="not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className={`text-center ${colors.textSecondary}`}>
                  <p className="text-lg">No post found</p>
                  <p className="text-sm mt-1">Try a different post ID</p>
                </div>
              </motion.div>
            ) : post ? (
              <motion.div
                key={currentPostId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
              >
                {/* Video Section */}
                <div className="flex items-center justify-center overflow-hidden">
                  <InstagramEmbed postUrl={post.post_url} />
                </div>

                {/* Classification Section */}
                <div className="flex items-start justify-center overflow-y-auto">
                  <div className="w-full max-w-md">
                    <ClassificationForm
                      classification={classification}
                      onChange={setClassification}
                      onSave={handleSave}
                      isSaving={isSaving}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function VideoClassifier() {
  return (
    <QueryClientProvider client={queryClient}>
      <VideoClassifierContent />
    </QueryClientProvider>
  )
}
