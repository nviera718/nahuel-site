import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Moon, Sun, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { InstagramEmbed } from '../components/InstagramEmbed'
import { ClassificationForm } from '../components/ClassificationForm'
import { usePost } from '../hooks/usePost'
import { useClassification, useCreateClassification, useUpdateClassification } from '../hooks/useClassification'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'

export function VideoClassifierPage() {
  const navigate = useNavigate()
  const { profileId, postId: initialPostId } = useParams({ from: '/content-farm/$profileId/classify/$postId' })
  const [currentPostId, setCurrentPostId] = useState(parseInt(initialPostId))
  const { darkMode, setDarkMode, colors } = useTheme()
  const [showLoading, setShowLoading] = useState(false)
  const loadingTimeout = useRef(null)
  const [classification, setClassification] = useState({
    isApproved: null,
    trickTypes: [],
    trickRanking: 0,
    trickDifficulty: 0,
    requiresClipping: null,
  })
  const formRef = useRef(null)

  // Fetch all videos for this profile to enable prev/next navigation
  const { data: profileVideos } = useQuery({
    queryKey: ['profile-videos', profileId],
    queryFn: () => api.posts.getWithReviewStatus({ profileId, limit: 1000 }),
    enabled: !!profileId,
  })

  // Get ordered list of post IDs for this profile
  const postIds = useMemo(() => {
    if (!profileVideos?.posts) return []
    return profileVideos.posts.map(p => p.id)
  }, [profileVideos])

  // Find current index in the profile's video list
  const currentIndex = useMemo(() => {
    return postIds.indexOf(currentPostId)
  }, [postIds, currentPostId])

  const { data: post, isLoading: postLoading } = usePost(currentPostId)
  const { data: existingClassification, isLoading: classificationLoading } = useClassification(currentPostId)
  const createClassification = useCreateClassification()
  const updateClassification = useUpdateClassification()

  const isLoading = postLoading || classificationLoading

  useEffect(() => {
    if (isLoading) {
      loadingTimeout.current = setTimeout(() => setShowLoading(true), 200)
    } else {
      clearTimeout(loadingTimeout.current)
      setShowLoading(false)
    }
    return () => clearTimeout(loadingTimeout.current)
  }, [isLoading])

  useEffect(() => {
    if (existingClassification) {
      setClassification({
        isApproved: existingClassification.is_approved,
        trickTypes: existingClassification.trick_type || [],
        trickRanking: existingClassification.trick_ranking || 0,
        trickDifficulty: existingClassification.trick_difficulty || 0,
        requiresClipping: existingClassification.requires_clipping ?? null,
      })
    } else {
      setClassification({
        isApproved: null,
        trickTypes: [],
        trickRanking: 0,
        trickDifficulty: 0,
        requiresClipping: null,
      })
    }
  }, [existingClassification, currentPostId])

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevPostId = postIds[currentIndex - 1]
      setCurrentPostId(prevPostId)
      navigate({ to: '/content-farm/$profileId/classify/$postId', params: { profileId, postId: prevPostId }, replace: true })
    }
  }

  const goToNext = () => {
    if (currentIndex < postIds.length - 1) {
      const nextPostId = postIds[currentIndex + 1]
      setCurrentPostId(nextPostId)
      navigate({ to: '/content-farm/$profileId/classify/$postId', params: { profileId, postId: nextPostId }, replace: true })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, postIds])

  const handleSave = async () => {
    const payload = {
      postId: currentPostId,
      isApproved: classification.isApproved,
      trickTypes: classification.trickTypes?.length ? classification.trickTypes : null,
      trickRanking: classification.trickRanking || null,
      trickDifficulty: classification.trickDifficulty || null,
      requiresClipping: classification.requiresClipping,
    }

    try {
      if (existingClassification) {
        await updateClassification.mutateAsync(payload)
      } else {
        await createClassification.mutateAsync(payload)
      }
      goToNext()
    } catch (error) {
      console.error('Failed to save classification:', error)
    }
  }

  const isSaving = createClassification.isPending || updateClassification.isPending
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < postIds.length - 1

  return (
    <div className={`h-screen w-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <header className={`h-14 flex-shrink-0 border-b ${colors.border} ${colors.bgSecondary}`}>
        <div className="h-full px-3 md:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate({ to: '/content-farm/$profileId', params: { profileId } })}
              className={`p-2 rounded-lg transition-colors ${colors.bgHover}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className={`text-sm md:text-base font-semibold ${colors.text}`}>Video Classifier</span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className={`flex items-center ${colors.bgTertiary} rounded-full`}>
              <button
                onClick={goToPrev}
                disabled={!canGoPrev}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${!canGoPrev ? 'opacity-30 cursor-not-allowed' : colors.bgHover}`}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <span className={`text-xs md:text-sm font-medium px-1 md:px-2 min-w-[50px] md:min-w-[60px] text-center ${colors.text}`}>
                {currentIndex >= 0 ? `${currentIndex + 1}/${postIds.length}` : '...'}
              </span>
              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${!canGoNext ? 'opacity-30 cursor-not-allowed' : colors.bgHover}`}
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 md:p-2 rounded-full transition-colors ${colors.bgHover}`}
            >
              {darkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
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
                <p>No post found</p>
              </div>
            </motion.div>
          ) : post ? (
            <motion.div
              key={currentPostId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-full flex flex-col lg:flex-row lg:pt-20 items-center lg:items-start lg:justify-center gap-4 lg:gap-8 p-4 lg:px-8"
            >
              {/* Video embed */}
              <div className="flex-shrink-0 w-full max-w-[400px] lg:max-w-none lg:w-auto pt-2">
                <InstagramEmbed postUrl={post.post_url} />
              </div>

              {/* Classification form */}
              <div ref={formRef} className="w-full max-w-md lg:pt-20 pb-8">
                <ClassificationForm
                  classification={classification}
                  onChange={(newClassification) => {
                    setClassification(newClassification)
                    // Scroll to form on mobile when user makes a selection
                    if (newClassification.isApproved !== null && classification.isApproved === null) {
                      setTimeout(() => {
                        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 100)
                    }
                  }}
                  onSave={handleSave}
                  isSaving={isSaving}
                  darkMode={darkMode}
                  onClipVideo={() => navigate({ to: '/content-farm/$profileId/classify/$postId/clip', params: { profileId, postId: currentPostId } })}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  )
}
