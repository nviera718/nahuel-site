import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Plus, FolderOpen, Trash2 } from 'lucide-react'
import { api } from '../lib/api-client'
import { useTheme } from '../context/ThemeContext'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Header } from '../components/ui/Header'

function AddCategoryDialog({ isOpen, onClose, onSubmit, isLoading, error }) {
  const { colors } = useTheme()
  const [name, setName] = useState('')

  // Clear input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName('')
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative ${colors.bgSecondary} border ${colors.border} rounded-lg shadow-xl max-w-md w-full mx-4 p-6`}>
        <h2 className={`text-lg font-semibold ${colors.text} mb-4`}>Add Category</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g., Snowboarding)"
            className={`w-full px-4 py-3 ${colors.bgTertiary} border ${colors.border} rounded-lg text-sm ${colors.text} placeholder:${colors.textMuted} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 mb-3`}
            autoFocus
            disabled={isLoading}
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 ${colors.bgTertiary} ${colors.text} rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CategoryCard({ category, onClick, onDelete, colors }) {
  const profileCount = parseInt(category.profile_count) || 0
  const totalPosts = parseInt(category.total_posts) || 0
  const unreviewedPosts = parseInt(category.unreviewed_posts) || 0
  const reviewedPosts = totalPosts - unreviewedPosts
  const percentage = totalPosts > 0 ? Math.round((reviewedPosts / totalPosts) * 100) : 0

  return (
    <div
      onClick={onClick}
      className={`${colors.bgSecondary} rounded-lg border ${colors.border} p-6 cursor-pointer ${colors.bgHover} transition-colors group relative`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(category)
        }}
        className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors.bgTertiary} flex items-center justify-center`}>
          <FolderOpen className={`w-6 h-6 ${colors.textSecondary}`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${colors.text}`}>{category.name}</h3>
          <p className={`text-sm ${colors.textSecondary}`}>
            {profileCount} {profileCount === 1 ? 'profile' : 'profiles'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={colors.textSecondary}>Posts reviewed</span>
          <span className={`${colors.text} tabular-nums`}>
            {reviewedPosts} / {totalPosts}
          </span>
        </div>
        <div className={`h-2 ${colors.bgTertiary} rounded-full overflow-hidden`}>
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function CategoriesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { darkMode, setDarkMode, colors } = useTheme()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addError, setAddError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (name) => api.categories.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setAddDialogOpen(false)
      setAddError(null)
    },
    onError: (error) => {
      setAddError(error.response?.data?.error || 'Failed to create category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    },
  })

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const categories = data?.categories || []

  const breadcrumbItems = [
    { label: 'Content Farm', to: { to: '/content-farm' } },
    { label: 'Categories' },
  ]

  return (
    <div className={`h-screen ${colors.bg} ${colors.text} flex flex-col`}>
      <Header breadcrumbItems={breadcrumbItems} showUserProfile={true} />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Categories</h1>
            <button
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`w-8 h-8 border-2 ${colors.textSecondary} border-t-transparent rounded-full animate-spin`} />
            </div>
          ) : categories.length === 0 ? (
            <div className={`text-center py-20 ${colors.textSecondary}`}>
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No categories yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  colors={colors}
                  onClick={() => navigate({ to: '/content-farm/categories/$categorySlug', params: { categorySlug: category.slug } })}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddCategoryDialog
        isOpen={addDialogOpen}
        onClose={() => { setAddDialogOpen(false); setAddError(null); }}
        onSubmit={(name) => createMutation.mutate(name)}
        isLoading={createMutation.isPending}
        error={addError}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setCategoryToDelete(null); }}
        onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
        title="Delete Category"
        message={categoryToDelete
          ? `Are you sure you want to delete "${categoryToDelete.name}"? ${parseInt(categoryToDelete.profile_count) > 0 ? `This category has ${categoryToDelete.profile_count} profiles - you must move or delete them first.` : ''}`
          : ''
        }
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
