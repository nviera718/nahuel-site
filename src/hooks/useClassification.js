import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'

export function useClassification(postId) {
  return useQuery({
    queryKey: ['classification', postId],
    queryFn: () => api.classifications.getByPostId(postId),
    enabled: !!postId,
    retry: false,
  })
}

export function useCreateClassification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.classifications.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classification', data.post_id] })
    },
  })
}

export function useUpdateClassification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.classifications.update(data.postId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classification', data.post_id] })
    },
  })
}
