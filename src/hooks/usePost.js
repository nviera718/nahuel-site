import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'

export function usePost(postId) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.posts.getById(postId),
    enabled: !!postId,
  })
}
