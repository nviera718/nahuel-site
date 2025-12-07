import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { ContentFarmLandingPage } from './pages/ContentFarmLandingPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileVideosPage } from './pages/ProfileVideosPage'
import { VideoClassifierPage } from './pages/VideoClassifierPage'
import { ClipVideoPage } from './pages/ClipVideoPage'
import { PostProcessingPage } from './pages/PostProcessingPage'
import { ProductionPage } from './pages/ProductionPage'
import { WelcomePage } from './pages/WelcomePage'
import { ProtectedRoute } from './components/auth'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WelcomePage,
})

// Content farm landing page with navigation to categories, post-processing, production
const contentFarmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm',
  component: () => (
    <ProtectedRoute>
      <ContentFarmLandingPage />
    </ProtectedRoute>
  ),
})

// Categories page
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/categories',
  component: () => (
    <ProtectedRoute>
      <CategoriesPage />
    </ProtectedRoute>
  ),
})

// Post processing page
const postProcessingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/post-processing',
  component: () => (
    <ProtectedRoute>
      <PostProcessingPage />
    </ProtectedRoute>
  ),
})

// Production page
const productionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/production',
  component: () => (
    <ProtectedRoute>
      <ProductionPage />
    </ProtectedRoute>
  ),
})

// Profiles page (within a category)
const categoryProfilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/categories/$categorySlug',
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
  validateSearch: (search) => ({
    platform: search.platform || '',
    postStatus: search.postStatus || '',
    reviewStatus: search.reviewStatus || '',
    q: search.q || '',
    page: search.page || '',
  }),
})

const profileVideosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/categories/$categorySlug/$profileId',
  component: () => (
    <ProtectedRoute>
      <ProfileVideosPage />
    </ProtectedRoute>
  ),
  validateSearch: (search) => ({
    status: search.status || '',
    trickType: search.trickType || '',
    videoUrl: search.videoUrl || '',
    q: search.q || '',
  }),
})

const classifierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/categories/$categorySlug/$profileId/classify/$postId',
  component: () => (
    <ProtectedRoute>
      <VideoClassifierPage />
    </ProtectedRoute>
  ),
})

const clipVideoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/categories/$categorySlug/$profileId/classify/$postId/clip',
  component: () => (
    <ProtectedRoute>
      <ClipVideoPage />
    </ProtectedRoute>
  ),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  contentFarmRoute,
  categoriesRoute,
  postProcessingRoute,
  productionRoute,
  categoryProfilesRoute,
  profileVideosRoute,
  classifierRoute,
  clipVideoRoute,
])

export const router = createRouter({ routeTree })
