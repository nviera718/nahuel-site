import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { CategoriesPage } from './pages/CategoriesPage'
import { HomePage } from './pages/HomePage'
import { ProfileVideosPage } from './pages/ProfileVideosPage'
import { VideoClassifierPage } from './pages/VideoClassifierPage'
import { ClipVideoPage } from './pages/ClipVideoPage'
import { WelcomePage } from './pages/WelcomePage'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WelcomePage,
})

// Categories landing page
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm',
  component: CategoriesPage,
})

// Profiles page (within a category)
const categoryProfilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/$categorySlug',
  component: HomePage,
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
  path: '/content-farm/$categorySlug/$profileId',
  component: ProfileVideosPage,
  validateSearch: (search) => ({
    status: search.status || '',
    trickType: search.trickType || '',
    videoUrl: search.videoUrl || '',
    q: search.q || '',
  }),
})

const classifierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/$categorySlug/$profileId/classify/$postId',
  component: VideoClassifierPage,
})

const clipVideoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/$categorySlug/$profileId/classify/$postId/clip',
  component: ClipVideoPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  categoriesRoute,
  categoryProfilesRoute,
  profileVideosRoute,
  classifierRoute,
  clipVideoRoute,
])

export const router = createRouter({ routeTree })
