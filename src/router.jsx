import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { HomePage } from './pages/HomePage'
import { ProfileVideosPage } from './pages/ProfileVideosPage'
import { VideoClassifierPage } from './pages/VideoClassifierPage'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const profileVideosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profiles/$profileId',
  component: ProfileVideosPage,
})

const classifierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profiles/$profileId/classify/$postId',
  component: VideoClassifierPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileVideosRoute,
  classifierRoute,
])

export const router = createRouter({ routeTree })
