import { useState, useEffect } from 'react'
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
      // Reset form for new post
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

  // Apply dark/light mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

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

      // Move to next post after successful save
      setCurrentPostId(prev => prev + 1)
    } catch (error) {
      console.error('Failed to save classification:', error)
    }
  }

  const isSaving = createClassification.isPending || updateClassification.isPending
  const isLoading = postLoading || classificationLoading

  const themeClasses = darkMode
    ? 'bg-[#0f0f0f] text-white'
    : 'bg-gray-50 text-gray-900'

  const headerClasses = darkMode
    ? 'border-white/10 bg-[#0f0f0f]'
    : 'border-gray-200 bg-white'

  const buttonClasses = darkMode
    ? 'hover:bg-white/10 text-white'
    : 'hover:bg-gray-100 text-gray-900'

  const textSecondaryClasses = darkMode
    ? 'text-white/70'
    : 'text-gray-600'

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors overflow-hidden`}>
      {/* Header */}
      <header className={`border-b ${headerClasses}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Video Classifier
          </h1>

          <div className="flex items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPostId(prev => Math.max(1, prev - 1))}
                disabled={currentPostId <= 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPostId <= 1
                    ? 'opacity-30 cursor-not-allowed'
                    : buttonClasses
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className={`text-sm font-medium px-3 ${textSecondaryClasses}`}>
                Post #{currentPostId}
              </span>

              <button
                onClick={() => setCurrentPostId(prev => prev + 1)}
                className={`p-2 rounded-lg transition-colors ${buttonClasses}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${buttonClasses}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-73px)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-8 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className={textSecondaryClasses}>
                Loading...
              </div>
            </div>
          ) : !post ? (
            <div className="flex items-center justify-center h-full">
              <div className={textSecondaryClasses}>
                No post found
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPostId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full"
              >
                {/* Video Section */}
                <div className="flex items-center justify-center overflow-auto">
                  <InstagramEmbed postUrl={post.post_url} />
                </div>

                {/* Classification Section */}
                <div className="flex items-start justify-center overflow-auto">
                  <div className="w-full max-w-md">
                    <ClassificationForm
                      classification={classification}
                      onChange={setClassification}
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
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
