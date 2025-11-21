import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { HomePage } from './pages/HomePage'
import { ProfileVideosPage } from './pages/ProfileVideosPage'
import { VideoClassifierPage } from './pages/VideoClassifierPage'
import { WelcomePage } from './pages/WelcomePage'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WelcomePage,
})

const contentFarmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm',
  component: HomePage,
})

const profileVideosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/$profileId',
  component: ProfileVideosPage,
})

const classifierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/content-farm/$profileId/classify/$postId',
  component: VideoClassifierPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  contentFarmRoute,
  profileVideosRoute,
  classifierRoute,
])

export const router = createRouter({ routeTree })
