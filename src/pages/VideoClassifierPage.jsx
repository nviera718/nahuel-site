import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { InstagramEmbed } from '../components/InstagramEmbed'
import { ClassificationForm } from '../components/ClassificationForm'
import { usePost } from '../hooks/usePost'
import { useClassification, useCreateClassification, useUpdateClassification } from '../hooks/useClassification'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'
import { Header } from '../components/ui/Header'

export function VideoClassifierPage() {
  const navigate = useNavigate()
  const { categorySlug, profileId, postId: initialPostId } = useParams({ from: '/content-farm/categories/$categorySlug/$profileId/classify/$postId' })
  const [currentPostId, setCurrentPostId] = useState(parseInt(initialPostId))
  const [currentProfileId, setCurrentProfileId] = useState(parseInt(profileId))
  const { darkMode, setDarkMode, colors } = useTheme()
  const [showLoading, setShowLoading] = useState(false)
  const [showAllDone, setShowAllDone] = useState(false)
  const loadingTimeout = useRef(null)
  const autoSaveTimeout = useRef(null)
  const [classification, setClassification] = useState({
    isApproved: null,
    trickTypes: [],
    trickRanking: 0,
    trickDifficulty: 0,
    requiresClipping: null,
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const formRef = useRef(null)

  // Fetch current profile info
  const { data: profileData } = useQuery({
    queryKey: ['profile', currentProfileId],
    queryFn: () => api.profiles.getById(currentProfileId),
    enabled: !!currentProfileId,
  })
  const profile = profileData?.profile

  // Fetch category info
  const { data: categoryData } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: () => api.categories.getBySlug(categorySlug),
    enabled: !!categorySlug,
  })
  const category = categoryData?.category

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Categories', to: { to: '/content-farm/categories' } },
    { label: category?.name || categorySlug, to: { to: '/content-farm/categories/$categorySlug', params: { categorySlug } } },
    { label: profile?.username || 'Profile', to: { to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId: currentProfileId } } },
    { label: 'Classify' },
  ]

  // Fetch all profiles with unreviewed videos in this category
  const { data: profilesData } = useQuery({
    queryKey: ['profiles-with-stats', categorySlug],
    queryFn: () => api.profiles.getWithReviewStats({ category: categorySlug, reviewStatus: 'has_unreviewed', limit: 1000 }),
    enabled: !!categorySlug,
  })

  // Get profiles that have unreviewed posts, sorted by ID for consistent ordering
  const profilesWithUnreviewed = useMemo(() => {
    if (!profilesData?.profiles) return []
    return profilesData.profiles
      .filter(p => parseInt(p.unreviewed_posts) > 0)
      .sort((a, b) => a.id - b.id)
  }, [profilesData])

  // Find current profile index
  const currentProfileIndex = useMemo(() => {
    return profilesWithUnreviewed.findIndex(p => p.id === currentProfileId)
  }, [profilesWithUnreviewed, currentProfileId])

  // Fetch all videos for this profile to enable prev/next navigation
  const { data: profileVideos } = useQuery({
    queryKey: ['profile-videos', currentProfileId],
    queryFn: () => api.posts.getWithReviewStatus({ profileId: currentProfileId, limit: 1000 }),
    enabled: !!currentProfileId,
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
  const isSaving = createClassification.isPending || updateClassification.isPending

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
    setHasUnsavedChanges(false)
  }, [existingClassification, currentPostId])

  // Auto-save function
  const saveClassification = useCallback(async (classificationToSave) => {
    if (classificationToSave.isApproved === null) return

    const payload = {
      postId: currentPostId,
      isApproved: classificationToSave.isApproved,
      trickTypes: classificationToSave.trickTypes?.length ? classificationToSave.trickTypes : null,
      trickRanking: classificationToSave.trickRanking || null,
      trickDifficulty: classificationToSave.trickDifficulty || null,
      requiresClipping: classificationToSave.requiresClipping,
    }

    try {
      if (existingClassification) {
        await updateClassification.mutateAsync(payload)
      } else {
        await createClassification.mutateAsync(payload)
      }
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save classification:', error)
    }
  }, [currentPostId, existingClassification, createClassification, updateClassification])

  // Auto-save effect with debounce
  useEffect(() => {
    if (!hasUnsavedChanges || classification.isApproved === null) return

    // Clear any pending auto-save
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }

    // Debounce the save by 500ms
    autoSaveTimeout.current = setTimeout(() => {
      saveClassification(classification)
    }, 500)

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [classification, hasUnsavedChanges, saveClassification])

  // Navigate to a specific profile's first video
  const goToProfile = useCallback((newProfileId, firstPostId) => {
    setCurrentProfileId(newProfileId)
    setCurrentPostId(firstPostId)
    setShowAllDone(false)
    navigate({
      to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId',
      params: { categorySlug, profileId: newProfileId, postId: firstPostId },
      replace: true
    })
  }, [categorySlug, navigate])

  // Find the next profile with unreviewed videos
  const getNextProfile = useCallback(() => {
    if (profilesWithUnreviewed.length === 0) return null

    // Look for profiles after current one
    for (let i = currentProfileIndex + 1; i < profilesWithUnreviewed.length; i++) {
      const nextProfile = profilesWithUnreviewed[i]
      if (parseInt(nextProfile.unreviewed_posts) > 0 && nextProfile.id !== currentProfileId) {
        return nextProfile
      }
    }

    // If none found after, look from the beginning (excluding current)
    for (let i = 0; i < currentProfileIndex; i++) {
      const nextProfile = profilesWithUnreviewed[i]
      if (parseInt(nextProfile.unreviewed_posts) > 0 && nextProfile.id !== currentProfileId) {
        return nextProfile
      }
    }

    return null
  }, [profilesWithUnreviewed, currentProfileIndex, currentProfileId])

  const goToPrev = useCallback(() => {
    if (showAllDone) {
      // Go back to last video
      if (postIds.length > 0) {
        const lastPostId = postIds[postIds.length - 1]
        setCurrentPostId(lastPostId)
        setShowAllDone(false)
        navigate({ to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId', params: { categorySlug, profileId: currentProfileId, postId: lastPostId }, replace: true })
      }
      return
    }

    if (currentIndex > 0) {
      const prevPostId = postIds[currentIndex - 1]
      setCurrentPostId(prevPostId)
      navigate({ to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId', params: { categorySlug, profileId: currentProfileId, postId: prevPostId }, replace: true })
    }
  }, [currentIndex, postIds, categorySlug, currentProfileId, navigate, showAllDone])

  const goToNext = useCallback(async () => {
    if (showAllDone) return

    if (currentIndex < postIds.length - 1) {
      // More videos in current profile
      const nextPostId = postIds[currentIndex + 1]
      setCurrentPostId(nextPostId)
      navigate({ to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId', params: { categorySlug, profileId: currentProfileId, postId: nextPostId }, replace: true })
    } else {
      // At the last video - try to go to next profile
      const nextProfile = getNextProfile()

      if (nextProfile) {
        // Fetch the first video of the next profile
        try {
          const nextProfileVideos = await api.posts.getWithReviewStatus({ profileId: nextProfile.id, limit: 1 })
          if (nextProfileVideos?.posts?.length > 0) {
            goToProfile(nextProfile.id, nextProfileVideos.posts[0].id)
            return
          }
        } catch (error) {
          console.error('Failed to fetch next profile videos:', error)
        }
      }

      // No more profiles with videos - show all done
      setShowAllDone(true)
    }
  }, [currentIndex, postIds, categorySlug, currentProfileId, navigate, getNextProfile, goToProfile, showAllDone])

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
  }, [goToPrev, goToNext])

  const handleClassificationChange = (newClassification) => {
    setClassification(newClassification)
    setHasUnsavedChanges(true)

    // Scroll to form on mobile when user makes a selection
    if (newClassification.isApproved !== null && classification.isApproved === null) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const canGoPrev = currentIndex > 0 || showAllDone
  const canGoNext = !showAllDone
  const isLastVideo = currentIndex === postIds.length - 1

  return (
    <div className={`h-screen w-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={breadcrumbItems}>
        <div className={`flex items-center ${colors.bgTertiary} rounded-full`}>
          <button
            onClick={goToPrev}
            disabled={!canGoPrev}
            className={`p-1.5 md:p-2 rounded-full transition-colors ${!canGoPrev ? 'opacity-30 cursor-not-allowed' : colors.bgHover}`}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <span className={`text-xs md:text-sm font-medium px-1 md:px-2 min-w-[50px] md:min-w-[60px] text-center ${colors.text}`}>
            {showAllDone ? 'Done' : currentIndex >= 0 ? `${currentIndex + 1}/${postIds.length}` : '...'}
          </span>
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className={`p-1.5 md:p-2 rounded-full transition-colors ${!canGoNext ? 'opacity-30 cursor-not-allowed' : colors.bgHover}`}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </Header>

      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {showAllDone ? (
            <motion.div
              key="all-done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className={`text-center ${colors.textSecondary} max-w-md mx-auto p-8`}>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>All Done!</h2>
                <p className="mb-6">You've reviewed all available videos in this category.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate({ to: '/content-farm/categories/$categorySlug/$profileId', params: { categorySlug, profileId: currentProfileId } })}
                    className={`px-6 py-3 ${colors.bgTertiary} ${colors.text} rounded-lg ${colors.bgHover} transition-colors`}
                  >
                    Back to {profile?.username || 'Profile'}
                  </button>
                  <button
                    onClick={() => navigate({ to: '/content-farm/categories/$categorySlug', params: { categorySlug } })}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Back to Profiles
                  </button>
                </div>
              </div>
            </motion.div>
          ) : showLoading && isLoading ? (
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
                <InstagramEmbed postUrl={post.post_url} darkMode={darkMode} />
              </div>

              {/* Classification form */}
              <div ref={formRef} className="w-full max-w-md lg:pt-20 pb-8">
                <ClassificationForm
                  classification={classification}
                  onChange={handleClassificationChange}
                  isSaving={isSaving}
                  darkMode={darkMode}
                  onClipVideo={() => navigate({ to: '/content-farm/categories/$categorySlug/$profileId/classify/$postId/clip', params: { categorySlug, profileId: currentProfileId, postId: currentPostId } })}
                />
                {isLastVideo && (
                  <p className={`text-center text-sm ${colors.textSecondary} mt-4`}>
                    Last video for this profile
                  </p>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  )
}
